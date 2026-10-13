import { describe, it, expect } from "vitest";
import { hasDashboardAccess } from "./access";

describe("hasDashboardAccess", () => {
  it("lets platform admins in, with or without a company", () => {
    expect(hasDashboardAccess({ role: "ADMIN", tenantId: null, isActive: true })).toBe(true);
    expect(hasDashboardAccess({ role: "ADMIN", tenantId: 1, isActive: true })).toBe(true);
  });

  it("lets a supervisor in only once linked to a company", () => {
    expect(hasDashboardAccess({ role: "SUPERVISOR", tenantId: 1, isActive: true })).toBe(true);
    // An account that signed in without an invitation: the case that used to loop
    // between /dashboard, /sign-in and the landing.
    expect(hasDashboardAccess({ role: "SUPERVISOR", tenantId: null, isActive: true })).toBe(false);
  });

  it("keeps operators and deactivated accounts out", () => {
    expect(hasDashboardAccess({ role: "OPERATOR", tenantId: 1, isActive: true })).toBe(false);
    expect(hasDashboardAccess({ role: "ADMIN", tenantId: null, isActive: false })).toBe(false);
    expect(hasDashboardAccess({ role: "SUPERVISOR", tenantId: 1, isActive: false })).toBe(false);
  });
});
