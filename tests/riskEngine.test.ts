import test from "node:test";
import assert from "node:assert/strict";
import { riskEngine } from "../lib/server/riskEngine";

test("flags high risk keywords", () => {
  const result = riskEngine(
    "Employee alleges discrimination and harassment in team meetings.",
    [{ date: "2026-03-01", note: "Formal concern shared in writing" }]
  );

  assert.equal(result.highRisk, true);
  assert.equal(result.riskFlags.some((flag) => flag.code === "PROTECTED_CHARACTERISTIC"), true);
  assert.equal(result.riskFlags.some((flag) => flag.code === "HARASSMENT"), true);
});

test("flags missing timeline and generic summary", () => {
  const result = riskEngine("There is an issue and concern with performance.", []);

  assert.equal(result.missingInfo.noTimeline, true);
  assert.equal(result.missingInfo.tooGeneric, true);
  assert.equal(result.riskFlags.some((flag) => flag.code === "MISSING_TIMELINE"), true);
  assert.equal(result.riskFlags.some((flag) => flag.code === "GENERIC_SUMMARY"), true);
});

test("does not mark high risk when no high-risk keywords are present", () => {
  const result = riskEngine(
    "Two KPI checkpoints were missed on 2026-02-12 and 2026-02-20; coaching support was offered.",
    [
      { date: "2026-02-12", note: "KPI review and action planning" },
      { date: "2026-02-20", note: "Follow-up coaching session" }
    ]
  );

  assert.equal(result.highRisk, false);
  assert.equal(result.missingInfo.noTimeline, false);
  assert.equal(result.missingInfo.noSpecificExamples, false);
});
