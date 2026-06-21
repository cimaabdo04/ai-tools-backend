import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '@common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, ip?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name || null,
        status: 'PENDING_VERIFICATION',
      },
    });

    try {
      let refCode: string | null = null;
      let clickId: string | null = null;
      let country: string | null = null;

      if (dto.clickId && dto.token) {
        const click = await this.prisma.affiliateClick.findUnique({ where: { id: dto.clickId } });
        if (click && click.token === dto.token && !click.converted) {
          const link = await this.prisma.affiliateLink.findUnique({ where: { id: click.linkId } });
          if (link) {
            refCode = link.code;
            clickId = click.id;
            country = click.country;
          }
        }
      }

      if (!refCode && dto.ref) {
        refCode = dto.ref;
      }

      if (refCode) {
        const link = await this.prisma.affiliateLink.findUnique({ where: { code: refCode } });
        if (link) {
          const rate = country
            ? await this.prisma.affiliateCountryRate.findUnique({ where: { countryCode: country } })
            : null;
          const conversionValue = rate?.conversionValue ?? 1.0;
          const earned = conversionValue * Number(link.commissionRate);

          await this.prisma.$transaction([
            this.prisma.affiliateLink.update({
              where: { code: refCode },
              data: { totalConversions: { increment: 1 }, totalEarned: { increment: earned } },
            }),
            this.prisma.user.update({
              where: { id: user.id },
              data: { referredBy: refCode, referredAt: new Date(), referredCountry: country, referredClickId: clickId },
            }),
            clickId
              ? this.prisma.affiliateClick.update({ where: { id: clickId }, data: { converted: true, convertedAt: new Date(), clickValue: earned } })
              : this.prisma.affiliateClick.updateMany({
                  where: { linkId: link.id, converted: false },
                  data: { converted: true, convertedAt: new Date(), clickValue: earned },
                }),
          ]);
        }
      }
    } catch (err) {
      this.logger.warn('Failed to record affiliate conversion', err);
    }

    const verificationToken = await this.generateEmailVerificationToken(user.id, user.email);

    this.sendVerificationEmail(user.email, verificationToken).catch((err) =>
      this.logger.error('Failed to send verification email', err),
    );

    return this.stripSensitive(user);
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account is suspended or banned');
    }

    if (user.twoFactorEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: user.id, type: '2fa_pending' },
        {
          secret: this.configService.get<string>('jwt.secret'),
          expiresIn: '5m',
        },
      );

      return { requiresTwoFactor: true, tempToken };
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        ipAddress: ip || null,
        userAgent: userAgent || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip || null,
      },
    });

    return {
      user: this.stripSensitive(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string, ip?: string, userAgent?: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const session = await this.prisma.session.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found or expired');
      }

      if (session.user.status === 'BANNED' || session.user.status === 'SUSPENDED') {
        throw new UnauthorizedException('Account is suspended or banned');
      }

      if (new Date() > session.expiresAt) {
        await this.prisma.session.delete({ where: { id: session.id } });
        throw new UnauthorizedException('Refresh token has expired');
      }

      const tokens = await this.generateTokens(
        session.user.id,
        session.user.email,
        session.user.role,
      );

      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          token: tokens.refreshToken,
          lastActivity: new Date(),
          ipAddress: ip || session.ipAddress,
          userAgent: userAgent || session.userAgent,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await this.prisma.user.update({
        where: { id: session.user.id },
        data: { lastLoginAt: new Date() },
      });

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.warn('Refresh token validation failed', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.session.deleteMany({
        where: { userId, token: refreshToken },
      });
    } else {
      await this.prisma.session.deleteMany({ where: { userId } });
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            tools: true,
            reviews: true,
            bookmarks: true,
            collections: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.stripSensitive(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      return { message: 'If an account with that email exists, a password reset link has been sent' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password_reset' },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '1h',
      },
    );

    this.sendPasswordResetEmail(user.email, resetToken).catch((err) =>
      this.logger.error('Failed to send password reset email', err),
    );

    return { message: 'If an account with that email exists, a password reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(dto.token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid reset token');
      }

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

      if (!user) {
        throw new BadRequestException('Invalid reset token');
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
        },
      });

      await this.prisma.session.deleteMany({ where: { userId: user.id } });

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async verifyEmail(dto: VerifyEmailDto) {
    try {
      const payload = this.jwtService.verify(dto.token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid verification token');
      }

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

      if (!user) {
        throw new BadRequestException('Invalid verification token');
      }

      if (user.emailVerified) {
        return { message: 'Email is already verified' };
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          status: 'ACTIVE',
        },
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async enable2fa(userId: string, dto: Enable2FADto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    const secret = speakeasy.generateSecret({
      name: `AI Tools Directory (${user.email})`,
      issuer: 'AI Tools Directory',
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verify2fa(userId: string, dto: Verify2FADto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Two-factor setup has not been initiated');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: dto.token,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid two-factor authentication code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: 'Two-factor authentication enabled successfully' };
  }

  async disable2fa(userId: string, dto: Enable2FADto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    return { message: 'Two-factor authentication disabled successfully' };
  }

  async handleOAuthLogin(
    oauthUser: {
      email: string;
      name?: string;
      username?: string;
      avatarUrl?: string;
      provider: string;
      providerId?: string;
    },
    ip?: string,
    userAgent?: string,
  ) {
    let user = await this.prisma.user.findUnique({ where: { email: oauthUser.email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          name: oauthUser.name || null,
          username: oauthUser.username || null,
          avatarUrl: oauthUser.avatarUrl || null,
          emailVerified: true,
          status: 'ACTIVE',
          metadata: {
            oauthProvider: oauthUser.provider,
            oauthProviderId: oauthUser.providerId,
          },
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        ipAddress: ip || null,
        userAgent: userAgent || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip || null,
        avatarUrl: oauthUser.avatarUrl || user.avatarUrl,
      },
    });

    return {
      user: this.stripSensitive(user),
      ...tokens,
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m'),
      },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
      },
    );

    return { accessToken, refreshToken };
  }

  private async generateEmailVerificationToken(userId: string, email: string): Promise<string> {
    return this.jwtService.sign(
      { sub: userId, email, type: 'email_verification' },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '24h',
      },
    );
  }

  private stripSensitive(user: any) {
    const { passwordHash, twoFactorSecret, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const verifyUrl = `${frontendUrl}/auth/verify-email?token=${token}`;
    this.logger.log(`Verification email to ${email}: ${verifyUrl}`);
  }

  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;
    this.logger.log(`Password reset email to ${email}: ${resetUrl}`);
  }
}
