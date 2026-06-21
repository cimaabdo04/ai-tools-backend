import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active pricing plans' })
  @SwaggerResponse({ status: 200, description: 'List of active plans' })
  async findAll() {
    const data = await this.pricingService.findAllActive();
    return { data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get pricing plan by slug' })
  @ApiParam({ name: 'slug', description: 'Plan slug' })
  @SwaggerResponse({ status: 200, description: 'Plan details' })
  @SwaggerResponse({ status: 404, description: 'Plan not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.pricingService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pricing plan (admin)' })
  @SwaggerResponse({ status: 201, description: 'Plan created' })
  @SwaggerResponse({ status: 409, description: 'Plan already exists' })
  async create(@Body() dto: CreatePlanDto) {
    return this.pricingService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a pricing plan (admin)' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @SwaggerResponse({ status: 200, description: 'Plan updated' })
  @SwaggerResponse({ status: 404, description: 'Plan not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.pricingService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete or deactivate a pricing plan (admin)' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @SwaggerResponse({ status: 200, description: 'Plan deleted or deactivated' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pricingService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/toggle-popular')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle popular flag on a pricing plan (admin)' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @SwaggerResponse({ status: 200, description: 'Popular flag toggled' })
  async togglePopular(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.pricingService.togglePopular(id);
    return { data, message: `Plan popular flag set to ${data.isPopular}` };
  }
}
