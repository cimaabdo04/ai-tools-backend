import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateWhiteLabelDto } from './dto/create-white-label.dto';
import { UpdateWhiteLabelDto } from './dto/update-white-label.dto';
import { WhiteLabelConfig } from '@prisma/client';

@Injectable()
export class WhiteLabelService {
  constructor(private readonly prisma: PrismaService) {}

  async getActive(): Promise<WhiteLabelConfig | null> {
    return this.prisma.whiteLabelConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateWhiteLabelDto): Promise<WhiteLabelConfig> {
    if (dto.isActive !== false) {
      await this.deactivateAll();
    }

    return this.prisma.whiteLabelConfig.create({
      data: {
        name: dto.name ?? 'AI Tools Directory',
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        primaryColor: dto.primaryColor ?? '#6366f1',
        secondaryColor: dto.secondaryColor ?? '#8b5cf6',
        fontFamily: dto.fontFamily ?? 'Inter',
        customDomain: dto.customDomain,
        customCss: dto.customCss,
        footerHtml: dto.footerHtml,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateWhiteLabelDto): Promise<WhiteLabelConfig> {
    await this.findById(id);

    return this.prisma.whiteLabelConfig.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.faviconUrl !== undefined && { faviconUrl: dto.faviconUrl }),
        ...(dto.primaryColor !== undefined && { primaryColor: dto.primaryColor }),
        ...(dto.secondaryColor !== undefined && { secondaryColor: dto.secondaryColor }),
        ...(dto.fontFamily !== undefined && { fontFamily: dto.fontFamily }),
        ...(dto.customDomain !== undefined && { customDomain: dto.customDomain }),
        ...(dto.customCss !== undefined && { customCss: dto.customCss }),
        ...(dto.footerHtml !== undefined && { footerHtml: dto.footerHtml }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async activate(id: string): Promise<WhiteLabelConfig> {
    await this.findById(id);
    await this.deactivateAll();

    return this.prisma.whiteLabelConfig.update({
      where: { id },
      data: { isActive: true },
    });
  }

  private async findById(id: string): Promise<WhiteLabelConfig> {
    const config = await this.prisma.whiteLabelConfig.findUnique({ where: { id } });
    if (!config) {
      throw new NotFoundException(`White label config with ID "${id}" not found`);
    }
    return config;
  }

  private async deactivateAll(): Promise<void> {
    await this.prisma.whiteLabelConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }
}
