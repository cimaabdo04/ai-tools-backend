import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKey } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  private readonly KEY_PREFIX = 'ak_';

  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string): Promise<ApiKey[]> {
    return this.prisma.apiKey.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        requestsCount: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        ipWhitelist: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateApiKeyDto, userId: string): Promise<{ apiKey: Partial<ApiKey>; rawKey: string }> {
    const rawKey = this.generateKey();
    const prefix = rawKey.slice(0, 8);
    const hashedKey = this.hashKey(rawKey);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name: dto.name,
        key: hashedKey,
        prefix,
        userId,
        permissions: dto.permissions ?? ['read:tools'],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        ipWhitelist: dto.ipWhitelist ?? [],
      },
    });

    return {
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        ipWhitelist: apiKey.ipWhitelist,
        createdAt: apiKey.createdAt,
      },
      rawKey,
    };
  }

  async update(id: string, dto: UpdateApiKeyDto, userId: string): Promise<ApiKey> {
    const key = await this.findByIdAndUser(id, userId);

    return this.prisma.apiKey.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.permissions !== undefined && { permissions: dto.permissions }),
        ...(dto.ipWhitelist !== undefined && { ipWhitelist: dto.ipWhitelist }),
      },
      select: {
        id: true, name: true, prefix: true, permissions: true,
        requestsCount: true, lastUsedAt: true, expiresAt: true,
        isActive: true, ipWhitelist: true, createdAt: true, updatedAt: true,
      },
    });
  }

  async revoke(id: string, userId: string): Promise<void> {
    const key = await this.findByIdAndUser(id, userId);

    await this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async rotate(id: string, userId: string): Promise<{ apiKey: Partial<ApiKey>; rawKey: string }> {
    const key = await this.findByIdAndUser(id, userId);

    const rawKey = this.generateKey();
    const prefix = rawKey.slice(0, 8);
    const hashedKey = this.hashKey(rawKey);

    const updated = await this.prisma.apiKey.update({
      where: { id },
      data: {
        key: hashedKey,
        prefix,
        lastUsedAt: null,
      },
    });

    return {
      apiKey: {
        id: updated.id,
        name: updated.name,
        prefix: updated.prefix,
        permissions: updated.permissions,
        expiresAt: updated.expiresAt,
        ipWhitelist: updated.ipWhitelist,
        createdAt: updated.createdAt,
      },
      rawKey,
    };
  }

  async validateKey(rawKey: string): Promise<ApiKey | null> {
    const hashedKey = this.hashKey(rawKey);

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key: hashedKey },
    });

    if (!apiKey || !apiKey.isActive) return null;

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        lastUsedAt: new Date(),
        requestsCount: { increment: 1 },
      },
    });

    return apiKey;
  }

  private async findByIdAndUser(id: string, userId: string): Promise<ApiKey> {
    const key = await this.prisma.apiKey.findUnique({
      where: { id },
    });

    if (!key || key.userId !== userId) {
      throw new NotFoundException(`API key with ID "${id}" not found`);
    }

    return key;
  }

  private generateKey(): string {
    const random = crypto.randomBytes(32).toString('hex');
    return `${this.KEY_PREFIX}${random}`;
  }

  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
