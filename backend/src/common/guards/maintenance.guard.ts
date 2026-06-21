import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path: string = request.path || request.url || '';

    const bypassPaths = ['/api/v1/auth/', '/api/v1/admin/', '/api/v1/settings'];
    if (bypassPaths.some((p) => path.startsWith(p))) {
      return true;
    }

    try {
      const settings = await this.prisma.siteSettings.findFirst();
      if (settings?.maintenanceEnabled) {
        throw new HttpException(
          {
            success: false,
            message: settings.maintenanceMessage || 'Site is under maintenance',
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
    }

    return true;
  }
}
