import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        name: true,
        avatarUrl: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account is suspended or banned');
    }

    return user;
  }
}
