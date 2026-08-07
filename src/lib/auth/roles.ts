/** Roles do utilizador — espelhadas do Hub. O frontend nunca inventa admin. */

export type UserRole = "user" | "editor" | "support" | "admin";

const CONTROL_CENTER_ROLES = new Set<UserRole>(["admin"]);

export function normalizeRole(raw: string | null | undefined): UserRole {
  const role = (raw || "user").trim().toLowerCase();
  if (
    role === "admin" ||
    role === "editor" ||
    role === "support" ||
    role === "user"
  ) {
    return role;
  }
  return "user";
}

export function isAdminRole(role: string | null | undefined): boolean {
  return CONTROL_CENTER_ROLES.has(normalizeRole(role));
}
