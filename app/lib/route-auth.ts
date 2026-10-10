
import { redirect } from "react-router";
import { ApiError, apiFetch } from "./api";
import { hasValidSession } from "./auth";
import {
  defaultRouteByRole,
  hasRequiredRole,
  isAccountRole,
  type AccountRole,
} from "./roles";

export interface CurrentAccount {
  id: string;
  email: string;
  role: AccountRole;
}

function loginPath(nextPath: string): string {
  const params = new URLSearchParams({ next: nextPath });
  return `/sign-in?${params.toString()}`;
}

function requiredRoleForPath(path: string): AccountRole | null {
  if (path === "/application") {
    return "applicant";
  }

  if (
    path === "/admin/applications" ||
    path === "/admin/mentor-assignments"
  ) {
    return "admin";
  }

  if (
    path === "/mentor/tasks/assign" ||
    path === "/mentor/review"
  ) {
    return "mentor";
  }

  if (
    path === "/intern/workspace" ||
    path === "/intern/tasks" ||
    path === "/intern/weekly-progress" ||
    /^\/intern\/tasks\/[^/]+$/.test(path)
  ) {
    return "intern";
  }

  return null;
}

export function getAllowedDestination(
  role: AccountRole,
  requestedPath: string | null,
): string {
  const fallback = defaultRouteByRole[role];

  if (!requestedPath) {
    return fallback;
  }

  // Only accept application-local paths.
  if (
    !requestedPath.startsWith("/") ||
    requestedPath.startsWith("//") ||
    requestedPath.includes("\\")
  ) {
    return fallback;
  }

  const pathname = requestedPath.split(/[?#]/, 1)[0];

  // Reject encoded pathnames to prevent bypassing the route allowlist.
  if (pathname.includes("%")) {
    return fallback;
  }

  const requiredRole = requiredRoleForPath(pathname);

  if (!requiredRole || !hasRequiredRole(role, requiredRole)) {
    return fallback;
  }

  return requestedPath;
}

export async function getCurrentAccount(): Promise<CurrentAccount> {
  const response = await apiFetch("/api/auth/me");
  const account = (await response.json()) as Partial<CurrentAccount>;

  if (!isAccountRole(account.role)) {
    throw new ApiError("The account has an invalid role.", 403);
  }

  return account as CurrentAccount;
}

export async function getDefaultRouteForCurrentUser(): Promise<string> {
  if (!(await hasValidSession())) {
    throw redirect("/sign-in");
  }

  try {
    const account = await getCurrentAccount();
    return defaultRouteByRole[account.role];
  } catch (error) {
    // Preserve the existing registration flow for newly created
    // Applicants who have not yet been provisioned.
    if (error instanceof ApiError && error.status === 404) {
      return defaultRouteByRole.applicant;
    }

    if (error instanceof ApiError && error.status === 401) {
      throw redirect("/sign-in");
    }

    throw error;
  }
}

export async function getPostLoginDestination(
  requestedPath: string | null,
): Promise<string> {
  if (!(await hasValidSession())) {
    throw redirect("/sign-in");
  }

  try {
    const account = await getCurrentAccount();

    return getAllowedDestination(account.role, requestedPath);
  } catch (error) {
    // Newly registered Applicants may not have a shared account yet.
    if (error instanceof ApiError && error.status === 404) {
      return defaultRouteByRole.applicant;
    }

    if (error instanceof ApiError && error.status === 401) {
      throw redirect("/sign-in");
    }

    // Invalid roles must not enter a protected workspace.
    if (error instanceof ApiError && error.status === 403) {
      return "/unauthorized";
    }

    throw error;
  }
}

export async function requireRole(
  requiredRole: AccountRole,
  nextPath: string,
  options: { allowUnprovisionedApplicant?: boolean } = {},
): Promise<CurrentAccount | null> {
  if (!(await hasValidSession())) {
    throw redirect(loginPath(nextPath));
  }

  try {
    const account = await getCurrentAccount();

    if (!hasRequiredRole(account.role, requiredRole)) {
      throw redirect("/unauthorized");
    }

    return account;
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    if (
      options.allowUnprovisionedApplicant &&
      requiredRole === "applicant" &&
      error instanceof ApiError &&
      error.status === 404
    ) {
      return null;
    }

    if (error instanceof ApiError && error.status === 401) {
      throw redirect(loginPath(nextPath));
    }

    if (
      error instanceof ApiError &&
      [403, 404].includes(error.status)
    ) {
      throw redirect("/unauthorized");
    }

    throw error;
  }
}
