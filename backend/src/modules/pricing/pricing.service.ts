import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        features: true,
        limits: true,
        monthlyPrice: true,
        yearlyPrice: true,
        currency: true,
        isPopular: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const plan = await this.prisma.pricingPlan.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        features: true,
        limits: true,
        monthlyPrice: true,
        yearlyPrice: true,
        currency: true,
        isActive: true,
        isPopular: true,
        sortOrder: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { subscriptions: true } },
      },
    });

    if (!plan) throw new NotFoundException('Pricing plan not found');
    return plan;
  }

  async create(dto: CreatePlanDto) {
    const existing = await this.prisma.pricingPlan.findFirst({
      where: {
        OR: [
          { slug: dto.slug },
          { name: dto.name },
        ],
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.name === dto.name
          ? 'Plan with this name already exists'
          : 'Plan with this slug already exists',
      );
    }

    try {
      const plan = await this.prisma.pricingPlan.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          features: dto.features || [],
          limits: (dto.limits || {}) as Record<string, unknown>,
          monthlyPrice: dto.monthlyPrice ?? null,
          yearlyPrice: dto.yearlyPrice ?? null,
          currency: dto.currency || 'USD',
          isActive: dto.isActive ?? true,
          isPopular: dto.isPopular ?? false,
          sortOrder: dto.sortOrder ?? 0,
          stripePriceId: dto.stripePriceId,
          stripeYearlyPriceId: dto.stripeYearlyPriceId,
          paypalPlanId: dto.paypalPlanId,
          paddlePriceId: dto.paddlePriceId,
          lemonsqueezyVariantId: dto.lemonsqueezyVariantId,
          metadata: (dto.metadata || {}) as Record<string, unknown>,
        },
      });

      this.logger.log(`Pricing plan created: ${plan.slug}`);
      return plan;
    } catch (error) {
      this.logger.error('Failed to create pricing plan', error);
      throw new InternalServerErrorException('Failed to create pricing plan');
    }
  }

  async update(id: string, dto: UpdatePlanDto) {
    const existing = await this.prisma.pricingPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pricing plan not found');

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.pricingPlan.findUnique({
        where: { slug: dto.slug },
      });
      if (slugExists) throw new ConflictException('Slug is already taken');
    }

    if (dto.name && dto.name !== existing.name) {
      const nameExists = await this.prisma.pricingPlan.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (nameExists) throw new ConflictException('Name is already taken');
    }

    try {
      const plan = await this.prisma.pricingPlan.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.slug !== undefined && { slug: dto.slug }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.features !== undefined && { features: dto.features }),
          ...(dto.limits !== undefined && { limits: dto.limits as Record<string, unknown> }),
          ...(dto.monthlyPrice !== undefined && { monthlyPrice: dto.monthlyPrice }),
          ...(dto.yearlyPrice !== undefined && { yearlyPrice: dto.yearlyPrice }),
          ...(dto.currency !== undefined && { currency: dto.currency }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.isPopular !== undefined && { isPopular: dto.isPopular }),
          ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
          ...(dto.stripePriceId !== undefined && { stripePriceId: dto.stripePriceId }),
          ...(dto.stripeYearlyPriceId !== undefined && { stripeYearlyPriceId: dto.stripeYearlyPriceId }),
          ...(dto.paypalPlanId !== undefined && { paypalPlanId: dto.paypalPlanId }),
          ...(dto.paddlePriceId !== undefined && { paddlePriceId: dto.paddlePriceId }),
          ...(dto.lemonsqueezyVariantId !== undefined && { lemonsqueezyVariantId: dto.lemonsqueezyVariantId }),
          ...(dto.metadata !== undefined && { metadata: dto.metadata as Record<string, unknown> }),
        },
      });

      this.logger.log(`Pricing plan updated: ${plan.slug}`);
      return plan;
    } catch (error) {
      this.logger.error('Failed to update pricing plan', error);
      throw new InternalServerErrorException('Failed to update pricing plan');
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.pricingPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pricing plan not found');

    const subscriptionCount = await this.prisma.subscription.count({
      where: { planId: id },
    });

    if (subscriptionCount > 0) {
      await this.prisma.pricingPlan.update({
        where: { id },
        data: { isActive: false },
      });
      this.logger.log(`Pricing plan deactivated (has ${subscriptionCount} subscriptions): ${existing.slug}`);
      return { deactivated: true, message: 'Plan deactivated due to active subscriptions' };
    }

    await this.prisma.pricingPlan.delete({ where: { id } });
    this.logger.log(`Pricing plan deleted: ${existing.slug}`);
    return { deleted: true };
  }

  async togglePopular(id: string) {
    const existing = await this.prisma.pricingPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pricing plan not found');

    const plan = await this.prisma.pricingPlan.update({
      where: { id },
      data: { isPopular: !existing.isPopular },
    });

    this.logger.log(`Pricing plan popular flag toggled: ${plan.slug} -> ${plan.isPopular}`);
    return plan;
  }
}
