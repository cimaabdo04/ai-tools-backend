import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active banners by placement' })
  @ApiQuery({ name: 'placement', required: true, description: 'Placement identifier', example: 'home' })
  @ApiResponse({ status: 200, description: 'Active banners' })
  async findActiveByPlacement(@Query('placement') placement: string) {
    return this.bannersService.findActiveByPlacement(placement);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a banner (admin)' })
  @ApiResponse({ status: 201, description: 'Banner created' })
  async create(@Body() dto: CreateBannerDto, @CurrentUser('id') userId: string) {
    return this.bannersService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a banner (admin)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Banner updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBannerDto,
  ) {
    return this.bannersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a banner (admin)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 204, description: 'Banner deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.bannersService.remove(id);
  }

  @Public()
  @Post(':id/click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a click on a banner' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Click recorded' })
  async recordClick(@Param('id', ParseUUIDPipe) id: string) {
    await this.bannersService.recordClick(id);
    return { message: 'Click recorded' };
  }
}
