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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all tags' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive tags' })
  @ApiResponse({ status: 200, description: 'List of tags' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const data = await this.tagsService.findAll(includeInactive === 'true');
    return { data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get tag by slug' })
  @ApiParam({ name: 'slug', description: 'Tag slug' })
  @ApiResponse({ status: 200, description: 'Tag details' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }

  @Public()
  @Get(':slug/tools')
  @ApiOperation({ summary: 'Get tools with a specific tag' })
  @ApiParam({ name: 'slug', description: 'Tag slug' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Pagination cursor' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Page size' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search within tools' })
  @ApiResponse({ status: 200, description: 'Paginated tools with tag' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async getTools(
    @Param('slug') slug: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
    @Query('search') search?: string,
  ) {
    return this.tagsService.getToolsByTagSlug(slug, { cursor, take, search });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tag (admin)' })
  @ApiResponse({ status: 201, description: 'Tag created' })
  @ApiResponse({ status: 409, description: 'Tag already exists' })
  async create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a tag (admin)' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag updated' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a tag (admin)' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 204, description: 'Tag deleted' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.tagsService.remove(id);
  }
}
