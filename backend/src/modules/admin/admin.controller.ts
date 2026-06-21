import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ToolsService } from '@modules/tools/tools.service';
import { UsersService } from '@modules/users/users.service';
import { CategoriesService } from '@modules/categories/categories.service';
import { ToolQueryDto } from '@modules/tools/dto/tool-query.dto';
import { ToolStatusDto } from '@modules/tools/dto/tool-status.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly toolsService: ToolsService,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard overview stats' })
  async getDashboard() {
    const [allTools, totalUsers, userStats] = await Promise.all([
      this.toolsService.findAll({ take: 100 }),
      this.usersService.getStatistics(),
      this.usersService.findAll({ take: 1 }),
    ]);

    const tools = allTools.data || [];
    const approved = tools.filter((t) => t.status === 'APPROVED');
    const pending = tools.filter((t) => t.status === 'PENDING_REVIEW');

    return {
      stats: {
        totalTools: tools.length,
        totalUsers: totalUsers?.totalUsers ?? 0,
        totalReviews: tools.reduce((s: number, t: any) => s + (t.reviewCount || 0), 0),
        totalRevenue: 0,
        toolsChange: 0,
        usersChange: 0,
        reviewsChange: 0,
        revenueChange: 0,
        revenueData: [],
        userGrowthData: [],
        recentTools: approved.slice(0, 5).map((t: any) => ({
          id: t.id,
          name: t.name,
          status: t.status?.toLowerCase() || 'approved',
          category: t.toolCategories?.[0]?.category?.name || '',
          createdAt: t.createdAt,
        })),
        recentUsers: [],
      },
    };
  }

  @Get('tools')
  @ApiOperation({ summary: 'Admin tools list' })
  async getTools(@Query() query: ToolQueryDto) {
    const result = await this.toolsService.findAll(query);
    const tools = (result.data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      status: t.status?.toLowerCase() || 'pending',
      category: t.toolCategories?.[0]?.category || { name: '' },
      featured: t.isFeatured || false,
      verified: t.isVerified || false,
      rating: t.averageRating || 0,
      reviewCount: t.reviewCount || 0,
      createdAt: t.createdAt,
    }));

    return {
      tools,
      total: result.meta?.total || tools.length,
      totalPages: Math.ceil((result.meta?.total || tools.length) / (query.take || 10)),
    };
  }

  @Get('tools/:id')
  @ApiOperation({ summary: 'Admin tool detail' })
  async getTool(@Param('id', ParseUUIDPipe) id: string) {
    const tool: any = await this.toolsService.findById(id);
    return {
      tool: {
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        description: tool.description,
        tagline: tool.tagline,
        website: tool.websiteUrl,
        logo: tool.logoUrl,
        screenshot: tool.screenshotUrl,
        videoUrl: tool.videoUrl,
        pricingModel: tool.pricingTypes || 'free',
        pricingStartingAt: tool.pricingMin,
        category: tool.toolCategories?.[0]?.category || { id: '', name: '' },
        tags: tool.tags?.map((tt: any) => ({ id: tt.tag.id, name: tt.tag.name })) || [],
        features: tool.features as string[] || [],
        platforms: tool.platforms as string[] || [],
        status: tool.status?.toLowerCase() || 'pending',
        featured: tool.isFeatured || false,
        verified: tool.isVerified || false,
        rating: tool.averageRating || 0,
        reviewCount: tool.reviewCount || 0,
        views: tool.viewCount || 0,
        clicks: tool.clickCount || 0,
        createdAt: tool.createdAt,
        analytics: { viewsData: [], clicksData: [] },
        badge: tool.badge,
        highlight: tool.highlight,
        stats: tool.stats,
        models: tool.models,
        gallery: tool.gallery || '[]',
        seoTitle: tool.seoTitle,
        seoDescription: tool.seoDescription,
        pros: tool.pros,
        cons: tool.cons,
        useCases: tool.useCases,
        targetAudience: tool.targetAudience,
        arabicSupport: tool.arabicSupport,
        twitterUrl: tool.twitterUrl,
        discordUrl: tool.discordUrl,
        githubUrl: tool.githubUrl,
        alternativesText: tool.alternativesText,
        alternativeSlugs: tool.alternativeSlugs || '[]',
        startSteps: tool.startSteps || '[]',
        conclusion: tool.conclusion,
        faqs: tool.faqs,
      },
    };
  }

  @Post('tools')
  @ApiOperation({ summary: 'Admin create tool' })
  async createTool(@Body() body: Record<string, unknown>) {
    const { website, logo, screenshot, pricingModel, pricingStartingAt,
      category, tags, ...rest } = body;

    const mapped: Record<string, unknown> = { ...rest };

    if (website !== undefined) mapped.websiteUrl = website as string;
    if (logo !== undefined) mapped.logoUrl = logo as string;
    if (screenshot !== undefined) mapped.screenshotUrl = screenshot as string;
    if (pricingModel !== undefined) mapped.pricingTypes = [pricingModel as string];
    if (pricingStartingAt !== undefined) mapped.pricingMin = pricingStartingAt;

    if (category !== undefined && typeof category === 'object') {
      const cat = category as { id?: string };
      if (cat.id) {
        mapped.categoryIds = [cat.id];
      }
    }

    if (tags !== undefined && Array.isArray(tags)) {
      mapped.tagIds = tags.map((t: any) => (typeof t === 'string' ? t : t.id)).filter(Boolean);
    }

    const tool = await this.toolsService.create(mapped as any, body.authorId as string || '');
    return { tool: { id: tool.id } };
  }

  @Patch('tools/:id')
  @ApiOperation({ summary: 'Admin update tool' })
  async updateTool(@Param('id', ParseUUIDPipe) id: string, @Body() body: Record<string, unknown>) {
    const { status, featured, verified, category, tags, features, platforms,
      website, logo, screenshot, pricingModel, pricingStartingAt,
      ...rest } = body;

    const mapped: Record<string, unknown> = { ...rest };

    if (website !== undefined) mapped.websiteUrl = website;
    if (logo !== undefined) mapped.logoUrl = logo;
    if (screenshot !== undefined) mapped.screenshotUrl = screenshot;
    if (pricingModel !== undefined) {
      mapped.pricingTypes = [pricingModel as string];
    }
    if (pricingStartingAt !== undefined) mapped.pricingMin = pricingStartingAt;
    if (features !== undefined) mapped.features = features;
    if (platforms !== undefined) mapped.platforms = platforms;

    if (category !== undefined && typeof category === 'object') {
      const cat = category as { id?: string };
      if (cat.id) {
        mapped.categoryIds = [cat.id];
      }
    }

    if (tags !== undefined && Array.isArray(tags)) {
      mapped.tagIds = tags.map((t: any) => (typeof t === 'string' ? t : t.id)).filter(Boolean);
    }

    if (status && typeof status === 'string') {
      await this.toolsService.updateStatus(id, { status: status.toUpperCase() as any });
    }
    if (featured !== undefined) {
      const tool = await this.toolsService.findById(id);
      if (featured && !tool.isFeatured) {
        await this.toolsService.toggleFeatured(id);
      } else if (!featured && tool.isFeatured) {
        await this.toolsService.toggleFeatured(id);
      }
    }
    if (verified !== undefined) {
      mapped.isVerified = verified;
    }

    if (Object.keys(mapped).length > 0) {
      await this.toolsService.update(id, mapped as any);
    }

    return { success: true };
  }

  @Delete('tools/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Admin delete tool' })
  async deleteTool(@Param('id', ParseUUIDPipe) id: string) {
    await this.toolsService.remove(id);
  }

  @Get('tools/:id/faqs')
  @ApiOperation({ summary: 'Get tool FAQs' })
  async getToolFaqs(@Param('id', ParseUUIDPipe) id: string) {
    return this.toolsService.findFaqs(id);
  }

  @Post('tools/:id/faqs')
  @ApiOperation({ summary: 'Create tool FAQ' })
  async createToolFaq(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { question: string; answer: string; sortOrder?: number },
  ) {
    return this.toolsService.createFaq(id, body);
  }

  @Patch('tools/:id/faqs/:faqId')
  @ApiOperation({ summary: 'Update tool FAQ' })
  async updateToolFaq(
    @Param('faqId') faqId: string,
    @Body() body: { question?: string; answer?: string; sortOrder?: number },
  ) {
    return this.toolsService.updateFaq(faqId, body);
  }

  @Delete('tools/:id/faqs/:faqId')
  @ApiOperation({ summary: 'Delete tool FAQ' })
  async deleteToolFaq(@Param('faqId') faqId: string) {
    return this.toolsService.deleteFaq(faqId);
  }

  @Post('tools/bulk')
  @ApiOperation({ summary: 'Bulk tool actions' })
  async bulkTools(@Body() body: { ids: string[]; action: string }) {
    const { ids, action } = body;
    for (const id of ids) {
      try {
        if (action === 'approve') {
          await this.toolsService.updateStatus(id, { status: 'APPROVED' as any });
        } else if (action === 'reject') {
          await this.toolsService.updateStatus(id, { status: 'REJECTED' as any });
        } else if (action === 'feature') {
          await this.toolsService.toggleFeatured(id);
        }
      } catch {}
    }
    return { success: true };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Admin categories list' })
  async getCategories() {
    const categories = await this.categoriesService.findAll(true);
    return {
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        toolCount: cat.toolCount || 0,
        sortOrder: cat.sortOrder || 0,
      })),
    };
  }

  @Post('categories')
  @ApiOperation({ summary: 'Admin create category' })
  async createCategory(@Body() body: any) {
    return this.categoriesService.create(body);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Admin update category' })
  async updateCategory(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return this.categoriesService.update(id, body);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Admin delete category' })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
  }

  @Post('categories/reorder')
  @ApiOperation({ summary: 'Admin reorder categories' })
  async reorderCategories(@Body() body: { orders: { id: string; sortOrder: number }[] }) {
    for (const order of body.orders) {
      await this.categoriesService.update(order.id, { sortOrder: order.sortOrder });
    }
    return { success: true };
  }

  @Get('users')
  @ApiOperation({ summary: 'Admin users list' })
  async getUsers() {
    const users = await this.usersService.findAll({ take: 100 });
    const list = (users as any)?.data || users || [];
    return {
      users: Array.isArray(list)
        ? list.map((u: any) => ({
            id: u.id,
            name: u.name || u.email,
            email: u.email,
            role: u.role?.toLowerCase() || 'user',
            status: u.status || 'active',
            toolsCount: u._count?.tools || 0,
            createdAt: u.createdAt,
          }))
        : [],
      total: Array.isArray(list) ? list.length : 0,
    };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Admin user detail' })
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    const user: any = await this.usersService.findById(id);
    return {
      user: {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        role: user.role?.toLowerCase() || 'user',
        status: user.status || 'active',
        toolsCount: user._count?.tools || 0,
        reviewsCount: user._count?.reviews || 0,
        createdAt: user.createdAt,
      },
    };
  }
}
