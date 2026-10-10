import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "../lib/api";
import { hasValidSession } from "../lib/auth";
import { getDefaultRouteForCurrentUser, requireRole } from "../lib/route-auth";

vi.mock("../lib/auth", () => ({
  hasValidSession: vi.fn(),
  getAccessToken: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, apiFetch: vi.fn() };
});

describe("protected route authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects signed-out users to login", async () => {
    vi.mocked(hasValidSession).mockResolvedValue(false);

    const result = await requireRole("admin", "/admin/applications").catch(
      (error: unknown) => error,
    );

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(302);
    expect((result as Response).headers.get("Location")).toBe(
      "/sign-in?next=%2Fadmin%2Fapplications",
    );
  });

  it("redirects a non-admin account to the unauthorized page", async () => {
    vi.mocked(hasValidSession).mockResolvedValue(true);
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "mentor-id",
          email: "mentor@example.com",
          role: "mentor",
        }),
      ),
    );

    const result = await requireRole("admin", "/admin/applications").catch(
      (error: unknown) => error,
    );

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("Location")).toBe("/unauthorized");
  });

  it("allows an administrator account", async () => {
    vi.mocked(hasValidSession).mockResolvedValue(true);
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "admin-id",
          email: "admin@example.com",
          role: "admin",
        }),
      ),
    );

    await expect(
      requireRole("admin", "/admin/applications"),
    ).resolves.toMatchObject({ role: "admin" });
  });

  it("allows a new authenticated applicant before account provisioning", async () => {
    vi.mocked(hasValidSession).mockResolvedValue(true);
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
    vi.mocked(hasValidSession).mockResolvedValue(true);
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "mentor-id",
          email: "mentor@example.com",
          role: "mentor",
        }),
      ),
    );

    await expect(getDefaultRouteForCurrentUser()).resolves.toBe(
      "/mentor/tasks/assign",
    );
  });
});
