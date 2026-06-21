import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import { CmsService } from './cms.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Admin CMS')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
@Controller('admin/cms')
@ApiBearerAuth()
export class AdminCmsController {
  constructor(
    private readonly cmsService: CmsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('blog/:id')
  @ApiOperation({ summary: 'Get a single blog post by ID (admin)' })
  async findBlogPost(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.cmsService.findBlogPostById(id);
    return { data };
  }

  @Get('blog')
  @ApiOperation({ summary: 'List all blog posts (admin, paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAllBlogPosts(@Query('page') page?: number, @Query('limit') limit?: number) {
    const p = page ?? 1;
    const l = limit ?? 20;
    const skip = (p - 1) * l;
    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogPost.count(),
    ]);
    return {
      posts,
      total,
      totalPages: Math.ceil(total / l),
    };
  }

  @Post('blog')
  @ApiOperation({ summary: 'Create a blog post' })
  async createBlogPost(@Body() dto: CreateBlogDto, @CurrentUser() user: any) {
    const authorName = user.name || user.username || 'Anonymous';
    const data = await this.cmsService.createBlogPost(dto, authorName);
    return { data, message: 'Blog post created successfully' };
  }

  @Put('blog/:id')
  @ApiOperation({ summary: 'Update a blog post' })
  async updateBlogPost(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBlogDto) {
    const data = await this.cmsService.updateBlogPost(id, dto);
    return { data, message: 'Blog post updated successfully' };
  }

  @Patch('blog/:id')
  @ApiOperation({ summary: 'Toggle blog post published status' })
  async toggleBlogPost(@Param('id', ParseUUIDPipe) id: string, @Body('published') published: boolean) {
    const data = await this.cmsService.updateBlogPost(id, { published });
    return { data, message: 'Blog post updated successfully' };
  }

  @Delete('blog/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a blog post' })
  async deleteBlogPost(@Param('id', ParseUUIDPipe) id: string) {
    await this.cmsService.deleteBlogPost(id);
    return { message: 'Blog post deleted successfully' };
  }

  // ---- Pages ----

  @Get('pages')
  @ApiOperation({ summary: 'List all CMS pages' })
  async findAllPages() {
    const data = await this.cmsService.findAllPages();
    return { pages: data };
  }

  @Post('pages')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a CMS page' })
  async createPage(@Body() dto: CreatePageDto) {
    const data = await this.cmsService.createPage(dto);
    return { data, message: 'Page created successfully' };
  }

  @Put('pages/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a CMS page' })
  async updatePage(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePageDto) {
    const data = await this.cmsService.updatePage(id, dto);
    return { data, message: 'Page updated successfully' };
  }

  @Patch('pages/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Toggle page published status' })
  async togglePage(@Param('id', ParseUUIDPipe) id: string, @Body('published') published: boolean) {
    const data = await this.cmsService.updatePage(id, { published } as any);
    return { data, message: 'Page updated successfully' };
  }

  @Delete('pages/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a CMS page' })
  async deletePage(@Param('id', ParseUUIDPipe) id: string) {
    await this.cmsService.deletePage(id);
    return { message: 'Page deleted successfully' };
  }

}
