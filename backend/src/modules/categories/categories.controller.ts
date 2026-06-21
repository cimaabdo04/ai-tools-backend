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
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all categories with tool counts' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const data = await this.categoriesService.findAll(includeInactive === 'true');
    return { data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug with tools' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Public()
  @Get(':slug/tools')
  @ApiOperation({ summary: 'Get tools in a category' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Pagination cursor' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Page size' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search within category' })
  @ApiResponse({ status: 200, description: 'Paginated tools in category' })
  async getTools(
    @Param('slug') slug: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
    @Query('search') search?: string,
  ) {
    return this.categoriesService.getToolsByCategorySlug(slug, { cursor, take, search });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (admin)' })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 409, description: 'Category already exists' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (admin)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (admin)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
  }
}
