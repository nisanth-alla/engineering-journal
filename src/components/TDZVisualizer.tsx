import { useState } from "react";

type Status = "success" | "error" | "assign";
type Step = { line: number; value: string; status: Status; scope: string; explanation: string };
type Scenario = { kind: string; varName: string; lines: string[]; steps: Step[]; insight: string };

const scenarios: Scenario[] = [
  {
    kind: "var", varName: "x",
    lines: ["console.log(x);", "var x = 10;", "console.log(x);"],
    steps: [
      { line: 1, value: "undefined", status: "success", scope: "Function",
        explanation: "var is hoisted to the top of its function scope AND initialized to undefined. Accessing it before the declaration line works — it just returns undefined." },
      { line: 2, value: "10", status: "assign", scope: "Function",
        explanation: "The assignment x = 10 happens here at runtime. The declaration was already hoisted, so this line only performs the assignment." },
      { line: 3, value: "10", status: "success", scope: "Function",
        explanation: "x is 10. var variables live in function scope (or global scope if not inside a function). No block scoping." },
    ],
    insight: "var is hoisted AND initialized to undefined. No TDZ — access before declaration returns undefined instead of throwing.",
  },
  {
    kind: "let", varName: "y",
    lines: ["console.log(y);", "let y = 20;", "console.log(y);"],
    steps: [
      { line: 1, value: "ReferenceError", status: "error", scope: "Block (TDZ)",
        explanation: "let IS hoisted — the engine knows y exists — but it is NOT initialized. The time between hoisting and the declaration line is the Temporal Dead Zone. Any access throws a ReferenceError." },
      { line: 2, value: "20", status: "assign", scope: "Block",
        explanation: "The TDZ ends here. y is declared and assigned 20 in one step. From this point on, y is safely accessible in its block scope." },
      { line: 3, value: "20", status: "success", scope: "Block",
        explanation: "y is 20. let variables are block-scoped — they only exist within the nearest { } block, not the entire function." },
    ],
    insight: "let is hoisted but NOT initialized. Access before the declaration line throws a ReferenceError — this is the Temporal Dead Zone.",
  },
  {
    kind: "const", varName: "z",
    lines: ["console.log(z);", "const z = 30;", "console.log(z);", "z = 40;"],
    steps: [
      { line: 1, value: "ReferenceError", status: "error", scope: "Block (TDZ)",
        explanation: "Same as let — const is hoisted but not initialized. Accessing z in the Temporal Dead Zone throws a ReferenceError." },
      { line: 2, value: "30", status: "assign", scope: "Block",
        explanation: "The TDZ ends. const must be initialized at declaration — you cannot write \"const z;\" and assign later. Declaration and initialization are inseparable." },
      { line: 3, value: "30", status: "success", scope: "Block",
        explanation: "z is 30. Like let, const is block-scoped. The value is accessible and reads normally." },
      { line: 4, value: "TypeError", status: "error", scope: "Block",
        explanation: "const bindings cannot be reassigned. This is a TypeError, not a ReferenceError — the variable exists and is initialized, but the binding itself is immutable. (Note: const objects/arrays can still have their contents mutated.)" },
    ],
    insight: "const has the same TDZ as let, plus an immutable binding — reassignment throws a TypeError. The value itself is not frozen, only the binding.",
  },
];

const statusColor = (s: Status) => s === "error" ? "#ef4444" : s === "assign" ? "#f59e0b" : "#22a06b";
const statusLabel = (s: Status) => s === "error" ? "Throws!" : s === "assign" ? "Assigned" : "Accessible";

export default function TDZVisualizer() {
  const [kindIdx, setKindIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(-1);
  const scenario = scenarios[kindIdx];
  const step = stepIdx >= 0 ? scenario.steps[stepIdx] : null;

  return (
    <div className="interactive-demo">
      <span className="demo-kicker">Hoisting &amp; Temporal Dead Zone</span>
      <h3>Try it: var vs let vs const</h3>
      <p className="demo-description">
        Pick a declaration type, then step through execution line by line. Watch
        how hoisting and the TDZ affect each variable.
      </p>

      <div className="demo-controls">
        {scenarios.map((s, i) => (
          <button key={s.kind} className={`demo-button ${i === kindIdx ? "primary" : ""}`}
            onClick={() => { setKindIdx(i); setStepIdx(-1); }}>
            {s.kind}
          </button>
        ))}
      </div>

      <div className="demo-grid">
        <div className="demo-component">
          <div className="comparison-label">Code</div>
          {scenario.lines.map((line, i) => {
            const ln = i + 1;
            const isCurrent = step?.line === ln;
            const isError = isCurrent && step?.status === "error";
            const reached = step ? ln <= step.line : false;
            const lineStep = isCurrent ? scenario.steps.find((s) => s.line === ln) : null;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.3rem 0.55rem", borderRadius: "4px",
                borderLeft: isCurrent ? `3px solid ${isError ? "#ef4444" : "var(--ej-accent)"}` : "3px solid transparent",
                background: isCurrent ? (isError ? "color-mix(in srgb, #ef4444 8%, var(--ej-surface))" : "var(--ej-accent-soft)") : "transparent",
                opacity: reached || stepIdx < 0 ? 1 : 0.35,
                fontFamily: "var(--sl-font-mono)", fontSize: "0.78rem", lineHeight: "1.65",
                transition: "all 0.15s ease",
              }}>
                <span style={{ color: "var(--ej-subtle)", minWidth: "1.2rem", textAlign: "right" }}>{ln}</span>
                <code style={{ background: "transparent", padding: 0 }}>{line}</code>
                {lineStep && (
                  <span style={{ marginLeft: "auto", fontSize: "0.7rem", fontWeight: 700,
                    color: isError ? "#ef4444" : "#22a06b" }}>
                    {isError ? lineStep.value : `// ${lineStep.value}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="demo-component">
          <div className="comparison-label">Variable status</div>
          {step ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {([
                ["Name", scenario.varName, "var(--ej-accent)"],
                ["Value", step.value, step.status === "error" ? "#ef4444" : "var(--ej-accent)"],
                ["Scope", step.scope, "var(--ej-accent)"],
              ] as const).map(([label, val, color]) => (
                <div key={label} className="demo-scope-variable">
                  <span className="demo-scope-variable-name">{label}: </span>
                  <span style={{ fontFamily: "var(--sl-font-mono)", fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
              <div className="demo-scope-variable">
                <span className="demo-scope-variable-name">Status: </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: statusColor(step.status) }}>
                  {statusLabel(step.status)}
                </span>
              </div>
            </div>
          ) : (
            <div className="demo-empty">Click Step to begin execution</div>
          )}
        </div>
      </div>

      <div className="demo-controls">
        <button className="demo-button primary"
          onClick={() => setStepIdx((i) => Math.min(i + 1, scenario.steps.length - 1))}
          disabled={stepIdx >= scenario.steps.length - 1}>
          Step
        </button>
        <button className="demo-button" onClick={() => setStepIdx(-1)}>Reset</button>
        <span className="demo-step-count">
          {stepIdx >= 0 ? `Step ${stepIdx + 1}/${scenario.steps.length}` : "Ready"}
        </span>
      </div>

      {step && (
        <div className="demo-output"
          style={{ borderLeftColor: step.status === "error" ? "#ef4444" : "var(--ej-accent)" }}>
          {step.explanation}
        </div>
      )}

      <div className="demo-note">
        <strong>Key insight:</strong> {scenario.insight}
      </div>
    </div>
  );
}
