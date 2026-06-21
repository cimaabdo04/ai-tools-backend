import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Header,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard overview' })
  async getOverview(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getOverview(query);
    return { data, message: 'Overview fetched successfully' };
  }

  @Get('tools')
  @ApiOperation({ summary: 'Get tool analytics (top tools, views, clicks, CTR)' })
  @ApiResponse({ status: 200, description: 'Tool analytics' })
  async getToolAnalytics(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getToolAnalytics(query);
    return { data, message: 'Tool analytics fetched successfully' };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user analytics (growth, registrations, roles)' })
  @ApiResponse({ status: 200, description: 'User analytics' })
  async getUserAnalytics(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getUserAnalytics(query);
    return { data, message: 'User analytics fetched successfully' };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics (MRR, ARR, subscriptions, one-time)' })
  @ApiResponse({ status: 200, description: 'Revenue analytics' })
  async getRevenueAnalytics(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getRevenueAnalytics(query);
    return { data, message: 'Revenue analytics fetched successfully' };
  }

  @Get('traffic')
  @ApiOperation({ summary: 'Get traffic sources (referrer breakdown)' })
  @ApiResponse({ status: 200, description: 'Traffic analytics' })
  async getTrafficAnalytics(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getTrafficAnalytics(query);
    return { data, message: 'Traffic analytics fetched successfully' };
  }

  @Get('geo')
  @ApiOperation({ summary: 'Get geographic distribution' })
  @ApiResponse({ status: 200, description: 'Geo analytics' })
  async getGeoAnalytics(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getGeoAnalytics(query);
    return { data, message: 'Geo analytics fetched successfully' };
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get daily/weekly/monthly trends' })
  @ApiResponse({ status: 200, description: 'Trends data' })
  async getTrends(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getTrends(query);
    return { data, message: 'Trends fetched successfully' };
  }

  @Get('export/:type')
  @ApiOperation({ summary: 'Export analytics as CSV' })
  @ApiParam({ name: 'type', enum: ['tools', 'users', 'revenue', 'traffic', 'geo'] })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="analytics-export.csv"')
  async exportCsv(
    @Param('type') type: string,
    @Query() query: AnalyticsQueryDto,
    @Res() res: Response,
  ) {
    const csv = await this.analyticsService.exportCsv(type, query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${Date.now()}.csv"`);
    res.send(csv);
  }
}
