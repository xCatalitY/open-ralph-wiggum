import { describe, expect, it } from "bun:test";
import { join } from "path";

const fakeCodexPath = join(process.cwd(), "tests", "fixtures", "fake-codex-model-warning.sh");

async function runRalphWithCodexModelWarning() {
  const proc = Bun.spawn({
    cmd: [
      "bun",
      "run",
      "ralph.ts",
      "demo task",
      "--agent",
      "codex",
      "--max-iterations",
      "1",
      "--completion-promise",
      "DONE",
    ],
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      NODE_ENV: "test",
      RALPH_CODEX_BINARY: fakeCodexPath,
    },
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  return { stdout, stderr, exitCode };
}

describe("Model configuration detection", () => {
  it("does not misclassify Codex output as an OpenCode model-config failure", async () => {
    const { stdout, stderr, exitCode } = await runRalphWithCodexModelWarning();

    expect(exitCode).toBe(0);
    expect(stderr).not.toContain("Model configuration error detected");
    expect(stdout).toContain("<promise>DONE</promise>");
  });
});
