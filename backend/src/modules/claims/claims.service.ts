import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { Prisma, ClaimRequest, ClaimStatus } from '@prisma/client';

const claimInclude = {
  user: {
    select: { id: true, name: true, username: true, avatarUrl: true },
  },
  tool: {
    select: { id: true, name: true, slug: true, logoUrl: true, websiteUrl: true },
  },
  reviewer: {
    select: { id: true, name: true, username: true },
  },
};

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClaimDto, userId: string): Promise<ClaimRequest> {
    const tool = await this.prisma.tool.findUnique({ where: { id: dto.toolId } });
    if (!tool) {
      throw new NotFoundException(`Tool with ID "${dto.toolId}" not found`);
    }

    const existing = await this.prisma.claimRequest.findFirst({
      where: {
        toolId: dto.toolId,
        userId,
        status: { in: [ClaimStatus.PENDING, ClaimStatus.APPROVED] },
      },
    });

    if (existing) {
      throw new ConflictException('You already have a pending or approved claim for this tool');
    }

    return this.prisma.claimRequest.create({
      data: {
        toolId: dto.toolId,
        userId,
        evidence: dto.evidence,
        notes: dto.notes,
      },
      include: claimInclude,
    });
  }

  async findUserClaims(userId: string): Promise<ClaimRequest[]> {
    return this.prisma.claimRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: claimInclude,
    });
  }

  async findAll(query: {
    cursor?: string;
    take?: number;
    status?: ClaimStatus;
    search?: string;
  }): Promise<{ data: ClaimRequest[]; meta: { cursor: string | null; hasMore: boolean; total: number } }> {
    const { cursor, take = 10, status, search } = query;

    const where: Prisma.ClaimRequestWhereInput = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { notes: { contains: search } },
        { evidence: { contains: search } },
      ];
    }

    const [total, claims] = await Promise.all([
      this.prisma.claimRequest.count({ where }),
      this.prisma.claimRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: claimInclude,
      }),
    ]);

    const hasMore = claims.length > take;
    const data = hasMore ? claims.slice(0, take) : claims;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, meta: { cursor: nextCursor, hasMore, total } };
  }

  async findById(id: string): Promise<ClaimRequest> {
    const claim = await this.prisma.claimRequest.findUnique({
      where: { id },
      include: claimInclude,
    });

    if (!claim) {
      throw new NotFoundException(`Claim request with ID "${id}" not found`);
    }

    return claim;
  }

  async approve(id: string, dto: ReviewClaimDto, reviewerId: string): Promise<ClaimRequest> {
    const claim = await this.findById(id);

    if (claim.status !== ClaimStatus.PENDING) {
      throw new BadRequestException(`Cannot approve a claim with status "${claim.status}"`);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.claimRequest.update({
        where: { id },
        data: {
          status: ClaimStatus.APPROVED,
          reviewNote: dto.reviewNote,
          reviewedBy: reviewerId,
          decidedAt: new Date(),
        },
        include: claimInclude,
      }),
      this.prisma.tool.update({
        where: { id: claim.toolId },
        data: { isVerified: true },
      }),
    ]);

    return updated;
  }

  async reject(id: string, dto: ReviewClaimDto, reviewerId: string): Promise<ClaimRequest> {
    const claim = await this.findById(id);

    if (claim.status !== ClaimStatus.PENDING) {
      throw new BadRequestException(`Cannot reject a claim with status "${claim.status}"`);
    }

    return this.prisma.claimRequest.update({
      where: { id },
      data: {
        status: ClaimStatus.REJECTED,
        reviewNote: dto.reviewNote,
        reviewedBy: reviewerId,
        decidedAt: new Date(),
      },
      include: claimInclude,
    });
  }

  async appeal(id: string, userId: string): Promise<ClaimRequest> {
    const claim = await this.findById(id);

    if (claim.userId !== userId) {
      throw new ForbiddenException('You can only appeal your own claims');
    }

    if (claim.status !== ClaimStatus.REJECTED) {
      throw new BadRequestException('Can only appeal rejected claims');
    }

    return this.prisma.claimRequest.update({
      where: { id },
      data: {
        status: ClaimStatus.APPEALED,
        decidedAt: null,
        reviewedBy: null,
      },
      include: claimInclude,
    });
  }
}
