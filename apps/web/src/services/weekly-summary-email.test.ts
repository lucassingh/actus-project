import { describe, it, expect } from "vitest";
import {
  renderWeeklySummaryEmail,
  hasActivity,
  formatDurationShort,
  type WeeklySummary,
} from "./weekly-summary-email";

const base: WeeklySummary = {
  tenantName: "Essen",
  periodLabel: "29/9 – 5/10",
  newIncidents: 12,
  resolved: 9,
  escalated: 2,
  openNow: 3,
  avgTtrLabel: "2.5 h",
  newKbCount: 4,
  topMachines: [
    { name: "COMP-005", count: 5 },
    { name: "Prensa 2", count: 3 },
  ],
};

describe("formatDurationShort", () => {
  it("formats by magnitude and handles the empty case", () => {
    expect(formatDurationShort(null)).toBe("—");
    expect(formatDurationShort(0)).toBe("—");
    expect(formatDurationShort(30 * 60)).toBe("30 min");
    expect(formatDurationShort(2 * 3600)).toBe("2.0 h");
    expect(formatDurationShort(25 * 3600)).toBe("1.0 d");
  });
});

describe("hasActivity", () => {
  it("is true when anything happened", () => {
    expect(hasActivity(base)).toBe(true);
    expect(hasActivity({ ...base, newIncidents: 0, resolved: 0, escalated: 1 })).toBe(true);
  });
  it("is false for a quiet week", () => {
    expect(hasActivity({ ...base, newIncidents: 0, resolved: 0, escalated: 0 })).toBe(false);
  });
});

describe("renderWeeklySummaryEmail", () => {
  it("puts the tenant in the subject and the numbers + machines in the body", () => {
    const { subject, html } = renderWeeklySummaryEmail(base);
    expect(subject).toBe("Resumen semanal — Essen");
    expect(html).toContain("Essen");
    expect(html).toContain("29/9 – 5/10");
    expect(html).toContain(">12<"); // newIncidents stat value
    expect(html).toContain("COMP-005");
    expect(html).toContain("2.5 h");
  });

  it("shows a fallback row when there are no machines", () => {
    const { html } = renderWeeklySummaryEmail({ ...base, topMachines: [] });
    expect(html).toContain("Sin máquinas registradas");
  });

  it("escapes HTML in machine names", () => {
    const { html } = renderWeeklySummaryEmail({ ...base, topMachines: [{ name: "<b>x</b>", count: 1 }] });
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(html).not.toContain("<b>x</b>");
  });
});
