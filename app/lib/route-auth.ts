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
    if (error instanceof ApiError && error.status === 404) {
      return defaultRouteByRole.applicant;
    }
    if (error instanceof ApiError && error.status === 401) {
      throw redirect("/sign-in");
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

    return account as CurrentAccount;
  } catch (error) {
    if (error instanceof Response) throw error;
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
    if (error instanceof ApiError && [403, 404].includes(error.status)) {
      throw redirect("/unauthorized");
    }
    throw error;
  }
}
