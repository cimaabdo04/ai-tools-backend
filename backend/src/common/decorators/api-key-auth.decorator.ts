import { SetMetadata } from '@nestjs/common';

export const IS_API_KEY_AUTH_KEY = 'isApiKeyAuth';
export const ApiKeyAuth = () => SetMetadata(IS_API_KEY_AUTH_KEY, true);
