
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "../lib/api";
import { hasValidSession } from "../lib/auth";
import {
  getAllowedDestination,
  getPostLoginDestination,
} from "../lib/route-auth";

vi.mock("../lib/auth", () => ({
  hasValidSession: vi.fn(),
  getAccessToken: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

describe("role-aware post-login routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasValidSession).mockResolvedValue(true);
  });

  it("routes each role to its default workspace", () => {
    expect(getAllowedDestination("applicant", null)).toBe("/application");
    expect(getAllowedDestination("intern", null)).toBe("/intern/workspace");
    expect(getAllowedDestination("mentor", null)).toBe("/mentor/tasks/assign");
    expect(getAllowedDestination("admin", null)).toBe("/admin/applications");
  });

  it("rejects an old Applicant URL for a promoted Intern", () => {
    expect(getAllowedDestination("intern", "/application")).toBe(
      "/intern/workspace",
    );
  });

  it("rejects an Intern URL for a Mentor", () => {
    expect(getAllowedDestination("mentor", "/intern/workspace")).toBe(
      "/mentor/tasks/assign",
    );
  });

  it("preserves a valid Intern task-detail URL", () => {
    expect(getAllowedDestination("intern", "/intern/tasks/123")).toBe(
      "/intern/tasks/123",
    );
  });

  it("preserves an allowed Mentor review URL", () => {
    expect(getAllowedDestination("mentor", "/mentor/review")).toBe(
      "/mentor/review",
    );
  });

  it("rejects unknown routes and external redirects", () => {
    expect(getAllowedDestination("intern", "//example.com")).toBe(
      "/intern/workspace",
    );

    expect(getAllowedDestination("intern", "https://example.com")).toBe(
      "/intern/workspace",
    );

    expect(getAllowedDestination("intern", "/unknown")).toBe(
      "/intern/workspace",
    );

    expect(getAllowedDestination("intern", "/intern/tasks/%2Fadmin")).toBe(
      "/intern/workspace",
    );
  });

  it("uses the authenticated role rather than the saved next URL", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "intern-id",
          email: "intern@example.com",
          role: "intern",
        }),
      ),
    );

    await expect(
      getPostLoginDestination("/application"),
    ).resolves.toBe("/intern/workspace");
  });

  it("uses the saved URL when the authenticated role is allowed", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "intern-id",
          email: "intern@example.com",
          role: "intern",
        }),
      ),
    );

    await expect(
      getPostLoginDestination("/intern/tasks/123"),
    ).resolves.toBe("/intern/tasks/123");
  });

  it("routes invalid account roles to the access screen", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "unknown-id",
          email: "unknown@example.com",
          role: "unknown",
        }),
      ),
    );

    await expect(
      getPostLoginDestination(null),
    ).resolves.toBe("/unauthorized");
  });

  it("preserves the unprovisioned Applicant fallback", async () => {
    vi.mocked(apiFetch).mockRejectedValue(
      new ApiError("No account was found.", 404),
    );

    await expect(
      getPostLoginDestination(null),
    ).resolves.toBe("/application");
  });
});
