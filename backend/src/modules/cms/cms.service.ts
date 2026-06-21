import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BulkUpdateTranslationsDto } from './dto/translation.dto';
import { Page, BlogPost, Translation, Prisma } from '@prisma/client';

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---- Pages ----

  async findAllPages(): Promise<Page[]> {
    return this.prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPageBySlug(slug: string): Promise<Page> {
    const page = await this.prisma.page.findUnique({
      where: { slug },
    });
    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return page;
  }

  async findPageById(id: string): Promise<Page> {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID "${id}" not found`);
    }
    return page;
  }

  async createPage(dto: CreatePageDto): Promise<Page> {
    const existing = await this.prisma.page.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Page with slug "${dto.slug}" already exists`);
    }

    return this.prisma.page.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        content: dto.content ?? Prisma.JsonNull,
        template: dto.template ?? 'default',
        published: dto.published ?? false,
        locale: dto.locale ?? 'en',
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        metadata: dto.metadata ?? Prisma.JsonNull,
      },
    });
  }

  async updatePage(id: string, dto: UpdatePageDto): Promise<Page> {
    await this.findPageById(id);

    if (dto.slug) {
      const existing = await this.prisma.page.findUnique({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Page with slug "${dto.slug}" already exists`);
      }
    }

    const data: Prisma.PageUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.content !== undefined) data.content = dto.content as any;
    if (dto.template !== undefined) data.template = dto.template;
    if (dto.published !== undefined) data.published = dto.published;
    if (dto.locale !== undefined) data.locale = dto.locale;
    if (dto.seoTitle !== undefined) data.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) data.seoDescription = dto.seoDescription;
    if (dto.metadata !== undefined) data.metadata = dto.metadata as any;

    return this.prisma.page.update({
      where: { id },
      data,
    });
  }

  async deletePage(id: string): Promise<void> {
    await this.findPageById(id);
    await this.prisma.page.delete({ where: { id } });
  }

  // ---- Blog ----

  async findAllBlogPosts(params: {
    cursor?: string;
    take?: number;
    published?: boolean;
    locale?: string;
    tag?: string;
    search?: string;
  }): Promise<{ data: BlogPost[]; meta: { cursor: string | null; hasMore: boolean; total: number } }> {
    const { cursor, take = 10, published, locale, tag, search } = params;

    const where: Prisma.BlogPostWhereInput = {};
    if (published !== undefined) where.published = published;
    if (locale) where.locale = locale;
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    const [total, posts] = await Promise.all([
      this.prisma.blogPost.count({ where }),
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      }),
    ]);

    const hasMore = posts.length > take;
    const data = hasMore ? posts.slice(0, take) : posts;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data,
      meta: { cursor: nextCursor, hasMore, total },
    };
  }

  async findBlogPostBySlug(slug: string): Promise<BlogPost> {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    await this.prisma.blogPost
      .update({
        where: { slug },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => this.logger.error(`Failed to increment blog view: ${err.message}`));

    return post;
  }

  async findBlogPostById(id: string): Promise<BlogPost> {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Blog post with ID "${id}" not found`);
    }
    return post;
  }

  async createBlogPost(dto: CreateBlogDto, authorName: string): Promise<BlogPost> {
    const existing = await this.prisma.blogPost.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Blog post with slug "${dto.slug}" already exists`);
    }

    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        videoUrl: dto.videoUrl,
        authorName,
        published: dto.published ?? false,
        ...(dto.published ? { publishedAt: new Date() } : {}),
        tags: dto.tags ?? [],
        locale: dto.locale ?? 'en',
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        canonicalUrl: dto.canonicalUrl,
      },
    });
  }

  async updateBlogPost(id: string, dto: UpdateBlogDto): Promise<BlogPost> {
    await this.findBlogPostById(id);

    if (dto.slug) {
      const existing = await this.prisma.blogPost.findUnique({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Blog post with slug "${dto.slug}" already exists`);
      }
    }

    const data: Prisma.BlogPostUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.locale !== undefined) data.locale = dto.locale;
    if (dto.seoTitle !== undefined) data.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) data.seoDescription = dto.seoDescription;
    if (dto.canonicalUrl !== undefined) data.canonicalUrl = dto.canonicalUrl;
    if (dto.published !== undefined) {
      data.published = dto.published;
      if (dto.published) {
        data.publishedAt = new Date();
      }
    }

    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async deleteBlogPost(id: string): Promise<void> {
    await this.findBlogPostById(id);
    await this.prisma.blogPost.delete({ where: { id } });
  }

  // ---- Translations ----

  async findAllTranslations(params?: {
    locale?: string;
    namespace?: string;
    key?: string;
  }): Promise<Translation[]> {
    const where: Prisma.TranslationWhereInput = { isActive: true };
    if (params?.locale) where.locale = params.locale;
    if (params?.namespace) where.namespace = params.namespace;
    if (params?.key) where.key = { contains: params.key };

    return this.prisma.translation.findMany({
      where,
      orderBy: [{ namespace: 'asc' }, { key: 'asc' }],
    });
  }

  async updateTranslations(dto: BulkUpdateTranslationsDto): Promise<{ count: number }> {
    let count = 0;

    for (const entry of dto.translations) {
      await this.prisma.translation.upsert({
        where: {
          key_locale_namespace: {
            key: entry.key,
            locale: entry.locale,
            namespace: entry.namespace ?? 'common',
          },
        },
        create: {
          key: entry.key,
          locale: entry.locale,
          value: entry.value,
          namespace: entry.namespace ?? 'common',
          group: entry.group,
          isActive: entry.isActive ?? true,
        },
        update: {
          value: entry.value,
          group: entry.group,
          isActive: entry.isActive ?? true,
        },
      });
      count++;
    }

    return { count };
  }
}
