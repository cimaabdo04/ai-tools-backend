import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CmsService } from './cms.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BulkUpdateTranslationsDto } from './dto/translation.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ---- Pages ----

  @Get('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all CMS pages (admin)' })
  @ApiResponse({ status: 200, description: 'List of pages' })
  async findAllPages() {
    const data = await this.cmsService.findAllPages();
    return { data, message: 'Pages fetched successfully' };
  }

  @Public()
  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get a page by slug (public)' })
  @ApiParam({ name: 'slug', description: 'Page slug' })
  @ApiResponse({ status: 200, description: 'Page found' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async findPageBySlug(@Param('slug') slug: string) {
    const data = await this.cmsService.findPageBySlug(slug);
    return { data, message: 'Page fetched successfully' };
  }

  @Post('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new CMS page (admin)' })
  @ApiResponse({ status: 201, description: 'Page created' })
  async createPage(@Body() dto: CreatePageDto) {
    const data = await this.cmsService.createPage(dto);
    return { data, message: 'Page created successfully' };
  }

  @Put('pages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a CMS page (admin)' })
  @ApiParam({ name: 'id', description: 'Page ID' })
  @ApiResponse({ status: 200, description: 'Page updated' })
  async updatePage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePageDto,
  ) {
    const data = await this.cmsService.updatePage(id, dto);
    return { data, message: 'Page updated successfully' };
  }

  @Delete('pages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a CMS page (admin)' })
  @ApiParam({ name: 'id', description: 'Page ID' })
  @ApiResponse({ status: 200, description: 'Page deleted' })
  async deletePage(@Param('id', ParseUUIDPipe) id: string) {
    await this.cmsService.deletePage(id);
    return { message: 'Page deleted successfully' };
  }

  // ---- Blog ----

  @Public()
  @Get('blog')
  @ApiOperation({ summary: 'List blog posts (public, paginated)' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'locale', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Paginated blog posts' })
  async findAllBlogPosts(
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
    @Query('locale') locale?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.cmsService.findAllBlogPosts({
      cursor,
      take: take || 10,
      published: true,
      locale,
      tag,
      search,
    });
    return { data: data.data, meta: data.meta, message: 'Blog posts fetched successfully' };
  }

  @Public()
  @Get('blog/:slug')
  @ApiOperation({ summary: 'Get a blog post by slug (public)' })
  @ApiParam({ name: 'slug', description: 'Blog post slug' })
  @ApiResponse({ status: 200, description: 'Blog post found' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async findBlogPostBySlug(@Param('slug') slug: string) {
    const data = await this.cmsService.findBlogPostBySlug(slug);
    return { data, message: 'Blog post fetched successfully' };
  }

  @Post('blog')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a blog post (admin)' })
  @ApiResponse({ status: 201, description: 'Blog post created' })
  async createBlogPost(
    @Body() dto: CreateBlogDto,
    @CurrentUser() user: any,
  ) {
    const authorName = user.name || user.username || 'Anonymous';
    const data = await this.cmsService.createBlogPost(dto, authorName);
    return { data, message: 'Blog post created successfully' };
  }

  @Put('blog/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog post (admin)' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({ status: 200, description: 'Blog post updated' })
  async updateBlogPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogDto,
  ) {
    const data = await this.cmsService.updateBlogPost(id, dto);
    return { data, message: 'Blog post updated successfully' };
  }

  @Delete('blog/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a blog post (admin)' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({ status: 200, description: 'Blog post deleted' })
  async deleteBlogPost(@Param('id', ParseUUIDPipe) id: string) {
    await this.cmsService.deleteBlogPost(id);
    return { message: 'Blog post deleted successfully' };
  }

  // ---- Translations ----

  @Get('translations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List translations' })
  @ApiQuery({ name: 'locale', required: false })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiQuery({ name: 'key', required: false })
  @ApiResponse({ status: 200, description: 'List of translations' })
  async findAllTranslations(
    @Query('locale') locale?: string,
    @Query('namespace') namespace?: string,
    @Query('key') key?: string,
  ) {
    const data = await this.cmsService.findAllTranslations({ locale, namespace, key });
    return { data, message: 'Translations fetched successfully' };
  }

  @Put('translations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update translations (admin)' })
  @ApiResponse({ status: 200, description: 'Translations updated' })
  async updateTranslations(@Body() dto: BulkUpdateTranslationsDto) {
    const data = await this.cmsService.updateTranslations(dto);
    return { data, message: 'Translations updated successfully' };
  }
}
