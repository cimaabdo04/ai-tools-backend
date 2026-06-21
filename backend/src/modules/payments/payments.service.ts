import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { StripeProvider } from './providers/stripe.provider';
import { PayPalProvider } from './providers/paypal.provider';
import { PaddleProvider } from './providers/paddle.provider';
import { LemonSqueezyProvider } from './providers/lemonsqueezy.provider';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { PaymentProvider, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly stripeProvider: StripeProvider,
    private readonly payPalProvider: PayPalProvider,
    private readonly paddleProvider: PaddleProvider,
    private readonly lemonSqueezyProvider: LemonSqueezyProvider,
  ) {}

  async createCheckout(userId: string, dto: CreateCheckoutDto, email?: string) {
    switch (dto.provider) {
      case 'STRIPE': {
        const session = await this.stripeProvider.createCheckoutSession(userId, dto, email);
        return {
          url: session.url,
          sessionId: session.id,
          provider: 'STRIPE',
        };
      }
      case 'PAYPAL': {
        const order = await this.payPalProvider.createOrder(
          userId,
          dto.planSlug,
          dto.successUrl || `${this.configService.get<string>('app.frontendUrl')}/payment/success`,
          dto.cancelUrl || `${this.configService.get<string>('app.frontendUrl')}/payment/cancel`,
        );
        const approvalLink = order.links?.find((l) => l.rel === 'approve')?.href || order.links?.[0]?.href;
        return {
          url: approvalLink,
          orderId: order.id,
          provider: 'PAYPAL',
        };
      }
      case 'PADDLE': {
        const payLink = await this.paddleProvider.generatePayLink(userId, dto, email);
        return {
          url: payLink.url,
          id: payLink.id,
          provider: 'PADDLE',
        };
      }
      case 'LEMONSQUEEZY': {
        const checkout = await this.lemonSqueezyProvider.createCheckout(userId, dto, email);
        return {
          url: checkout.url,
          id: checkout.id,
          provider: 'LEMONSQUEEZY',
        };
      }
      default:
        throw new BadRequestException(`Unsupported payment provider: ${dto.provider}`);
    }
  }

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const plan = await this.prisma.pricingPlan.findUnique({
      where: { slug: dto.planSlug },
    });
    if (!plan) throw new NotFoundException('Pricing plan not found');

    const existingActive = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
      },
    });

    if (existingActive) {
      throw new BadRequestException('User already has an active subscription');
    }

    switch (dto.provider) {
      case 'STRIPE': {
        const sub = await this.stripeProvider.createSubscription(userId, dto);
        return {
          id: sub.id,
          status: sub.status,
          provider: 'STRIPE',
          customerId: sub.customer,
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
        };
      }
      case 'PAYPAL': {
        const sub = await this.payPalProvider.createSubscription(userId, dto);
        return {
          id: sub.id,
          status: sub.status,
          provider: 'PAYPAL',
          links: sub.links,
        };
      }
      case 'PADDLE': {
        const sub = await this.paddleProvider.createSubscription(userId, dto);
        return {
          id: sub.subscription_id,
          status: sub.status,
          provider: 'PADDLE',
          nextBillDate: sub.next_bill_date,
        };
      }
      case 'LEMONSQUEEZY': {
        const sub = await this.lemonSqueezyProvider.createSubscription(userId, dto);
        return {
          id: sub.data.id,
          status: sub.data.attributes.status,
          provider: 'LEMONSQUEEZY',
          currentPeriodEnd: sub.data.attributes.renews_at,
        };
      }
      default:
        throw new BadRequestException(`Unsupported subscription provider: ${dto.provider}`);
    }
  }

  async cancelSubscription(userId: string, dto: CancelSubscriptionDto) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        providerSubscriptionId: dto.subscriptionId,
      },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    switch (dto.provider) {
      case 'STRIPE':
        return this.stripeProvider.cancelSubscription(userId, dto);
      case 'PAYPAL':
        return this.payPalProvider.cancelSubscription(userId, dto);
      case 'PADDLE':
        return this.paddleProvider.cancelSubscription(userId, dto);
      case 'LEMONSQUEEZY':
        return this.lemonSqueezyProvider.cancelSubscription(userId, dto);
      default:
        throw new BadRequestException(`Unsupported provider: ${dto.provider}`);
    }
  }

  async getCurrentSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE', 'INCOMPLETE'] },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      status: subscription.status,
      provider: subscription.provider,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        slug: subscription.plan.slug,
        features: subscription.plan.features,
        limits: subscription.plan.limits,
        monthlyPrice: subscription.plan.monthlyPrice,
        yearlyPrice: subscription.plan.yearlyPrice,
        currency: subscription.plan.currency,
      },
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      trialEndsAt: subscription.trialEndsAt,
      canceledAt: subscription.canceledAt,
      providerSubscriptionId: subscription.providerSubscriptionId,
      createdAt: subscription.createdAt,
    };
  }

  async listInvoices(userId: string, page = 1, limit = 10) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, provider: 'STRIPE' },
      orderBy: { createdAt: 'desc' },
    });

    if (subscription?.provider === 'STRIPE' && subscription.providerCustomerId) {
      const invoices = await this.stripeProvider.listInvoices(userId, limit);
      return invoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        amountPaid: inv.amount_paid / 100,
        amountDue: inv.amount_due / 100,
        currency: inv.currency.toUpperCase(),
        status: inv.status,
        hostedUrl: inv.hosted_invoice_url,
        pdfUrl: inv.invoice_pdf,
        paidAt: inv.status_transitions?.paid_at
          ? new Date(inv.status_transitions.paid_at * 1000)
          : null,
        periodStart: inv.lines?.data?.[0]?.period?.start
          ? new Date(inv.lines.data[0].period.start * 1000)
          : null,
        periodEnd: inv.lines?.data?.[0]?.period?.end
          ? new Date(inv.lines.data[0].period.end * 1000)
          : null,
        createdAt: new Date(inv.created * 1000),
      }));
    }

    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId, providerInvoiceId: { not: null } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { subscription: { include: { plan: true } } },
      }),
      this.prisma.payment.count({
        where: { userId, providerInvoiceId: { not: null } },
      }),
    ]);

    return {
      data: payments.map((p) => ({
        id: p.id,
        providerPaymentId: p.providerPaymentId,
        providerInvoiceId: p.providerInvoiceId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        description: p.description,
        provider: p.provider,
        plan: p.subscription?.plan?.name || null,
        createdAt: p.createdAt,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPaymentHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          subscription: {
            include: { plan: true },
          },
        },
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);

    return {
      data: payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        providerPaymentId: p.providerPaymentId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        description: p.description,
        subscriptionId: p.subscriptionId,
        planName: p.subscription?.plan?.name || null,
        createdAt: p.createdAt,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async listPlans() {
    return this.prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        features: true,
        limits: true,
        monthlyPrice: true,
        yearlyPrice: true,
        currency: true,
        isPopular: true,
        sortOrder: true,
        createdAt: true,
      },
    });
  }

  async handleStripeWebhook(body: Buffer, signature: string) {
    return this.stripeProvider.handleWebhook(body, signature);
  }

  async handlePayPalWebhook(headers: Record<string, string>, body: string) {
    return this.payPalProvider.verifyWebhook(headers, body);
  }

  async handlePaddleWebhook(body: string, signature?: string) {
    return this.paddleProvider.handleWebhook(body, signature);
  }

  async handleLemonSqueezyWebhook(body: string, signature?: string) {
    return this.lemonSqueezyProvider.handleWebhook(body, signature);
  }
}
