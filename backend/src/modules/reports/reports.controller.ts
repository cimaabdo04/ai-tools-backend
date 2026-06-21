import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a report (authenticated)' })
  @ApiResponse({ status: 201, description: 'Report submitted' })
  async create(@Body() dto: CreateReportDto, @CurrentUser('id') userId: string) {
    return this.reportsService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List reports with filters (admin)' })
  @ApiResponse({ status: 200, description: 'Paginated list of reports' })
  async findAll(@Query() query: ReportQueryDto) {
    return this.reportsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report statistics (admin)' })
  @ApiResponse({ status: 200, description: 'Report stats' })
  async getStats() {
    return this.reportsService.getStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get report details (admin)' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report details' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update report status (admin)' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.updateStatus(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Patch(':id/review')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add review note to report (admin)' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Review note added' })
  async addReviewNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reviewNote') reviewNote: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.addReviewNote(id, reviewNote, userId);
  }
}
