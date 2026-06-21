import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (existing) {
      throw new ConflictException('Email is already in use');
    }

    if (dto.username) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
      if (usernameExists) {
        throw new ConflictException('Username is already taken');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name || null,
        username: dto.username || null,
        avatarUrl: dto.avatarUrl || null,
        bio: dto.bio || null,
        website: dto.website || null,
        role: dto.role || UserRole.USER,
        status: dto.status || UserStatus.PENDING_VERIFICATION,
      },
    });

    return this.stripSensitive(user);
  }

  async findAll(query: UserQueryDto) {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { username: { contains: search } },
      ];
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    const validSortFields = ['createdAt', 'updatedAt', 'email', 'name', 'role', 'status'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[field as keyof Prisma.UserOrderByWithRelationInput] = sortOrder;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          emailVerified: true,
          name: true,
          username: true,
          avatarUrl: true,
          bio: true,
          website: true,
          role: true,
          status: true,
          locale: true,
          timezone: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              tools: true,
              reviews: true,
              bookmarks: true,
              collections: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
        website: true,
        socialLinks: true,
        role: true,
        status: true,
        locale: true,
        timezone: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        lastLoginIp: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tools: true,
            reviews: true,
            bookmarks: true,
            collections: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Email is already in use');
      }
    }

    if (dto.username && dto.username !== user.username) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
      if (usernameExists) {
        throw new ConflictException('Username is already taken');
      }
    }

    const updateData: Prisma.UserUpdateInput = { ...dto };

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 12);
      delete (updateData as any).password;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.stripSensitive(updated);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async updateStatus(id: string, status: UserStatus, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async getStatistics() {
    const [total, active, banned, verified] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { status: UserStatus.BANNED } }),
      this.prisma.user.count({ where: { emailVerified: true } }),
    ]);

    return {
      total,
      active,
      banned,
      verified,
      pendingVerification: total - verified,
    };
  }

  private stripSensitive(user: any) {
    const { passwordHash, twoFactorSecret, refreshToken, ...safeUser } = user;
    return safeUser;
  }
}
