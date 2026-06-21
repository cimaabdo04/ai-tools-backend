export const PERMISSIONS = {
  TOOLS: {
    CREATE: 'create:tools',
    READ: 'read:tools',
    UPDATE: 'update:tools',
    DELETE: 'delete:tools',
    APPROVE: 'approve:tools',
    FEATURE: 'feature:tools',
  },
  USERS: {
    READ: 'read:users',
    UPDATE: 'update:users',
    DELETE: 'delete:users',
    BAN: 'ban:users',
    MANAGE_ROLES: 'manage:roles',
  },
  REVIEWS: {
    CREATE: 'create:reviews',
    READ: 'read:reviews',
    UPDATE: 'update:reviews',
    DELETE: 'delete:reviews',
    MODERATE: 'moderate:reviews',
  },
  CATEGORIES: {
    CREATE: 'create:categories',
    READ: 'read:categories',
    UPDATE: 'update:categories',
    DELETE: 'delete:categories',
  },
  ANALYTICS: {
    READ: 'read:analytics',
    EXPORT: 'export:analytics',
  },
  PAYMENTS: {
    READ: 'read:payments',
    REFUND: 'refund:payments',
    MANAGE_SUBSCRIPTIONS: 'manage:subscriptions',
  },
  SETTINGS: {
    READ: 'read:settings',
    UPDATE: 'update:settings',
  },
  ADMIN: {
    ALL: 'admin:all',
  },
} as const;
