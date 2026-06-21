import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Res,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs with filters and pagination (admin)' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action' })
  @ApiQuery({ name: 'entity', required: false, description: 'Filter by entity type' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO)' })
  @ApiResponse({ status: 200, description: 'Paginated audit logs' })
  async findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Audit statistics (admin)' })
  @ApiResponse({ status: 200, description: 'Audit stats' })
  async getStats() {
    return this.auditService.getStats();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export audit logs as CSV (admin)' })
  @ApiResponse({ status: 200, description: 'CSV file' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="audit-logs.csv"')
  async export(@Query() query: AuditQueryDto, @Res() res: Response) {
    const csv = await this.auditService.exportCsv(query);
    res.send(csv);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log details (admin)' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({ status: 200, description: 'Audit log details' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditService.findById(id);
  }
}
