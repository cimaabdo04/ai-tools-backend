import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
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
import { WhiteLabelService } from './white-label.service';
import { CreateWhiteLabelDto } from './dto/create-white-label.dto';
import { UpdateWhiteLabelDto } from './dto/update-white-label.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('White Label')
@Controller('white-label')
export class WhiteLabelController {
  constructor(private readonly whiteLabelService: WhiteLabelService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get active white label configuration' })
  @ApiResponse({ status: 200, description: 'Active config or null' })
  async getActive() {
    const config = await this.whiteLabelService.getActive();
    return config ?? { message: 'No active configuration found' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a white label configuration (admin)' })
  @ApiResponse({ status: 201, description: 'Configuration created' })
  async create(@Body() dto: CreateWhiteLabelDto) {
    return this.whiteLabelService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a white label configuration (admin)' })
  @ApiParam({ name: 'id', description: 'Config ID' })
  @ApiResponse({ status: 200, description: 'Configuration updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWhiteLabelDto,
  ) {
    return this.whiteLabelService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post(':id/activate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a white label configuration (admin)' })
  @ApiParam({ name: 'id', description: 'Config ID' })
  @ApiResponse({ status: 200, description: 'Configuration activated' })
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.whiteLabelService.activate(id);
  }
}
