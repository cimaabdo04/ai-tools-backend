import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AffiliatesService } from '@modules/affiliates/affiliates.service';
import { ReviewApplicationDto, UpdateLinkLimitDto } from '@modules/affiliates/dto/review-application.dto';
import { CreateCountryRateDto, UpdateCountryRateDto } from '@modules/affiliates/dto/country-rate.dto';
import { CreateLevelDto, UpdateLevelDto } from '@modules/affiliates/dto/affiliate-level.dto';
import { UpdateWithdrawalDto } from '@modules/affiliates/dto/update-withdrawal.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Admin Affiliates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('admin/affiliates')
@ApiBearerAuth()
export class AdminAffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all affiliates' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllAffiliates(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.affiliatesService.getAllAffiliates(page ?? 1, limit ?? 20);
  }

  @Get(':userId/referrals')
  @ApiOperation({ summary: 'Get detailed referrals for an affiliate' })
  async getReferrals(@Param('userId') userId: string) {
    return this.affiliatesService.getReferrals(userId);
  }

  @Get(':userId/stats')
  @ApiOperation({ summary: 'Get affiliate stats for a specific user' })
  async getAffiliateStats(@Param('userId') userId: string) {
    return this.affiliatesService.getStats(userId);
  }

  @Get(':userId/reports')
  @ApiOperation({ summary: 'Get affiliate reports for a specific user' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getAffiliateReports(@Param('userId') userId: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.affiliatesService.getReports(userId, from, to);
  }

  @Get(':userId/clicks')
  @ApiOperation({ summary: 'Get paginated clicks for an affiliate' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'device', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getAffiliateClicks(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('country') country?: string,
    @Query('device') device?: string,
    @Query('source') source?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.affiliatesService.getAffiliateClicks(userId, page ?? 1, limit ?? 20, {
      country, deviceType: device, source, from, to,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update affiliate commission rate' })
  async updateCommission(@Param('id') id: string, @Body('commissionRate') commissionRate: number) {
    return this.affiliatesService.updateCommission(id, commissionRate);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'List all withdrawal requests' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, description: 'PENDING | APPROVED | REJECTED' })
  async getWithdrawals(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.affiliatesService.getAllWithdrawals(page ?? 1, limit ?? 20, status);
  }

  @Patch('withdrawals/:id')
  @ApiOperation({ summary: 'Approve or reject a withdrawal request' })
  async updateWithdrawal(@Param('id') id: string, @Body() dto: UpdateWithdrawalDto) {
    return this.affiliatesService.updateWithdrawal(id, dto);
  }

  @Get('applications')
  @ApiOperation({ summary: 'List affiliate applications' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, description: 'pending | approved | rejected' })
  async getApplications(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.affiliatesService.getAllApplications(page ?? 1, limit ?? 20, status);
  }

  @Patch('applications/:id/review')
  @ApiOperation({ summary: 'Approve, reject, or mark an application as incomplete' })
  async reviewApplication(@Param('id') id: string, @Body() dto: ReviewApplicationDto) {
    if (dto.status === 'approved') {
      return this.affiliatesService.approveApplication(id);
    }
    if (dto.status === 'incomplete') {
      return this.affiliatesService.markApplicationIncomplete(id, dto.adminNote);
    }
    return this.affiliatesService.rejectApplication(id, dto.adminNote);
  }

  @Patch('applications/:id/limit')
  @ApiOperation({ summary: 'Update manual link limit for a user' })
  async updateLinkLimit(@Param('id') id: string, @Body() dto: UpdateLinkLimitDto) {
    return this.affiliatesService.updateLinkLimit(id, dto);
  }

  @Get('country-rates')
  @ApiOperation({ summary: 'Get all country rates' })
  async getCountryRates() {
    return this.affiliatesService.getCountryRates();
  }

  @Post('country-rates')
  @ApiOperation({ summary: 'Create or update a country rate' })
  async createCountryRate(@Body() dto: CreateCountryRateDto) {
    return this.affiliatesService.upsertCountryRate(dto);
  }

  @Patch('country-rates/:id')
  @ApiOperation({ summary: 'Update a country rate' })
  async updateCountryRate(@Param('id') id: string, @Body() dto: UpdateCountryRateDto) {
    return this.affiliatesService.updateCountryRate(id, dto);
  }

  @Delete('country-rates/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a country rate' })
  async deleteCountryRate(@Param('id') id: string) {
    return this.affiliatesService.deleteCountryRate(id);
  }

  @Get('levels')
  @ApiOperation({ summary: 'Get all affiliate levels' })
  async getLevels() {
    return this.affiliatesService.getLevels();
  }

  @Post('levels')
  @ApiOperation({ summary: 'Create or update an affiliate level' })
  async createLevel(@Body() dto: CreateLevelDto) {
    return this.affiliatesService.upsertLevel(dto);
  }

  @Patch('levels/:id')
  @ApiOperation({ summary: 'Update an affiliate level' })
  async updateLevel(@Param('id') id: string, @Body() dto: UpdateLevelDto) {
    return this.affiliatesService.updateLevel(id, dto);
  }

  @Delete('levels/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an affiliate level' })
  async deleteLevel(@Param('id') id: string) {
    return this.affiliatesService.deleteLevel(id);
  }
}
