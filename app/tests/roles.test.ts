import { describe, expect, it } from "vitest";
import {
  defaultRouteByRole,
  hasRequiredRole,
  isAccountRole,
} from "../lib/roles";

describe("role-based access tests", () => {
  it("allows administrators to access every protected section", () => {
    expect(hasRequiredRole("admin", "mentor")).toBe(true);
    expect(hasRequiredRole("admin", "intern")).toBe(true);
    expect(hasRequiredRole("admin", "applicant")).toBe(true);
  });

  it("does not allow other roles to access administrator routes", () => {
    expect(hasRequiredRole("mentor", "admin")).toBe(false);
    expect(hasRequiredRole("intern", "admin")).toBe(false);
    expect(hasRequiredRole("applicant", "admin")).toBe(false);
  });

  it("rejects unknown role values", () => {
    expect(isAccountRole("owner")).toBe(false);
  });

  it("defines a default page for every role", () => {
    expect(defaultRouteByRole).toEqual({
      admin: "/admin/applications",
      mentor: "/mentor/tasks/assign",
      intern: "/intern/workspace",
      applicant: "/application",
    });
  });
});
