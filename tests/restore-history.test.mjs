import assert from "node:assert/strict";
import test from "node:test";
import turnProfiler from "../src/index.ts";

test("restores valid profiles and skips invalid session entries", async () => {
  const handlers = new Map();
  const pi = {
    on(name, handler) { handlers.set(name, handler); },
    registerCommand() {},
  };
  let status;
  const ctx = {
    ui: { notify() {}, setStatus(_name, value) { status = value; } },
    sessionManager: {
      getBranch() {
        return [
          { type: "custom", customType: "turn-profiler-run", data: { durationMs: 2500, toolCount: 2 } },
          { type: "custom", customType: "turn-profiler-run", data: { durationMs: "invalid", toolCount: 3 } },
        ];
      },
    },
  };
  turnProfiler(pi);
  await handlers.get("session_start")({}, ctx);
  assert.equal(status, "turn: 2.5s · 2 tools");
});
