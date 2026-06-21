import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { Prisma, Review } from '@prisma/client';

const reviewInclude = {
  user: {
    select: { id: true, name: true, username: true, avatarUrl: true },
  },
} as const;

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByTool(
    toolId: string,
    query: ReviewQueryDto,
  ) {
    const { cursor, take = 10, minRating, sortBy = 'newest' } = query;

    const where: Prisma.ReviewWhereInput = { toolId };

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    const orderBy: Prisma.ReviewOrderByWithRelationInput =
      sortBy === 'oldest' ? { createdAt: 'asc' }
      : sortBy === 'highest' ? { rating: 'desc' }
      : sortBy === 'lowest' ? { rating: 'asc' }
      : { createdAt: 'desc' };

    const [total, reviews] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        orderBy,
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: reviewInclude,
      }),
    ]);

    const hasMore = reviews.length > take;
    const data = hasMore ? reviews.slice(0, take) : reviews;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data,
      meta: { cursor: nextCursor, hasMore, total },
    };
  }

  async findByUser(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        ...reviewInclude,
        tool: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
    });

    return { data: reviews };
  }

  async create(dto: CreateReviewDto, userId: string): Promise<Review> {
    const existing = await this.prisma.review.findUnique({
      where: { userId_toolId: { userId, toolId: dto.toolId } },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this tool');
    }

    const tool = await this.prisma.tool.findUnique({ where: { id: dto.toolId } });
    if (!tool) {
      throw new NotFoundException(`Tool with ID "${dto.toolId}" not found`);
    }

    const review = await this.prisma.review.create({
      data: {
        title: dto.title,
        content: dto.content,
        rating: dto.rating,
        pros: dto.pros ?? [],
        cons: dto.cons ?? [],
        userId,
        toolId: dto.toolId,
      },
      include: reviewInclude,
    });

    await this.updateToolRating(dto.toolId);

    return review;
  }

  async update(id: string, dto: UpdateReviewDto, userId: string): Promise<Review> {
    const review = await this.findById(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const data: Prisma.ReviewUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.rating !== undefined) data.rating = dto.rating;
    if (dto.pros !== undefined) data.pros = dto.pros;
    if (dto.cons !== undefined) data.cons = dto.cons;

    const updated = await this.prisma.review.update({
      where: { id },
      data,
      include: reviewInclude,
    });

    if (dto.rating !== undefined) {
      await this.updateToolRating(review.toolId);
    }

    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.findById(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({ where: { id } });

    await this.updateToolRating(review.toolId);
  }

  async markHelpful(id: string): Promise<Review> {
    const review = await this.findById(id);

    const updated = await this.prisma.review.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
      include: reviewInclude,
    });

    return updated;
  }

  async findById(id: string): Promise<Review> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: reviewInclude,
    });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    return review;
  }

  async updateToolRating(toolId: string): Promise<void> {
    const aggregation = await this.prisma.review.aggregate({
      where: { toolId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = aggregation._avg.rating ?? 0;
    const reviewCount = aggregation._count.rating;

    await this.prisma.tool.update({
      where: { id: toolId },
      data: {
        averageRating,
        reviewCount,
      },
    });
  }
}
