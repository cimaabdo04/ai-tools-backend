import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ImportService } from './import.service';
import { CsvImportDto } from './dto/csv-import.dto';
import { ApiImportDto } from './dto/api-import.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Import')
@Controller('import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
@ApiBearerAuth()
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('csv')
  @ApiOperation({ summary: 'Import tools from CSV content' })
  @ApiResponse({ status: 201, description: 'Import result with stats' })
  async importCsv(@Body() dto: CsvImportDto, @CurrentUser('id') userId: string) {
    return this.importService.importFromCsv(dto, userId);
  }

  @Post('api')
  @ApiOperation({ summary: 'Import tools via external API fetch (async)' })
  @ApiResponse({ status: 201, description: 'Job ID for tracking' })
  async importApi(@Body() dto: ApiImportDto, @CurrentUser('id') userId: string) {
    return this.importService.importFromApi(dto, userId);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get status of import queue jobs' })
  @ApiQuery({ name: 'jobId', required: true, description: 'Job ID returned from API import' })
  @ApiResponse({ status: 200, description: 'Job status' })
  async getJobStatus(@Query('jobId') jobId: string) {
    const job = await this.importService.getJobStatus(jobId);
    if (!job) {
      return { message: 'Job not found', status: 'unknown' };
    }
    return job;
  }

  @Post('detect-duplicates')
  @ApiOperation({ summary: 'Find potential duplicate tools by name and website URL' })
  @ApiResponse({ status: 200, description: 'Duplicate detection results' })
  async detectDuplicates(@Body() body: { tools: { name: string; websiteUrl?: string }[] }) {
    return this.importService.findDuplicates(body.tools || []);
  }
}
