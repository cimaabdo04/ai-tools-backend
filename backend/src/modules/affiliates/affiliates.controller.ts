import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AffiliatesService } from './affiliates.service';
import { ApplyAffiliateDto } from './dto/apply-affiliate.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Affiliates')
@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get affiliate stats for current user" })
  async getStats(@CurrentUser('id') userId: string) {
    return this.affiliatesService.getStats(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get('reports')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get affiliate reports with date filtering' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO)' })
  async getReports(
    @CurrentUser('id') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.affiliatesService.getReports(userId, from, to);
  }

  @Public()
  @Post('click/:code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a click on an affiliate link' })
  async recordClick(
    @Param('code') code: string,
    @Body('token') token: string | undefined,
    @Req() req: Request,
  ) {
    return this.affiliatesService.recordClick(code, token, req.ip, req.headers['user-agent'], req.headers['referer']);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post('apply')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to the affiliate program' })
  async apply(@Body() dto: ApplyAffiliateDto, @CurrentUser('id') userId: string) {
    return this.affiliatesService.apply(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get('application')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's affiliate application status" })
  async getMyApplication(@CurrentUser('id') userId: string) {
    return this.affiliatesService.getMyApplication(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Patch('application/payment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment methods for a non-approved application' })
  async updatePayment(@Body() dto: UpdatePaymentDto, @CurrentUser('id') userId: string) {
    return this.affiliatesService.updatePayment(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post('withdrawals')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a withdrawal' })
  async createWithdrawal(@Body() dto: CreateWithdrawalDto, @CurrentUser('id') userId: string) {
    return this.affiliatesService.createWithdrawal(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get('withdrawals')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's withdrawals" })
  async getMyWithdrawals(@CurrentUser('id') userId: string) {
    return this.affiliatesService.getMyWithdrawals(userId);
  }
}
