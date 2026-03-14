import { describe, expect, it } from "bun:test";
import { join } from "path";

const fakeCodexPath = join(process.cwd(), "tests", "fixtures", "fake-codex.sh");

async function runRalphWithCodex(extraArgs: string[]) {
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
      ...extraArgs,
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

describe("Codex CLI flags", () => {
  it("--allow-all maps to Codex --full-auto", async () => {
    const { stdout, stderr, exitCode } = await runRalphWithCodex(["--allow-all"]);

    expect(exitCode).toBe(0);
    expect(stderr).not.toContain("Unknown option");
    expect(stdout).toContain("ARGS:exec --full-auto");
    expect(stdout).not.toContain("--yolo");
  });

  it("--yolo maps to Codex dangerous bypass mode", async () => {
    const { stdout, stderr, exitCode } = await runRalphWithCodex(["--yolo"]);

    expect(exitCode).toBe(0);
    expect(stderr).not.toContain("Unknown option");
    expect(stdout).toContain("ARGS:exec --yolo");
    expect(stdout).not.toContain("--full-auto");
  });
});
