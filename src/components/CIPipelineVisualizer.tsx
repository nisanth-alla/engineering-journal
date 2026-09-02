import { useState } from "react";

type StageStatus = "waiting" | "running" | "passed" | "failed" | "skipped";

type Stage = {
  id: string;
  label: string;
  description: string;
  durationMs: number;
  what: string;
};

const STAGES: Stage[] = [
  {
    id: "install",
    label: "Install",
    description: "npm ci with lockfile",
    durationMs: 12000,
    what: "Restores node_modules from the lockfile. Uses cache on hit; re-downloads on miss.",
  },
  {
    id: "lint",
    label: "Lint",
    description: "ESLint + Prettier check",
    durationMs: 4000,
    what: "Catches style violations, unused variables, and broken rules before a reviewer has to.",
  },
  {
    id: "typecheck",
    label: "Type check",
    description: "tsc --noEmit + astro check",
    durationMs: 8000,
    what: "Runs the TypeScript compiler without emitting output. Catches type errors the tests wouldn't catch.",
  },
  {
    id: "test",
    label: "Tests",
    description: "Unit + integration",
    durationMs: 22000,
    what: "Fast feedback on logic. If this fails, deployment stops before a build artifact is created.",
  },
  {
    id: "build",
    label: "Build",
    description: "Production artifact",
    durationMs: 35000,
    what: "Creates the deployable artifact. The same artifact that passes here goes to production — no rebuild.",
  },
  {
    id: "e2e",
    label: "E2E",
    description: "Browser behavior tests",
    durationMs: 55000,
    what: "Playwright tests against the built site. Most expensive stage — only runs after all cheaper gates pass.",
  },
];

type PipelineState = {
  statuses: Record<string, StageStatus>;
  failedAt: string | null;
  running: boolean;
  done: boolean;
  elapsed: number;
};

const INITIAL: PipelineState = {
  statuses: Object.fromEntries(STAGES.map((s) => [s.id, "waiting"])),
  failedAt: null,
  running: false,
  done: false,
  elapsed: 0,
};

function formatMs(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(0)}s`;
}

function statusIcon(s: StageStatus) {
  if (s === "waiting") return "○";
  if (s === "running") return "◉";
  if (s === "passed") return "✓";
  if (s === "failed") return "✗";
  if (s === "skipped") return "—";
  return "○";
}

function totalTime(statuses: Record<string, StageStatus>, failedAt: string | null) {
  let total = 0;
  for (const stage of STAGES) {
    if (statuses[stage.id] === "passed") total += stage.durationMs;
    if (stage.id === failedAt) {
      total += stage.durationMs;
      break;
    }
  }
  return total;
}

export default function CIPipelineVisualizer() {
  const [state, setState] = useState<PipelineState>(INITIAL);
  const [injectFailAt, setInjectFailAt] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<Stage | null>(null);

  async function runPipeline() {
    setState({ ...INITIAL, running: true });
    setActiveStage(null);
    let elapsed = 0;

    for (const stage of STAGES) {
      setState((prev) => ({
        ...prev,
        statuses: { ...prev.statuses, [stage.id]: "running" },
        elapsed,
      }));

      // Simulate stage duration (compressed 10×)
      await new Promise((r) => setTimeout(r, stage.durationMs / 10));
      elapsed += stage.durationMs;

      if (stage.id === injectFailAt) {
        setState((prev) => ({
          ...prev,
          statuses: {
            ...prev.statuses,
            [stage.id]: "failed",
            ...Object.fromEntries(
              STAGES.slice(STAGES.indexOf(stage) + 1).map((s) => [s.id, "skipped"]),
            ),
          },
          failedAt: stage.id,
          running: false,
          done: true,
          elapsed,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        statuses: { ...prev.statuses, [stage.id]: "passed" },
        elapsed,
      }));
    }

    setState((prev) => ({ ...prev, running: false, done: true, elapsed }));
  }

  function reset() {
    setState(INITIAL);
    setActiveStage(null);
  }

  const allPassed = state.done && !state.failedAt;
  const failed = state.done && state.failedAt;

  return (
    <div className="interactive-demo">
      <div className="demo-kicker">Under the hood · CI/CD</div>
      <h3>Step through a CI pipeline</h3>
      <p className="demo-description">
        Each stage only runs if the previous one passed. Click a stage to see what it defends
        against. Inject a failure to see how the pipeline stops early.
      </p>

      <div className="demo-controls">
        <button
          className="demo-button primary"
          onClick={runPipeline}
          disabled={state.running || state.done}
        >
          {state.running ? "Running…" : "Run pipeline"}
        </button>
        <button className="demo-button" onClick={reset} disabled={state.running}>
          Reset
        </button>
        <span className="demo-step-count">
          {state.running && `${formatMs(state.elapsed)} elapsed`}
          {state.done && `Finished in ${formatMs(totalTime(state.statuses, state.failedAt))}`}
          {!state.running && !state.done && "Ready"}
        </span>
      </div>

      <div className="ci-inject-row">
        <span className="demo-column-label">Inject failure at</span>
        <div className="ci-inject-buttons">
          {STAGES.map((stage) => (
            <button
              key={stage.id}
              className={`demo-button ci-inject-btn ${injectFailAt === stage.id ? "ci-inject-active" : ""}`}
              onClick={() => setInjectFailAt((prev) => (prev === stage.id ? null : stage.id))}
              disabled={state.running}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ci-pipeline">
        {STAGES.map((stage, i) => {
          const status = state.statuses[stage.id];
          const isActive = activeStage?.id === stage.id;
          return (
            <div key={stage.id} className="ci-stage-row">
              <button
                className={`ci-stage ci-stage-${status} ${isActive ? "ci-stage-selected" : ""}`}
                onClick={() => setActiveStage(isActive ? null : stage)}
              >
                <span className="ci-stage-icon">{statusIcon(status)}</span>
                <span className="ci-stage-label">{stage.label}</span>
                <span className="ci-stage-desc">{stage.description}</span>
                <span className="ci-stage-time">{formatMs(stage.durationMs)}</span>
              </button>
              {i < STAGES.length - 1 && (
                <div
                  className={`ci-connector ${
                    state.statuses[STAGES[i + 1].id] !== "waiting" ? "ci-connector-active" : ""
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {activeStage && (
        <div className="demo-output">
          <strong>{activeStage.label}</strong>
          <div className="demo-insight">{activeStage.what}</div>
        </div>
      )}

      {allPassed && (
        <div className="ci-result ci-result-pass">
          ✓ All stages passed. Artifact ready for deployment.
        </div>
      )}
      {failed && (
        <div className="ci-result ci-result-fail">
          ✗{" "}
          {state.failedAt &&
            STAGES.find((s) => s.id === state.failedAt)?.label + " failed. Pipeline stopped."}{" "}
          Subsequent stages were skipped. No artifact was created.
        </div>
      )}
    </div>
  );
}
