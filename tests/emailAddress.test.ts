import test from "node:test";
import assert from "node:assert/strict";
import {
  isLikelyEmail,
  sanitizeExportName,
  splitEmailList,
  splitFromAddresses,
} from "../lib/emailAddress";

test("isLikelyEmail validates basic address patterns", () => {
  assert.equal(isLikelyEmail("hello@example.com"), true);
  assert.equal(isLikelyEmail("hello@example"), false);
  assert.equal(isLikelyEmail("bad value"), false);
});

test("splitEmailList normalizes, deduplicates and drops invalid values", () => {
  const out = splitEmailList(
    "A@example.com, invalid, a@example.com , second@example.com,,",
  );
  assert.deepEqual(out, ["a@example.com", "second@example.com"]);
});

test("splitFromAddresses preserves display values and removes empties", () => {
  const out = splitFromAddresses("one@example.com, two@example.com, , two@example.com");
  assert.deepEqual(out, ["one@example.com", "two@example.com"]);
});

test("sanitizeExportName creates stable slugs with fallback", () => {
  assert.equal(sanitizeExportName("My Export Name"), "my-export-name");
  assert.equal(sanitizeExportName("###", "fallback"), "fallback");
});
