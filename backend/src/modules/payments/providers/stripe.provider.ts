import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { CancelSubscriptionDto } from '../dto/cancel-subscription.dto';

@Injectable()
export class StripeProvider {
  private readonly logger = new Logger(StripeProvider.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('stripe.secretKey'), {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutDto,
    customerEmail?: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const plan = await this.prisma.pricingPlan.findUnique({
        where: { slug: dto.planSlug },
      });

      if (!plan) {
        throw new BadRequestException('Pricing plan not found');
      }

      const priceId = dto.interval === 'yearly' ? plan.stripeYearlyPriceId : plan.stripePriceId;

      if (!priceId) {
        throw new BadRequestException(`Stripe price ID not configured for plan: ${dto.planSlug}`);
      }

      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: customerEmail,
        client_reference_id: userId,
        metadata: {
          userId,
          planSlug: dto.planSlug,
          interval: dto.interval || 'monthly',
          ...(dto.metadata as Record<string, string>),
        },
        success_url: dto.successUrl || `${this.configService.get<string>('app.frontendUrl')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: dto.cancelUrl || `${this.configService.get<string>('app.frontendUrl')}/payment/cancel`,
        subscription_data: {
          metadata: {
            userId,
            planSlug: dto.planSlug,
          },
        },
      });

      this.logger.log(`Stripe checkout session created: ${session.id}`);
      return session;
    } catch (error) {
      this.logger.error('Failed to create Stripe checkout session', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create checkout session');
    }
  }

  async createSubscription(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<Stripe.Subscription> {
    try {
      const plan = await this.prisma.pricingPlan.findUnique({
        where: { slug: dto.planSlug },
      });

      if (!plan) {
        throw new BadRequestException('Pricing plan not found');
      }

      const priceId = dto.interval === 'yearly' ? plan.stripeYearlyPriceId : plan.stripePriceId;

      if (!priceId) {
        throw new BadRequestException(`Stripe price ID not configured for plan: ${dto.planSlug}`);
      }

      let stripeCustomerId = dto.providerCustomerId;

      if (!stripeCustomerId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const customer = await this.stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: { userId },
        });
        stripeCustomerId = customer.id;
      }

      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        metadata: { userId, planSlug: dto.planSlug },
        ...(dto.paymentMethodId ? { default_payment_method: dto.paymentMethodId } : {}),
        expand: ['latest_invoice.payment_intent'],
      });

      this.logger.log(`Stripe subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to create Stripe subscription', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async cancelSubscription(
    userId: string,
    dto: CancelSubscriptionDto,
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: {
          userId,
          providerSubscriptionId: dto.subscriptionId,
          provider: 'STRIPE',
        },
      });

      if (!subscription) {
        throw new BadRequestException('Subscription not found');
      }

      const canceled = await this.stripe.subscriptions.update(
        dto.subscriptionId,
        {
          cancel_at_period_end: dto.atPeriodEnd ?? true,
          metadata: {
            cancelReason: dto.reason || 'User requested',
            canceledByUser: userId,
          },
        },
      );

