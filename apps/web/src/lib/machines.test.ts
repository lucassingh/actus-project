import { describe, it, expect, afterEach } from "vitest";
import { normalizeMachineKey, machinePrefill, machineWaLink } from "./machines";

describe("normalizeMachineKey", () => {
  it("folds case, separators and accents so variants match", () => {
    // All the ways an operator might write COMP-005 collapse to the same key.
    const key = "comp005";
    expect(normalizeMachineKey("COMP-005")).toBe(key);
    expect(normalizeMachineKey("comp 005")).toBe(key);
    expect(normalizeMachineKey("Comp.005")).toBe(key);
    expect(normalizeMachineKey("COMP005")).toBe(key);
  });

  it("strips accents and non-alphanumerics", () => {
    expect(normalizeMachineKey("Prensa Hidráulica")).toBe("prensahidraulica");
    expect(normalizeMachineKey("  A/B_1 ")).toBe("ab1");
  });

  it("returns empty string for separator-only input", () => {
    expect(normalizeMachineKey("---")).toBe("");
    expect(normalizeMachineKey("")).toBe("");
  });
});

describe("machinePrefill", () => {
  it("builds the readable WhatsApp prefill", () => {
    expect(machinePrefill("COMP-005")).toBe("Máquina COMP-005: ");
  });
});

describe("machineWaLink", () => {
  const original = process.env.WHATSAPP_BOT_NUMBER;
  afterEach(() => {
    process.env.WHATSAPP_BOT_NUMBER = original;
  });

  it("returns null when the bot number is not configured", () => {
    delete process.env.WHATSAPP_BOT_NUMBER;
    expect(machineWaLink("COMP-005")).toBeNull();
  });

  it("builds a wa.me link with digits only and the encoded prefill", () => {
    process.env.WHATSAPP_BOT_NUMBER = "+1 (555) 660-8866";
    const link = machineWaLink("COMP-005");
    expect(link).toBe(`https://wa.me/15556608866?text=${encodeURIComponent("Máquina COMP-005: ")}`);
  });
});
