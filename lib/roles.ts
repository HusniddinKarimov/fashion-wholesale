export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  USER: "USER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Roles with access to the admin dashboard area
export const STAFF_ROLES: Role[] = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER];

export function isStaff(role: string): boolean {
  return STAFF_ROLES.includes(role as Role);
}

export function isSuperAdmin(role: string): boolean {
  return role === ROLES.SUPERADMIN;
}

// Permission matrix
export const CAN = {
  // Only SUPERADMIN and ADMIN can manage other users / customers
  manageCustomers: (role: string) =>
    role === ROLES.SUPERADMIN || role === ROLES.ADMIN,

  // SUPERADMIN, ADMIN, and MANAGER can manage inventory
  manageInventory: (role: string) =>
    isStaff(role),

  // All staff can view and update orders
  manageOrders: (role: string) =>
    isStaff(role),

  // Only SUPERADMIN can delete products
  deleteProduct: (role: string) =>
    role === ROLES.SUPERADMIN || role === ROLES.ADMIN,
} as const;
