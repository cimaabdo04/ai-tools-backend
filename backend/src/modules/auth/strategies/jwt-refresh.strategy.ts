import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      passReqToCallback: true,
      secretOrKey: configService.get<string>('jwt.refreshSecret'),
    });
  }

  async validate(req: Request, payload: any) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const refreshToken = req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const session = await this.prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true, email: true, role: true, status: true } } },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or expired');
    }

    if (session.user.status === 'BANNED' || session.user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account is suspended or banned');
    }

    if (new Date() > session.expiresAt) {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    return {
      ...payload,
      sessionId: session.id,
      refreshToken,
    };
  }
}
