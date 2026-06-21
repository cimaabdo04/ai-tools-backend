import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, req.ip);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful, returns tokens and user' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip, req.headers['user-agent']);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshTokens(dto.refreshToken, req.ip, req.headers['user-agent']);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate session' })
  @ApiBody({ type: RefreshTokenDto, required: false })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser() user: any, @Body() dto?: RefreshTokenDto) {
    await this.authService.logout(user.id, dto?.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Reset password using reset token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-email')
  @Public()
  @ApiOperation({ summary: 'Verify email address using verification token' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('enable-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  @ApiBody({ type: Enable2FADto })
  @ApiResponse({ status: 200, description: '2FA secret and QR code generated' })
  async enable2fa(@CurrentUser() user: any, @Body() dto: Enable2FADto) {
    return this.authService.enable2fa(user.id, dto);
  }

  @Post('verify-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify TOTP code and enable 2FA' })
  @ApiBody({ type: Verify2FADto })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid 2FA code' })
  async verify2fa(@CurrentUser() user: any, @Body() dto: Verify2FADto) {
    return this.authService.verify2fa(user.id, dto);
  }

  @Post('disable-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiBody({ type: Enable2FADto })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disable2fa(@CurrentUser() user: any, @Body() dto: Enable2FADto) {
    return this.authService.disable2fa(user.id, dto);
  }

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {}

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback handler' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.handleOAuthLogin(
      req.user,
      req.ip,
      req.headers['user-agent'],
    );
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const redirectUrl = `${frontendUrl}/auth/callback#accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(redirectUrl);
  }

  @Get('github')
  @Public()
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  async githubAuth() {}

  @Get('github/callback')
  @Public()
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback handler' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  async githubAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.handleOAuthLogin(
      req.user,
      req.ip,
      req.headers['user-agent'],
    );
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const redirectUrl = `${frontendUrl}/auth/callback#accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(redirectUrl);
  }
}
