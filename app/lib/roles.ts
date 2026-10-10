export const accountRoles = ["applicant", "intern", "mentor", "admin"] as const;

export type AccountRole = (typeof accountRoles)[number];

export const defaultRouteByRole: Readonly<Record<AccountRole, string>> = {
  admin: "/admin/applications",
  mentor: "/mentor/tasks/assign",
  intern: "/intern/workspace",
  applicant: "/application",
};

export function isAccountRole(value: unknown): value is AccountRole {
  return (
    typeof value === "string" && accountRoles.includes(value as AccountRole)
  );
}

export function hasRequiredRole(
  userRole: AccountRole,
  requiredRole: AccountRole,
): boolean {
  return userRole === "admin" || userRole === requiredRole;
}
