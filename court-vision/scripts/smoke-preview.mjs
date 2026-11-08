import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const port = 3477;
const origin = `http://127.0.0.1:${port}`;
const server = spawn("npm", ["run", "start", "--", "-p", String(port)], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    VERCEL_ENV: "preview",
    COURT_VISION_PREVIEW_FIXTURES: "true",
    NEXT_TELEMETRY_DISABLED: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
server.stdout.on("data", chunk => { logs += String(chunk); });
server.stderr.on("data", chunk => { logs += String(chunk); });

async function waitForReady() {
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${logs}`);
    try {
      const response = await fetch(origin + "/players", { signal: AbortSignal.timeout(1000) });
      if (response.status === 200) return;
    } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Local fixture server did not start: ${logs}`);
}

try {
  await waitForReady();
  for (const [path, status, expected] of [
    ["/players", 200, "Sample Guard"],
    ["/players/9001", 200, "Career Averages"],
    ["/players/9002", 200, "incomplete"],
    ["/players/9999", 404, ""],
  ]) {
    const response = await fetch(origin + path, { signal: AbortSignal.timeout(8000) });
    assert.equal(response.status, status, `Unexpected HTTP code for ${path}`);
    const html = await response.text();
    if (expected) assert.ok(html.toLowerCase().includes(expected.toLowerCase()), `Missing ${expected} on ${path}`);
    console.log(`PASS ${path} HTTP ${status}`);
  }
} finally {
  server.kill("SIGTERM");
}
