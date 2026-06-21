import { PaginationMeta, PaginationParams } from '../interfaces/pagination.interface';

export function getPaginationParams(params: PaginationParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(Math.max(1, params.limit || 20), 100);
  const skip = (page - 1) * limit;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, sortOrder };
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function buildPrismaOrderBy(sortBy: string, sortOrder: 'asc' | 'desc'): Record<string, 'asc' | 'desc'> {
  return { [sortBy]: sortOrder };
}

export function buildPrismaWhere<T extends Record<string, unknown>>(filters?: T, search?: string, searchFields?: string[]): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        where[key] = value;
      }
    });
  }

  if (search && searchFields && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: search },
    }));
  }

  return where;
}