      this.logger.log(`Stripe subscription canceled: ${dto.subscriptionId}`);
      return canceled;
    } catch (error) {
      this.logger.error('Failed to cancel Stripe subscription', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  async handleWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<{ received: boolean; type?: string }> {
    try {
      const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      this.logger.log(`Stripe webhook received: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleCheckoutCompleted(session);
          break;
        }
        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleInvoicePaid(invoice);
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleInvoicePaymentFailed(invoice);
          break;
        }
        case 'customer.subscription.updated': {
          const sub = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionUpdated(sub);
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionDeleted(sub);
          break;
        }
      }

      return { received: true, type: event.type };
    } catch (error) {
      this.logger.error('Stripe webhook verification failed', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  async listInvoices(
    userId: string,
    limit = 10,
    startingAfter?: string,
  ): Promise<Stripe.ApiList<Stripe.Invoice>> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: { userId, provider: 'STRIPE', status: { in: ['ACTIVE', 'CANCELED', 'PAST_DUE'] } },
        orderBy: { createdAt: 'desc' },
      });

      if (!subscription?.providerCustomerId) {
        return { data: [], has_more: false, object: 'list', url: '/v1/invoices' };
      }

      const invoices = await this.stripe.invoices.list({
        customer: subscription.providerCustomerId,
        limit,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      return invoices;
    } catch (error) {
      this.logger.error('Failed to list Stripe invoices', error);
      throw new InternalServerErrorException('Failed to list invoices');
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const userId = session.metadata?.userId;
      const planSlug = session.metadata?.planSlug;

      if (!userId || !planSlug) {
        this.logger.warn('Missing metadata in checkout session');
        return;
      }

      const plan = await this.prisma.pricingPlan.findUnique({ where: { slug: planSlug } });
      if (!plan) {
        this.logger.warn(`Plan not found: ${planSlug}`);
        return;
      }

      const existingSub = await this.prisma.subscription.findFirst({
        where: { userId, provider: 'STRIPE', status: { in: ['ACTIVE', 'TRIALING'] } },
      });

      if (existingSub) {
        await this.prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            planId: plan.id,
            providerSubscriptionId: session.subscription as string,
            providerCustomerId: session.customer as string,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            metadata: { checkoutSessionId: session.id },
          },
        });
        return;
      }

      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await this.prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: 'ACTIVE',
          provider: 'STRIPE',
          providerSubscriptionId: session.subscription as string,
          providerCustomerId: session.customer as string,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
          metadata: { checkoutSessionId: session.id },
        },
      });

      this.logger.log(`Subscription created for user ${userId} via checkout`);
    } catch (error) {
      this.logger.error('Error handling checkout completed', error);
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    try {
      if (!invoice.subscription) return;

      const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id;

      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: subscriptionId, provider: 'STRIPE' },
      });

      if (!subscription) {
        this.logger.warn(`Subscription not found: ${subscriptionId}`);
        return;
      }

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          currentPeriodEnd: new Date((invoice.lines?.data?.[0]?.period?.end || 0) * 1000),
        },
      });

      if (invoice.amount_paid > 0) {
        await this.prisma.payment.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            provider: 'STRIPE',
            providerPaymentId: invoice.payment_intent as string,
            providerInvoiceId: invoice.id,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase(),
            status: 'succeeded',
            description: `Invoice paid: ${invoice.id}`,
            metadata: { invoiceUrl: invoice.hosted_invoice_url },
          },
        });
      }
    } catch (error) {
      this.logger.error('Error handling invoice paid', error);
    }
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      if (!invoice.subscription) return;

      const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id;

      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: subscriptionId, provider: 'STRIPE' },
      });

      if (!subscription) return;

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'PAST_DUE' },
      });

      await this.prisma.payment.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          provider: 'STRIPE',
          providerPaymentId: invoice.payment_intent as string,
          providerInvoiceId: invoice.id,
          amount: invoice.amount_due / 100,
          currency: invoice.currency.toUpperCase(),
          status: 'failed',
          description: `Invoice payment failed: ${invoice.id}`,
        },
      });
    } catch (error) {
      this.logger.error('Error handling invoice payment failed', error);
    }
  }

  private async handleSubscriptionUpdated(sub: Stripe.Subscription): Promise<void> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: sub.id, provider: 'STRIPE' },
      });

      if (!subscription) return;

      const statusMap: Record<string, string> = {
        active: 'ACTIVE',
        past_due: 'PAST_DUE',
        canceled: 'CANCELED',
        trialing: 'TRIALING',
        unpaid: 'UNPAID',
        incomplete: 'INCOMPLETE',
        incomplete_expired: 'EXPIRED',
      };

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: statusMap[sub.status] || subscription.status,
          currentPeriodStart: sub.current_period_start
            ? new Date(sub.current_period_start * 1000)
            : undefined,
          currentPeriodEnd: sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : undefined,
          canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
          trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
        },
      });
    } catch (error) {
      this.logger.error('Error handling subscription updated', error);
    }
  }

  private async handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: sub.id, provider: 'STRIPE' },
      });

      if (!subscription) return;

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED', canceledAt: new Date() },
      });
    } catch (error) {
      this.logger.error('Error handling subscription deleted', error);
    }
  }
}
