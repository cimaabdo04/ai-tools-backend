import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('API Keys')
@Controller('api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @ApiOperation({ summary: 'List current user\'s API keys' })
  @ApiResponse({ status: 200, description: 'User\'s API keys (without raw key)' })
  async findByUser(@CurrentUser('id') userId: string) {
    return this.apiKeysService.findByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created (raw key shown once)' })
  async create(@Body() dto: CreateApiKeyDto, @CurrentUser('id') userId: string) {
    const result = await this.apiKeysService.create(dto, userId);
    return {
      data: result.apiKey,
      rawKey: result.rawKey,
      message: 'Save this key securely - it will not be shown again',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update API key (name, permissions)' })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @ApiResponse({ status: 200, description: 'API key updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApiKeyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.apiKeysService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke API key' })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @ApiResponse({ status: 204, description: 'API key revoked' })
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.apiKeysService.revoke(id, userId);
  }

  @Post(':id/rotate')
  @ApiOperation({ summary: 'Rotate API key (generate new key)' })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @ApiResponse({ status: 200, description: 'API key rotated' })
  async rotate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.apiKeysService.rotate(id, userId);
    return {
      data: result.apiKey,
      rawKey: result.rawKey,
      message: 'Save this key securely - it will not be shown again',
    };
  }
}
