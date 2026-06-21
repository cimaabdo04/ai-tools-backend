import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
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
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ToolQueryDto, ToolSortBy } from './dto/tool-query.dto';
import { ToolStatusDto } from './dto/tool-status.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List tools with pagination, search, and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of tools' })
  async findAll(@Query() query: ToolQueryDto) {
    return this.toolsService.findAll(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured tools' })
  @ApiResponse({ status: 200, description: 'Featured tools list' })
  async getFeatured(@Query() query: ToolQueryDto) {
    return this.toolsService.getFeatured(query);
  }

  @Public()
  @Get('sponsored')
  @ApiOperation({ summary: 'Get sponsored tools' })
  @ApiResponse({ status: 200, description: 'Sponsored tools list' })
  async getSponsored(@Query() query: ToolQueryDto) {
    return this.toolsService.getSponsored(query);
  }

  @Public()
  @Get('latest')
  @ApiOperation({ summary: 'Get latest tools' })
  @ApiResponse({ status: 200, description: 'Latest tools list' })
  async getLatest(@Query() query: ToolQueryDto) {
    return this.toolsService.getLatest(query);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending tools (most viewed in last 30 days)' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of tools (default: 10)' })
  @ApiResponse({ status: 200, description: 'Trending tools list' })
  async getTrending(@Query('take') take?: number) {
    const data = await this.toolsService.getTrending(take || 10);
    return { data };
  }

  @Public()
  @Get('search/suggestions')
  @ApiOperation({ summary: 'Autocomplete suggestions for search' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max suggestions' })
  @ApiResponse({ status: 200, description: 'Search suggestions' })
  async getSuggestions(@Query('q') q: string, @Query('limit') limit?: number) {
    const data = await this.toolsService.getSuggestions(q || '', limit || 8);
    return { data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get tool by slug with full details' })
  @ApiParam({ name: 'slug', description: 'Tool slug' })
  @ApiResponse({ status: 200, description: 'Tool details' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.toolsService.findBySlug(slug);
  }

  @Public()
  @Get(':slug/comparison-data')
  @ApiOperation({ summary: 'Get tool data for comparison' })
  @ApiParam({ name: 'slug', description: 'Tool slug' })
  @ApiResponse({ status: 200, description: 'Tool comparison data' })
  async getComparisonData(@Param('slug') slug: string) {
    return this.toolsService.getComparisonData(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tool' })
  @ApiResponse({ status: 201, description: 'Tool created' })
  async create(@Body() dto: CreateToolDto, @CurrentUser('id') userId: string) {
    return this.toolsService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tool (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Tool ID' })
  @ApiResponse({ status: 200, description: 'Tool updated' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateToolDto,
    @CurrentUser() user: any,
  ) {
    const tool = await this.toolsService.findById(id);
    const isOwner = tool.authorId === user.id;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(user.role);

    if (!isOwner && !isAdmin) {
      return { success: false, message: 'Not authorized', data: null };
    }

    return this.toolsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tool (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Tool ID' })
  @ApiResponse({ status: 204, description: 'Tool deleted' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const tool = await this.toolsService.findById(id);
    const isOwner = tool.authorId === user.id;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(user.role);

    if (!isOwner && !isAdmin) {
      return { success: false, message: 'Not authorized', data: null };
    }

    await this.toolsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change tool status (admin)' })
  @ApiParam({ name: 'id', description: 'Tool ID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToolStatusDto,
  ) {
    return this.toolsService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Post(':id/feature')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle featured status (admin)' })
  @ApiParam({ name: 'id', description: 'Tool ID' })
  @ApiResponse({ status: 200, description: 'Featured status toggled' })
  async toggleFeatured(@Param('id', ParseUUIDPipe) id: string) {
    return this.toolsService.toggleFeatured(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get(':id/analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tool analytics' })
  @ApiParam({ name: 'id', description: 'Tool ID' })
  @ApiResponse({ status: 200, description: 'Tool analytics' })
  async getAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const tool = await this.toolsService.findById(id);
    const isOwner = tool.authorId === user.id;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(user.role);

    if (!isOwner && !isAdmin) {
      return { success: false, message: 'Not authorized', data: null };
    }

    return this.toolsService.getAnalytics(id);
  }

  @Public()
  @Post(':id/click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a click event for a tool' })
  @ApiParam({ name: 'id', description: 'Tool ID' })
  @ApiResponse({ status: 200, description: 'Click recorded' })
  async recordClick(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    await this.toolsService.recordClick(id, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers['referer'] || req.headers['referrer'],
    });
    return { message: 'Click recorded' };
  }

  @Public()
  @Post(':id/feedback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record helpful/not helpful feedback for a tool' })
  @ApiParam({ name: 'id', description: 'Tool ID' })
  @ApiResponse({ status: 200, description: 'Feedback recorded' })
  async recordFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { type: 'helpful' | 'notHelpful' },
  ) {
    if (!body.type || !['helpful', 'notHelpful'].includes(body.type)) {
      return { success: false, message: 'Invalid feedback type' };
    }
    return this.toolsService.recordFeedback(id, body.type);
  }
}
