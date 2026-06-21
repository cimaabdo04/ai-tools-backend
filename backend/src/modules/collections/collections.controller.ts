import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
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
} from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AddToolDto } from './dto/add-tool.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List public collections + user own collections if authenticated' })
  @ApiResponse({ status: 200, description: 'Collections list' })
  async findAll(@CurrentUser('id') userId?: string) {
    return this.collectionsService.findAll(userId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get collection by slug with tools' })
  @ApiParam({ name: 'slug', description: 'Collection slug' })
  @ApiResponse({ status: 200, description: 'Collection details with tools' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  async findBySlug(@Param('slug') slug: string, @CurrentUser('id') userId?: string) {
    return this.collectionsService.findBySlug(slug, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new collection' })
  @ApiResponse({ status: 201, description: 'Collection created' })
  async create(@Body() dto: CreateCollectionDto, @CurrentUser('id') userId: string) {
    const data = await this.collectionsService.create(dto, userId);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update collection (owner only)' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({ status: 200, description: 'Collection updated' })
  @ApiResponse({ status: 403, description: 'Not your collection' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollectionDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.collectionsService.update(id, dto, userId);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete collection (owner only)' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({ status: 204, description: 'Collection deleted' })
  @ApiResponse({ status: 403, description: 'Not your collection' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.collectionsService.remove(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post(':id/tools')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add tool to collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({ status: 201, description: 'Tool added to collection' })
  @ApiResponse({ status: 409, description: 'Tool already in collection' })
  async addTool(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddToolDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionsService.addTool(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Delete(':id/tools/:toolId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove tool from collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiParam({ name: 'toolId', description: 'Tool ID' })
  @ApiResponse({ status: 200, description: 'Tool removed from collection' })
  async removeTool(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('toolId', ParseUUIDPipe) toolId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionsService.removeTool(id, toolId, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Patch(':id/tools/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder tools in collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({ status: 200, description: 'Tools reordered' })
  async reorderTools(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() toolOrder: { toolId: string; sortOrder: number }[],
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionsService.reorderTools(id, toolOrder, userId);
  }
}
