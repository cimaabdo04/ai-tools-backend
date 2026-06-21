import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { CancelSubscriptionDto } from '../dto/cancel-subscription.dto';
import * as crypto from 'crypto';

@Injectable()
export class PaddleProvider {
  private readonly logger = new Logger(PaddleProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly webhookSecret: string;
  private readonly sellerId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('paddle.apiKey');
    this.baseUrl = this.configService.get<string>('app.nodeEnv') === 'production'
      ? 'https://vendors.paddle.com/api/2.0'
      : 'https://sandbox-vendors.paddle.com/api/2.0';
    this.webhookSecret = this.configService.get<string>('paddle.webhookSecret');
    this.sellerId = this.configService.get<string>('paddle.sellerId');
  }

  async generatePayLink(
    userId: string,
    dto: CreateCheckoutDto,
    userEmail?: string,
  ): Promise<{ url: string; id: string }> {
    try {
      const plan = await this.prisma.pricingPlan.findUnique({ where: { slug: dto.planSlug } });
      if (!plan) throw new BadRequestException('Pricing plan not found');
      if (!plan.paddlePriceId) throw new BadRequestException('Paddle price ID not configured');

      const response = await fetch(`${this.baseUrl}/product/generate_pay_link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          vendor_id: this.sellerId,
          vendor_auth_code: this.apiKey,
          product_id: plan.paddlePriceId,
          title: plan.name,
          custom_message: userId,
          customer_email: userEmail || '',
          prices: [`${plan.currency}:${plan.monthlyPrice}`],
          ...(dto.successUrl ? { return_url: dto.successUrl } : {}),
          ...(dto.cancelUrl ? { cancel_url: dto.cancelUrl } : {}),
          ...(dto.metadata ? { passthrough: JSON.stringify(dto.metadata) } : {}),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Paddle generate pay link failed: ${errorBody}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(`Paddle API error: ${result.error?.message || 'Unknown error'}`);
      }

      this.logger.log(`Paddle pay link generated: ${result.response?.id}`);
      return {
        url: result.response?.url,
        id: result.response?.id,
      };
    } catch (error) {
      this.logger.error('Failed to generate Paddle pay link', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to generate payment link');
    }
  }

  async createSubscription(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<Record<string, unknown>> {
    try {
      const plan = await this.prisma.pricingPlan.findUnique({ where: { slug: dto.planSlug } });
      if (!plan) throw new BadRequestException('Pricing plan not found');
      if (!plan.paddlePriceId) throw new BadRequestException('Paddle price ID not configured');

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user?.email) throw new BadRequestException('User email required');

      const response = await fetch(`${this.baseUrl}/subscription/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          vendor_id: this.sellerId,
          vendor_auth_code: this.apiKey,
          plan_id: plan.paddlePriceId,
          customer_email: user.email,
          passthrough: JSON.stringify({ userId, planSlug: dto.planSlug }),
          ...(dto.providerCustomerId ? { subscription_id: dto.providerCustomerId } : {}),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Paddle subscription creation failed: ${errorBody}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Paddle API error: ${result.error?.message || 'Unknown error'}`);
      }

      this.logger.log(`Paddle subscription created: ${result.response?.subscription_id}`);
      return result.response;
    } catch (error) {
      this.logger.error('Failed to create Paddle subscription', error);
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
          provider: 'PADDLE',
        },
      });

      if (!subscription) throw new BadRequestException('Subscription not found');

      const response = await fetch(`${this.baseUrl}/subscription/users_cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          vendor_id: this.sellerId,
          vendor_auth_code: this.apiKey,
          subscription_id: dto.subscriptionId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Paddle cancellation failed: ${errorBody}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`Paddle API error: ${result.error?.message || 'Unknown error'}`);
      }

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELED', canceledAt: new Date() },
      });

      this.logger.log(`Paddle subscription canceled: ${dto.subscriptionId}`);
    } catch (error) {
      this.logger.error('Failed to cancel Paddle subscription', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  async handleWebhook(
    body: string,
    signature?: string,
  ): Promise<{ received: boolean; alertName?: string }> {
    try {
      const payload = JSON.parse(body);

      if (!this.verifyWebhookSignature(payload, signature)) {
        throw new BadRequestException('Invalid Paddle webhook signature');
      }

      const alertName = payload.alert_name as string;
      this.logger.log(`Paddle webhook received: ${alertName}`);

      switch (alertName) {
        case 'subscription_created':
          await this.handleSubscriptionCreated(payload);
          break;
        case 'subscription_updated':
          await this.handleSubscriptionUpdated(payload);
          break;
        case 'subscription_cancelled':
          await this.handleSubscriptionCancelled(payload);
          break;
        case 'subscription_payment_succeeded':
          await this.handlePaymentSucceeded(payload);
          break;
        case 'subscription_payment_failed':
          await this.handlePaymentFailed(payload);
          break;
      }

      return { received: true, alertName };
    } catch (error) {
      this.logger.error('Paddle webhook processing failed', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Webhook processing failed');
    }
  }

  private verifyWebhookSignature(payload: Record<string, unknown>, _signature?: string): boolean {
    if (!this.webhookSecret) return true;

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const receivedSignature = (_signature || payload.p_signature || '') as string;
    return expectedSignature === receivedSignature;
  }

  private async handleSubscriptionCreated(payload: Record<string, unknown>): Promise<void> {
    try {
      const userId = (typeof payload.passthrough === 'string' ? JSON.parse(payload.passthrough as string) : payload.passthrough)?.userId;
      const planSlug = (typeof payload.passthrough === 'string' ? JSON.parse(payload.passthrough as string) : payload.passthrough)?.planSlug;

      if (!userId) return;

      const plan = planSlug
        ? await this.prisma.pricingPlan.findUnique({ where: { slug: planSlug } })
        : null;

      const cancellationEpoch = parseInt(payload.cancellation_effective_date as string, 10) || 0;

      await this.prisma.subscription.create({
        data: {
          userId,
          planId: plan?.id || '',
          status: 'ACTIVE',
          provider: 'PADDLE',
          providerSubscriptionId: payload.subscription_id as string,
          providerCustomerId: payload.user_id as string,
          currentPeriodStart: new Date(),
          currentPeriodEnd: cancellationEpoch ? new Date(cancellationEpoch * 1000) : null,
          trialEndsAt: payload.status === 'trialing' ? new Date() : null,
          metadata: { ...(payload.passthrough ? { passthrough: payload.passthrough } : {}) },
        },
      });
    } catch (error) {
      this.logger.error('Error handling Paddle subscription created', error);
    }
  }

  private async handleSubscriptionUpdated(payload: Record<string, unknown>): Promise<void> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: payload.subscription_id as string, provider: 'PADDLE' },
      });
      if (!subscription) return;

      const status = payload.status === 'active' ? 'ACTIVE'
        : payload.status === 'trialing' ? 'TRIALING'
        : payload.status === 'paused' ? 'PAST_DUE'
        : payload.status === 'deleted' ? 'CANCELED'
        : subscription.status;

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status,
          currentPeriodEnd: payload.next_bill_date
            ? new Date(payload.next_bill_date as string)
            : undefined,
          trialEndsAt: payload.status === 'trialing' ? new Date() : undefined,
        },
      });
    } catch (error) {
      this.logger.error('Error handling Paddle subscription updated', error);
    }
  }

  private async handleSubscriptionCancelled(payload: Record<string, unknown>): Promise<void> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: payload.subscription_id as string, provider: 'PADDLE' },
      });
      if (!subscription) return;

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELED', canceledAt: new Date() },
      });
    } catch (error) {
      this.logger.error('Error handling Paddle subscription cancelled', error);
    }
  }

  private async handlePaymentSucceeded(payload: Record<string, unknown>): Promise<void> {
    try {
      const subscriptionId = payload.subscription_id as string;
      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: subscriptionId, provider: 'PADDLE' },
      });
      if (!subscription) return;

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'ACTIVE' },
      });

      const amount = parseFloat(payload.sale_gross as string) || parseFloat(payload.payment_tax as string) || 0;

      await this.prisma.payment.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          provider: 'PADDLE',
          providerPaymentId: payload.subscription_payment_id as string || payload.order_id as string,
          amount,
          currency: (payload.currency as string) || 'USD',
          status: 'succeeded',
          description: `Paddle payment: ${payload.subscription_payment_id || 'succeeded'}`,
        },
      });
    } catch (error) {
      this.logger.error('Error handling Paddle payment succeeded', error);
    }
  }

  private async handlePaymentFailed(payload: Record<string, unknown>): Promise<void> {
    try {
      const subscriptionId = payload.subscription_id as string;
      const subscription = await this.prisma.subscription.findFirst({
        where: { providerSubscriptionId: subscriptionId, provider: 'PADDLE' },
      });
      if (!subscription) return;

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'PAST_DUE' },
      });

      const amount = parseFloat(payload.sale_gross as string) || 0;

      await this.prisma.payment.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          provider: 'PADDLE',
          providerPaymentId: payload.subscription_payment_id as string,
          amount,
          currency: (payload.currency as string) || 'USD',
          status: 'failed',
          description: `Paddle payment failed: ${payload.failure_reason || 'Unknown reason'}`,
          metadata: { failureReason: payload.failure_reason },
        },
      });
    } catch (error) {
      this.logger.error('Error handling Paddle payment failed', error);
    }
  }
}
