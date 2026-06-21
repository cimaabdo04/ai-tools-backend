import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get site settings (public)' })
  @ApiResponse({ status: 200, description: 'Site settings' })
  async get() {
    return this.settingsService.get();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update site settings (admin)' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async update(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))
    dto: UpdateSettingsDto,
  ) {
    return this.settingsService.update(dto);
  }
}
