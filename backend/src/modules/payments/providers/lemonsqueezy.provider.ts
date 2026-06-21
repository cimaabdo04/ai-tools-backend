import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { CancelSubscriptionDto } from '../dto/cancel-subscription.dto';
import * as crypto from 'crypto';

interface LemonSqueezyCheckout {
  data: {
    id: string;
    attributes: {
      url: string;
      product_name: string;
      status: string;
    };
  };
}

interface LemonSqueezySubscription {
  data: {
    id: string;
    attributes: {
      status: string;
      product_id: number;
      variant_id: number;
      customer_id: number;
      trial_ends_at: string | null;
      renews_at: string | null;
      ends_at: string | null;
      created_at: string;
      updated_at: string;
    };
  };
}

@Injectable()
export class LemonSqueezyProvider {
  private readonly logger = new Logger(LemonSqueezyProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly storeId: string;
  private readonly webhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('lemonsqueezy.apiKey');
    this.baseUrl = 'https://api.lemonsqueezy.com/v1';
    this.storeId = this.configService.get<string>('lemonsqueezy.storeId');
    this.webhookSecret = this.configService.get<string>('lemonsqueezy.webhookSecret');
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  async createCheckout(
    userId: string,
    dto: CreateCheckoutDto,
    userEmail?: string,
  ): Promise<{ url: string; id: string }> {
    try {
      const plan = await this.prisma.pricingPlan.findUnique({ where: { slug: dto.planSlug } });
      if (!plan) throw new BadRequestException('Pricing plan not found');
      if (!plan.lemonsqueezyVariantId) {
        throw new BadRequestException('Lemon Squeezy variant ID not configured');
      }

      const response = await fetch(`${this.baseUrl}/checkouts`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          data: {
            type: 'checkouts',
            attributes: {
              checkout_data: {
                email: userEmail,
                custom: { user_id: userId },
              },
              checkout_options: {
                embed: false,
                media: true,
                logo: true,
              },
              product_options: {
                enabled_variants: [parseInt(plan.lemonsqueezyVariantId, 10)],
              },
              ...(dto.successUrl ? { success_url: dto.successUrl } : {}),
              ...(dto.cancelUrl ? { cancel_url: dto.cancelUrl } : {}),
            },
            relationships: {
              store: {
                data: { type: 'stores', id: this.storeId },
              },
              variant: {
                data: { type: 'variants', id: plan.lemonsqueezyVariantId },
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Lemon Squeezy checkout creation failed: ${errorBody}`);
      }

      const result: LemonSqueezyCheckout = await response.json();
      this.logger.log(`Lemon Squeezy checkout created: ${result.data.id}`);
      return {
        url: result.data.attributes.url,
        id: result.data.id,
      };
    } catch (error) {
      this.logger.error('Failed to create Lemon Squeezy checkout', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create checkout');
    }
  }

  async createSubscription(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<LemonSqueezySubscription> {
    try {
      const plan = await this.prisma.pricingPlan.findUnique({ where: { slug: dto.planSlug } });
      if (!plan) throw new BadRequestException('Pricing plan not found');
      if (!plan.lemonsqueezyVariantId) {
        throw new BadRequestException('Lemon Squeezy variant ID not configured');
      }

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user?.email) throw new BadRequestException('User email required');

      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          data: {
            type: 'subscriptions',
            attributes: {
              first_subscription_item: {
                price_id: parseInt(plan.lemonsqueezyVariantId, 10),
                quantity: 1,
              },
              currency: plan.currency,
              ...(dto.providerCustomerId ? { customer_id: parseInt(dto.providerCustomerId, 10) } : {}),
            },
            relationships: {
              store: {
                data: { type: 'stores', id: this.storeId },
              },
              customer: dto.providerCustomerId
                ? { data: { type: 'customers', id: dto.providerCustomerId } }
                : undefined,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Lemon Squeezy subscription creation failed: ${errorBody}`);
      }

      const result: LemonSqueezySubscription = await response.json();
      this.logger.log(`Lemon Squeezy subscription created: ${result.data.id}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create Lemon Squeezy subscription', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async cancelSubscription(
    userId: string,
    dto: CancelSubscriptionDto,
  ): Promise<void> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: {
          userId,
          providerSubscriptionId: dto.subscriptionId,
          provider: 'LEMONSQUEEZY',
        },
      });

      if (!subscription) throw new BadRequestException('Subscription not found');

      const response = await fetch(
        `${this.baseUrl}/subscriptions/${dto.subscriptionId}`,
        {
          method: 'DELETE',
          headers: this.headers,
        },
      );

      if (!response.ok && response.status !== 204) {
        const errorBody = await response.text();
        throw new Error(`Lemon Squeezy cancellation failed: ${errorBody}`);
      }

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
          metadata: {
            ...(subscription.metadata as Record<string, unknown>),
            cancelReason: dto.reason,
          },
        },
      });

      this.logger.log(`Lemon Squeezy subscription canceled: ${dto.subscriptionId}`);
    } catch (error) {
      this.logger.error('Failed to cancel Lemon Squeezy subscription', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  async handleWebhook(
    body: string,
    signature?: string,
  ): Promise<{ received: boolean; eventName?: string }> {
    try {
      if (!this.verifyWebhookSignature(body, signature)) {
        throw new BadRequestException('Invalid Lemon Squeezy webhook signature');
      }

      const event = JSON.parse(body);
      const eventName = event.meta?.event_name as string;
      this.logger.log(`Lemon Squeezy webhook received: ${eventName}`);

      switch (eventName) {
        case 'order_created':
          await this.handleOrderCreated(event);
          break;
        case 'subscription_created':
          await this.handleSubscriptionCreated(event);
          break;
        case 'subscription_updated':
          await this.handleSubscriptionUpdated(event);
          break;
        case 'subscription_cancelled':
          await this.handleSubscriptionCancelled(event);
          break;
        case 'subscription_expired':
          await this.handleSubscriptionExpired(event);
          break;
      }

      return { received: true, eventName };
    } catch (error) {
      this.logger.error('Lemon Squeezy webhook processing failed', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Webhook processing failed');
    }
  }

  private verifyWebhookSignature(body: string, signature?: string): boolean {
    if (!this.webhookSecret || !signature) return true;

    const computed = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex');

    try {
      const received = signature.split('=')[1] || signature;
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(received));
    } catch {
      return computed === received;
    }
  }

  private async handleOrderCreated(event: Record<string, unknown>): Promise<void> {
    try {
      const attributes = (event.data as Record<string, unknown>)?.attributes as Record<string, unknown>;
      const customData = attributes?.first_subscription_item?.custom as Record<string, unknown> || {};
      const userId = customData?.user_id as string || attributes?.user_id as string;

      if (!userId) {
        this.logger.warn('No userId found in Lemon Squeezy order webhook');
        return;
      }

      const total = parseFloat((attributes?.total as string) || '0');
      const tax = parseFloat((attributes?.tax as string) || '0');

      await this.prisma.payment.create({
        data: {
          userId,
          provider: 'LEMONSQUEEZY',
          providerPaymentId: event.data?.['id'] as string,
          providerInvoiceId: attributes?.invoice_id as string || (event.data?.['id'] as string),
          amount: total + tax,
          currency: (attributes?.currency as string) || 'USD',
          status: 'succeeded',
          description: `Lemon Squeezy order: ${event.data?.['id']}`,
          metadata: {
            orderId: event.data?.['id'],
            total,
            tax,
            ...(attributes as Record<string, unknown>),
          },
        },
      });
    } catch (error) {
      this.logger.error('Error handling Lemon Squeezy order created', error);
    }
  }

  private async handleSubscriptionCreated(event: Record<string, unknown>): Promise<void> {
    try {
      const data = event.data as Record<string, unknown>;
      const attrs = data?.attributes as Record<string, unknown>;
      const customData = attrs?.custom_data as Record<string, unknown> || {};
      const userId = customData?.user_id as string;

      if (!userId) return;

      const plan = await this.prisma.pricingPlan.findFirst({
        where: { lemonsqueezyVariantId: String(attrs?.variant_id || '') },
      });

      await this.prisma.subscription.create({
        data: {
          userId,
          planId: plan?.id || '',
          status: 'ACTIVE',
          provider: 'LEMONSQUEEZY',
          providerSubscriptionId: data?.id as string,
          providerCustomerId: String(attrs?.customer_id || ''),
          currentPeriodStart: new Date(),
          currentPeriodEnd: attrs?.renews_at ? new Date(attrs.renews_at as string) : null,
          trialEndsAt: attrs?.trial_ends_at ? new Date(attrs.trial_ends_at as string) : null,
        },
      });
    } catch (error) {
      this.logger.error('Error handling Lemon Squeezy subscription created', error);
    }
  }

  private async handleSubscriptionUpdated(event: Record<string, unknown>): Promise<void> {
    try {
      const subId = (event.data as Record<string, unknown>)?.id as string;
      const attrs = (event.data as Record<string, unknown>)?.attributes as Record<string, unknown>;

      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: subId, provider: 'LEMONSQUEEZY' },
      });
      if (!subscription) return;

      const statusMap: Record<string, string> = {
        active: 'ACTIVE',
        cancelled: 'CANCELED',
        expired: 'EXPIRED',
        trialing: 'TRIALING',
        past_due: 'PAST_DUE',
        paused: 'PAST_DUE',
      };

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: statusMap[attrs?.status as string] || subscription.status,
          currentPeriodEnd: attrs?.renews_at ? new Date(attrs.renews_at as string) : undefined,
          trialEndsAt: attrs?.trial_ends_at ? new Date(attrs.trial_ends_at as string) : undefined,
        },
      });
    } catch (error) {
      this.logger.error('Error handling Lemon Squeezy subscription updated', error);
    }
  }

  private async handleSubscriptionCancelled(event: Record<string, unknown>): Promise<void> {
    try {
      const subId = (event.data as Record<string, unknown>)?.id as string;

      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: subId, provider: 'LEMONSQUEEZY' },
      });
      if (!subscription) return;

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELED', canceledAt: new Date() },
      });
    } catch (error) {
      this.logger.error('Error handling Lemon Squeezy subscription cancelled', error);
    }
  }

  private async handleSubscriptionExpired(event: Record<string, unknown>): Promise<void> {
    try {
      const subId = (event.data as Record<string, unknown>)?.id as string;

      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: subId, provider: 'LEMONSQUEEZY' },
      });
      if (!subscription) return;

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });
    } catch (error) {
      this.logger.error('Error handling Lemon Squeezy subscription expired', error);
    }
  }
}
