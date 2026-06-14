export function isAdminRole(role?: string): boolean {
  return role?.toUpperCase() === "ADMIN";
}
