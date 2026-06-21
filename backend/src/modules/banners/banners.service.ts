import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner } from '@prisma/client';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByPlacement(placement: string): Promise<Banner[]> {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        placement,
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateBannerDto, userId?: string): Promise<Banner> {
    return this.prisma.banner.create({
      data: {
        name: dto.name,
        type: dto.type,
        imageUrl: dto.imageUrl,
        htmlContent: dto.htmlContent,
        linkUrl: dto.linkUrl,
        placement: dto.placement,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isActive: dto.isActive ?? true,
        userId,
      },
    });
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    await this.findById(id);

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.htmlContent !== undefined) data.htmlContent = dto.htmlContent;
    if (dto.linkUrl !== undefined) data.linkUrl = dto.linkUrl;
    if (dto.placement !== undefined) data.placement = dto.placement;
    if (dto.startDate !== undefined) data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.banner.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.banner.delete({ where: { id } });
  }

  async recordClick(id: string): Promise<void> {
    await this.prisma.banner.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  }

  private async findById(id: string): Promise<Banner> {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID "${id}" not found`);
    }
    return banner;
  }
}
