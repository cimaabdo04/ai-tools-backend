import { Provider } from '@nestjs/common';
import { StripeProvider } from './stripe.provider';
import { PayPalProvider } from './paypal.provider';
import { PaddleProvider } from './paddle.provider';
import { LemonSqueezyProvider } from './lemonsqueezy.provider';

export const paymentProviders: Provider[] = [
  StripeProvider,
  PayPalProvider,
  PaddleProvider,
  LemonSqueezyProvider,
];

export { StripeProvider } from './stripe.provider';
export { PayPalProvider } from './paypal.provider';
export { PaddleProvider } from './paddle.provider';
export { LemonSqueezyProvider } from './lemonsqueezy.provider';

export type PaymentProviderType =
  | StripeProvider
  | PayPalProvider
  | PaddleProvider
  | LemonSqueezyProvider;
