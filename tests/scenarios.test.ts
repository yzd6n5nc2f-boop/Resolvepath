import assert from "node:assert/strict";
import test from "node:test";
import { toApiScenario, toUiScenario } from "../lib/scenarios";

test("toApiScenario accepts UI lowercase scenario values", () => {
  assert.equal(toApiScenario("performance"), "PERFORMANCE");
  assert.equal(toApiScenario("sickness_absence"), "SICKNESS_ABSENCE");
  assert.equal(toApiScenario("flexible-working"), "FLEXIBLE_WORKING");
});

test("toApiScenario accepts existing API values", () => {
  assert.equal(toApiScenario("PERFORMANCE"), "PERFORMANCE");
  assert.equal(toApiScenario("GRIEVANCE"), "GRIEVANCE");
});

test("toUiScenario converts API values to UI values", () => {
  assert.equal(toUiScenario("PERFORMANCE"), "performance");
  assert.equal(toUiScenario("FLEXIBLE_WORKING"), "flexible_working");
});

test("scenario mapping returns null for unknown input", () => {
  assert.equal(toApiScenario("unknown_scenario"), null);
  assert.equal(toUiScenario("UNKNOWN_SCENARIO"), null);
});
