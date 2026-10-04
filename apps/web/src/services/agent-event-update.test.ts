import { describe, it, expect } from "vitest";
import { parseEventUpdate, UPDATE_EVENT_TOOL } from "./agent-event-update";

describe("parseEventUpdate", () => {
  it("maps a full valid tool input to an EventUpdate", () => {
    const update = parseEventUpdate({
      status: "IN_PROGRESS",
      priority: "HIGH",
      machineName: "COMP-005",
      location: "Sector B",
      resolved: false,
    });
    expect(update).toEqual({
      status: "IN_PROGRESS",
      priority: "HIGH",
      machineName: "COMP-005",
      location: "Sector B",
    });
  });

  it("sets resolved only when true", () => {
    expect(parseEventUpdate({ status: "RESOLVED", priority: "LOW", resolved: true }))
      .toEqual({ status: "RESOLVED", priority: "LOW", resolved: true });

    const notResolved = parseEventUpdate({ status: "OPEN", priority: "LOW", resolved: false });
    expect(notResolved).not.toHaveProperty("resolved");
  });

  it("omits machineName/location when null or absent", () => {
    const update = parseEventUpdate({ status: "OPEN", priority: "MEDIUM", machineName: null });
    expect(update).toEqual({ status: "OPEN", priority: "MEDIUM" });
  });

  it("ignores unknown fields but keeps the known ones", () => {
    const update = parseEventUpdate({ status: "OPEN", priority: "LOW", resolved: false, foo: "bar" });
    expect(update).toEqual({ status: "OPEN", priority: "LOW" });
  });

  it("returns undefined for an invalid enum value", () => {
    expect(parseEventUpdate({ status: "WAT", priority: "HIGH", resolved: false })).toBeUndefined();
  });

  it("returns undefined for a non-object input", () => {
    expect(parseEventUpdate("resolved")).toBeUndefined();
    expect(parseEventUpdate(null)).toBeUndefined();
    expect(parseEventUpdate(42)).toBeUndefined();
  });

  it("returns undefined when no actionable field is present", () => {
    expect(parseEventUpdate({})).toBeUndefined();
    expect(parseEventUpdate({ resolved: false })).toBeUndefined();
  });

  it("maps escalation flags", () => {
    const update = parseEventUpdate({
      status: "OPEN",
      priority: "CRITICAL",
      resolved: false,
      escalate: true,
      escalationReason: "Riesgo de seguridad",
    });
    expect(update).toMatchObject({ escalate: true, escalationReason: "Riesgo de seguridad" });
  });

  it("omits escalate when false", () => {
    const update = parseEventUpdate({ status: "OPEN", priority: "LOW", resolved: false, escalate: false });
    expect(update).toEqual({ status: "OPEN", priority: "LOW" });
    expect(update).not.toHaveProperty("escalate");
  });
});

describe("UPDATE_EVENT_TOOL", () => {
  it("declares the update_event tool with the required fields", () => {
    expect(UPDATE_EVENT_TOOL.name).toBe("update_event");
    expect(UPDATE_EVENT_TOOL.input_schema.required).toEqual(["status", "priority", "resolved"]);
  });
});
