import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_API_KEY_AUTH_KEY } from '../decorators/api-key-auth.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isApiKeyAuth = this.reflector.getAllAndOverride<boolean>(IS_API_KEY_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isApiKeyAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const keyRecord = await this.prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    });

    if (!keyRecord) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (!keyRecord.isActive) {
      throw new UnauthorizedException('API key is deactivated');
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    const userIp = request.ip || request.connection?.remoteAddress;
    if (keyRecord.ipWhitelist.length > 0 && userIp && !keyRecord.ipWhitelist.includes(userIp)) {
      throw new UnauthorizedException('IP address not allowed for this API key');
    }

    await this.prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: {
        lastUsedAt: new Date(),
        requestsCount: { increment: 1 },
      },
    });

    request.user = {
      id: keyRecord.user.id,
      email: keyRecord.user.email,
      role: keyRecord.user.role,
      username: keyRecord.user.username,
      status: keyRecord.user.status,
      apiKeyId: keyRecord.id,
      permissions: keyRecord.permissions,
    };

    return true;
  }
}
