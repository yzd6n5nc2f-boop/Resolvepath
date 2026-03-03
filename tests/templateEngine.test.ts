import assert from "node:assert/strict";
import test from "node:test";
import { extractPlaceholders, missingValues, renderTemplate } from "../lib/template-engine";

test("extractPlaceholders returns unique placeholder keys", () => {
  const body = "Hello {{employee_name}}. Manager: {{manager_name}}. Again {{employee_name}}.";
  assert.deepEqual(extractPlaceholders(body), ["employee_name", "manager_name"]);
});

test("renderTemplate replaces known placeholders and preserves unknown values", () => {
  const body = "Dear {{employee_name}}, meeting on {{meeting_date}} with {{manager_name}}.";
  const rendered = renderTemplate(body, {
    employee_name: "Jordan Patel",
    manager_name: "Alex Morgan"
  });

  assert.equal(rendered.includes("Jordan Patel"), true);
  assert.equal(rendered.includes("Alex Morgan"), true);
  assert.equal(rendered.includes("{{meeting_date}}"), true);
});

test("missingValues returns placeholders with missing values", () => {
  const placeholders = ["employee_name", "meeting_date", "manager_name"];
  const values = {
    employee_name: "Jordan Patel",
    manager_name: ""
  };

  assert.deepEqual(missingValues(placeholders, values), ["meeting_date", "manager_name"]);
});
