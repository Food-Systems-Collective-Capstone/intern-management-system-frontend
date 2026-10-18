
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "../lib/api";
import { hasValidSession } from "../lib/auth";
import {
  getCurrentAccount,
  getDefaultRouteForCurrentUser,
  getPostLoginDestination,
  requireRole,
} from "../lib/route-auth";

vi.mock("../lib/auth", () => ({
  hasValidSession: vi.fn(),
  getAccessToken: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, apiFetch: vi.fn() };
});

const applicantAccount = {
  id: "shared-account-123",
  email: "applicant@example.com",
  role: "applicant",
};

const promotedInternAccount = {
  ...applicantAccount,
  role: "intern",
};

function mockAccount(account: object) {
  vi.mocked(apiFetch).mockResolvedValue(
    new Response(JSON.stringify(account), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

async function getRedirect(
  promise: Promise<unknown>,
): Promise<Response> {
  try {
    await promise;
    throw new Error("Expected a redirect");
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    throw error;
  }
}

describe("protected route authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasValidSession).mockResolvedValue(true);
  });

  it("redirects signed-out users to login", async () => {
    vi.mocked(hasValidSession).mockResolvedValue(false);

    const result = await getRedirect(
      requireRole("admin", "/admin/applications"),
    );

    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe(
      "/sign-in?next=%2Fadmin%2Fapplications",
    );
  });

  it("redirects a non-admin account with the attempted page", async () => {
    mockAccount({
      id: "mentor-id",
      email: "mentor@example.com",
      role: "mentor",
    });

    const result = await getRedirect(
      requireRole("admin", "/admin/applications"),
    );

    expect(result.headers.get("Location")).toBe(
      "/unauthorized?from=%2Fadmin%2Fapplications",
    );
  });

  it("redirects a Mentor attempting to access an Intern workspace", async () => {
    mockAccount({
      id: "mentor-id",
      email: "mentor@example.com",
      role: "mentor",
    });

    const result = await getRedirect(
      requireRole("intern", "/intern/workspace"),
    );

    expect(result.headers.get("Location")).toBe(
      "/unauthorized?from=%2Fintern%2Fworkspace",
    );
  });

  it("redirects an Intern attempting to access a Mentor workspace", async () => {
    mockAccount({
      id: "intern-id",
      email: "intern@example.com",
      role: "intern",
    });

    const result = await getRedirect(
      requireRole("mentor", "/mentor/tasks/assign"),
    );

    expect(result.headers.get("Location")).toBe(
      "/unauthorized?from=%2Fmentor%2Ftasks%2Fassign",
    );
  });

  it("allows an administrator account", async () => {
    mockAccount({
      id: "admin-id",
      email: "admin@example.com",
      role: "admin",
    });

    await expect(
      requireRole("admin", "/admin/applications"),
    ).resolves.toMatchObject({ role: "admin" });
  });

  it("allows a new authenticated applicant before account provisioning", async () => {
    vi.mocked(apiFetch).mockRejectedValue(
      new ApiError("No account was found.", 404),
    );

    await expect(
      requireRole("applicant", "/application", {
        allowUnprovisionedApplicant: true,
      }),
    ).resolves.toBeNull();
  });

  it("returns the default route for the authenticated role", async () => {
    mockAccount({
      id: "mentor-id",
      email: "mentor@example.com",
      role: "mentor",
    });

    await expect(getDefaultRouteForCurrentUser()).resolves.toBe(
      "/mentor/tasks/assign",
    );
  });
});

describe("Applicant-to-Intern onboarding integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasValidSession).mockResolvedValue(true);
  });

  it("routes an unpromoted Applicant to the application page", async () => {
    mockAccount(applicantAccount);

    await expect(getDefaultRouteForCurrentUser()).resolves.toBe(
      "/application",
    );
  });

  it("recognizes the promoted Intern role while preserving account identity", async () => {
    mockAccount(applicantAccount);

    const beforePromotion = await getCurrentAccount();

    mockAccount(promotedInternAccount);

    const afterPromotion = await getCurrentAccount();

    expect(beforePromotion).toEqual(applicantAccount);
    expect(afterPromotion).toEqual(promotedInternAccount);
    expect(afterPromotion.id).toBe(beforePromotion.id);
    expect(afterPromotion.email).toBe(beforePromotion.email);
    expect(afterPromotion.role).toBe("intern");
    expect(apiFetch).toHaveBeenCalledWith("/api/auth/me");
  });

  it("routes a promoted Intern to the Intern workspace", async () => {
    mockAccount(promotedInternAccount);

    await expect(getDefaultRouteForCurrentUser()).resolves.toBe(
      "/intern/workspace",
    );
  });

  it("routes a promoted Intern correctly after login", async () => {
    mockAccount(promotedInternAccount);

    await expect(getPostLoginDestination(null)).resolves.toBe(
      "/intern/workspace",
    );
  });

  it("rejects an old Applicant destination after promotion", async () => {
    mockAccount(promotedInternAccount);

    await expect(
      getPostLoginDestination("/application"),
    ).resolves.toBe("/intern/workspace");
  });

  it("allows the promoted Intern into the Intern workspace", async () => {
    mockAccount(promotedInternAccount);

    await expect(
      requireRole("intern", "/intern/workspace"),
    ).resolves.toMatchObject({
      id: applicantAccount.id,
      email: applicantAccount.email,
      role: "intern",
    });
  });

  it("prevents a promoted Intern from accessing Applicant-only pages", async () => {
    mockAccount(promotedInternAccount);

    const result = await getRedirect(
      requireRole("applicant", "/application"),
    );

    expect(result.headers.get("Location")).toBe(
      "/unauthorized?from=%2Fapplication",
    );
  });

  it("prevents an unpromoted Applicant from accessing Intern pages", async () => {
    mockAccount(applicantAccount);

    const result = await getRedirect(
      requireRole("intern", "/intern/workspace"),
    );

    expect(result.headers.get("Location")).toBe(
      "/unauthorized?from=%2Fintern%2Fworkspace",
    );
  });

  it("does not accept an invalid role returned by the backend", async () => {
    mockAccount({
      ...applicantAccount,
      role: "unknown",
    });

    await expect(getCurrentAccount()).rejects.toMatchObject({
      status: 403,
    });
  });
});
