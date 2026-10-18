const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const source = ts.transpileModule(
  fs.readFileSync(
    require("node:path").join(__dirname, "../utils/paymentUx.ts"),
    "utf8",
  ),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const scope = { exports: {} };
vm.runInNewContext(source, scope);
const { installmentAmount, receiptAssetError, zelleStatusLabel } =
  scope.exports;
test("partial payment is exact in cents and cannot exceed remaining balance", () => {
  assert.equal(installmentAmount("10", 90).amount, 10);
  assert.equal(installmentAmount("10,25", 90).amount, 10.25);
  assert.equal(installmentAmount("", 90).amount, 90);
  for (const value of ["0", "-1", "91", "1.005", "NaN", "Infinity", "1e2"])
    assert.ok(installmentAmount(value, 90).error);
  assert.ok(installmentAmount("", 0).error);
});
test("receipt selection rejects unsupported formats and files over 5 MB", () => {
  assert.ok(receiptAssetError(null));
  assert.ok(receiptAssetError({ mimeType: "image/heic" }));
  assert.ok(receiptAssetError({ fileName: "receipt.pdf" }));
  assert.ok(
    receiptAssetError({ mimeType: "image/png", fileSize: 5 * 1024 * 1024 + 1 }),
  );
  assert.equal(
    receiptAssetError({ mimeType: "image/png", fileSize: 5 * 1024 * 1024 }),
    "",
  );
  assert.equal(receiptAssetError({ fileName: "receipt.JPG" }), "");
});
test("submitted receipt status never claims confirmation", () => {
  assert.match(zelleStatusLabel("AWAITING_REVIEW"), /awaiting review/);
  assert.equal(zelleStatusLabel("SUCCESSFUL"), "Confirmed");
  assert.equal(zelleStatusLabel("unexpected"), "Status unavailable");
});
