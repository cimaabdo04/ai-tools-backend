import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { CancelSubscriptionDto } from '../dto/cancel-subscription.dto';

interface PayPalToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
  purchase_units?: Array<{
    amount: { currency_code: string; value: string };
    description?: string;
  }>;
}

interface PayPalSubscription {
  id: string;
  status: string;
  plan_id: string;
  start_time?: string;
  subscriber?: {
    email_address?: string;
    payer_id?: string;
  };
  billing_info?: {
    last_payment?: { amount?: { value: string; currency_code: string } };
    next_billing_time?: string;
  };
}

@Injectable()
export class PayPalProvider {
  private readonly logger = new Logger(PayPalProvider.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.baseUrl = this.configService.get<string>('paypal.apiUrl')
      || (this.configService.get<string>('app.nodeEnv') === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com');
    this.clientId = this.configService.get<string>('paypal.clientId');
    this.clientSecret = this.configService.get<string>('paypal.clientSecret');
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`PayPal auth failed: ${response.statusText}`);
      }

      const token: PayPalToken = await response.json();
      this.accessToken = token.access_token;
      this.tokenExpiresAt = Date.now() + (token.expires_in - 60) * 1000;
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get PayPal access token', error);
      throw new InternalServerErrorException('PayPal authentication failed');
    }
  }

  async createOrder(
    userId: string,
    planSlug: string,
    returnUrl: string,
    cancelUrl: string,
  ): Promise<PayPalOrder> {
    try {
      const plan = await this.prisma.pricingPlan.findUnique({ where: { slug: planSlug } });
      if (!plan) throw new BadRequestException('Pricing plan not found');

      const amount = plan.monthlyPrice?.toString() || '9.99';
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: { currency_code: plan.currency, value: amount },
            description: `${plan.name} - ${planSlug}`,
            custom_id: userId,
          }],
          payment_source: {
            paypal: {
              experience_context: {
                return_url: returnUrl,
                cancel_url: cancelUrl,
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`PayPal order creation failed: ${errorBody}`);
      }

      const order: PayPalOrder = await response.json();
      this.logger.log(`PayPal order created: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error('Failed to create PayPal order', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create PayPal order');
    }
  }

  async createSubscription(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<PayPalSubscription> {
    try {
      const plan = await this.prisma.pricingPlan.findUnique({ where: { slug: dto.planSlug } });
      if (!plan) throw new BadRequestException('Pricing plan not found');
      if (!plan.paypalPlanId) throw new BadRequestException('PayPal plan ID not configured');

      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.paypalPlanId,
          application_context: {
            user_action: 'SUBSCRIBE_NOW',
            payment_method: { payer_selected: 'PAYPAL', payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED' },
          },
          custom_id: userId,
          ...(dto.providerCustomerId ? { subscriber: { payer_id: dto.providerCustomerId } } : {}),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`PayPal subscription creation failed: ${errorBody}`);
      }

      const subscription: PayPalSubscription = await response.json();
      this.logger.log(`PayPal subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to create PayPal subscription', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create PayPal subscription');
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
          provider: 'PAYPAL',
        },
      });

      if (!subscription) throw new BadRequestException('Subscription not found');

      const token = await this.getAccessToken();

      const response = await fetch(
        `${this.baseUrl}/v1/billing/subscriptions/${dto.subscriptionId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: dto.reason || 'User requested cancellation',
          }),
        },
      );

      if (!response.ok && response.status !== 204) {
        const errorBody = await response.text();
        throw new Error(`PayPal cancellation failed: ${errorBody}`);
      }

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: dto.atPeriodEnd !== false ? 'ACTIVE' : 'CANCELED',
          canceledAt: new Date(),
          metadata: {
            ...(subscription.metadata as Record<string, unknown>),
            cancelReason: dto.reason,
            cancelAtPeriodEnd: dto.atPeriodEnd ?? true,
          },
        },
      });

      this.logger.log(`PayPal subscription canceled: ${dto.subscriptionId}`);
    } catch (error) {
      this.logger.error('Failed to cancel PayPal subscription', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to cancel PayPal subscription');
    }
  }

  async verifyWebhook(
    headers: Record<string, string>,
    body: string,
  ): Promise<{ verified: boolean; eventType?: string; resource?: Record<string, unknown> }> {
    try {
      const token = await this.getAccessToken();

      const verificationResponse = await fetch(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: this.configService.get<string>('paypal.webhookId'),
            webhook_event: JSON.parse(body),
          }),
        },
      );

      if (!verificationResponse.ok) {
        throw new Error('PayPal webhook verification request failed');
      }

      const verificationResult = await verificationResponse.json();

      if (verificationResult.verification_status !== 'SUCCESS') {
        this.logger.warn('PayPal webhook verification failed');
        return { verified: false };
      }

      const event = JSON.parse(body);
      this.logger.log(`PayPal webhook verified: ${event.event_type}`);

      await this.handleWebhookEvent(event);

      return {
        verified: true,
        eventType: event.event_type,
        resource: event.resource,
      };
    } catch (error) {
      this.logger.error('PayPal webhook verification error', error);
      return { verified: false };
    }
  }

  private async handleWebhookEvent(event: Record<string, unknown>): Promise<void> {
    try {
      const eventType = event.event_type as string;
      const resource = event.resource as Record<string, unknown>;

      switch (eventType) {
        case 'PAYMENT.SALE.COMPLETED':
          await this.handleSaleCompleted(resource);
          break;
        case 'BILLING.SUBSCRIPTION.CANCELLED':
          await this.handleSubscriptionCancelled(resource);
          break;
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
          await this.handleSubscriptionSuspended(resource);
          break;
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          await this.handleSubscriptionActivated(resource);
          break;
        case 'CHECKOUT.ORDER.APPROVED':
          await this.handleOrderApproved(resource);
          break;
      }
    } catch (error) {
      this.logger.error('Error handling PayPal webhook event', error);
    }
  }

  private async handleSaleCompleted(resource: Record<string, unknown>): Promise<void> {
    const billingAgreementId = resource.billing_agreement_id as string;
    if (!billingAgreementId) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { providerSubscriptionId: billingAgreementId, provider: 'PAYPAL' },
    });
    if (!subscription) return;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'ACTIVE' },
    });

    await this.prisma.payment.create({
      data: {
        userId: subscription.userId,
        subscriptionId: subscription.id,
        provider: 'PAYPAL',
        providerPaymentId: resource.id as string,
        amount: parseFloat((resource.amount as { total: string })?.total || '0'),
        currency: (resource.amount as { currency: string })?.currency || 'USD',
        status: 'succeeded',
        description: `PayPal sale completed: ${resource.id}`,
      },
    });
  }

  private async handleSubscriptionCancelled(resource: Record<string, unknown>): Promise<void> {
    const subId = resource.id as string;
    if (!subId) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { providerSubscriptionId: subId, provider: 'PAYPAL' },
    });
    if (!subscription) return;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELED', canceledAt: new Date() },
    });
  }

  private async handleSubscriptionSuspended(resource: Record<string, unknown>): Promise<void> {
    const subId = resource.id as string;
    if (!subId) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { providerSubscriptionId: subId, provider: 'PAYPAL' },
    });
    if (!subscription) return;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'PAST_DUE' },
    });
  }

  private async handleSubscriptionActivated(resource: Record<string, unknown>): Promise<void> {
    const subId = resource.id as string;
    if (!subId) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { providerSubscriptionId: subId, provider: 'PAYPAL' },
    });
    if (!subscription) return;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        metadata: { ...(subscription.metadata as Record<string, unknown>), activatedAt: new Date().toISOString() },
      },
    });
  }

  private async handleOrderApproved(resource: Record<string, unknown>): Promise<void> {
    this.logger.log(`PayPal order approved: ${resource.id}`);
  }
}
