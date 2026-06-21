import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiExcludeEndpoint,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a checkout session for a payment provider' })
  @SwaggerResponse({ status: 201, description: 'Checkout session created' })
  async createCheckout(
    @CurrentUser() user: any,
    @Body() dto: CreateCheckoutDto,
  ) {
    const result = await this.paymentsService.createCheckout(user.id, dto, user.email);
    return { data: result, message: 'Checkout session created successfully' };
  }

  @Post('create-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription' })
  @SwaggerResponse({ status: 201, description: 'Subscription created' })
  async createSubscription(
    @CurrentUser() user: any,
    @Body() dto: CreateSubscriptionDto,
  ) {
    const result = await this.paymentsService.createSubscription(user.id, dto);
    return { data: result, message: 'Subscription created successfully' };
  }

  @Post('cancel-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an existing subscription' })
  @SwaggerResponse({ status: 200, description: 'Subscription canceled' })
  async cancelSubscription(
    @CurrentUser() user: any,
    @Body() dto: CancelSubscriptionDto,
  ) {
    await this.paymentsService.cancelSubscription(user.id, dto);
    return { message: 'Subscription cancellation processed successfully' };
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscription' })
  @SwaggerResponse({ status: 200, description: 'Current subscription details' })
  async getSubscription(@CurrentUser() user: any) {
    const result = await this.paymentsService.getCurrentSubscription(user.id);
    return { data: result, message: result ? 'Subscription found' : 'No active subscription' };
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user invoices' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @SwaggerResponse({ status: 200, description: 'List of invoices' })
  async getInvoices(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.paymentsService.listInvoices(user.id, page, limit);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @SwaggerResponse({ status: 200, description: 'Payment history' })
  async getHistory(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.paymentsService.getPaymentHistory(user.id, page, limit);
  }

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'List available pricing plans' })
  @SwaggerResponse({ status: 200, description: 'List of active pricing plans' })
  async getPlans() {
    const result = await this.paymentsService.listPlans();
    return { data: result };
  }

  @Public()
  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const result = await this.paymentsService.handleStripeWebhook(
      req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body)),
      signature,
    );
    return { data: result, message: 'Webhook received' };
  }

  @Public()
  @Post('paypal/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handlePayPalWebhook(@Req() req: Request) {
    const headers = req.headers as Record<string, string>;
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const result = await this.paymentsService.handlePayPalWebhook(headers, body);
    return { data: result, message: 'PayPal webhook processed' };
  }

  @Public()
  @Post('paddle/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handlePaddleWebhook(@Req() req: Request) {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const signature = (req.headers['paddle-signature'] as string) || undefined;
    const result = await this.paymentsService.handlePaddleWebhook(body, signature);
    return { data: result, message: 'Paddle webhook processed' };
  }

  @Public()
  @Post('lemonsqueezy/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleLemonSqueezyWebhook(@Req() req: Request) {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const signature = (req.headers['x-signature'] as string) || undefined;
    const result = await this.paymentsService.handleLemonSqueezyWebhook(body, signature);
    return { data: result, message: 'Lemon Squeezy webhook processed' };
  }
}
