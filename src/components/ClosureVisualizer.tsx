import { useState } from "react";

type ScopeLevel = {
  name: string;
  variables: { name: string; value: string }[];
  color: string;
};

type Scenario = {
  label: string;
  code: string;
  steps: {
    description: string;
    scopes: ScopeLevel[];
    highlight: string;
    output?: string;
  }[];
};

const scenarios: Scenario[] = [
  {
    label: "Basic closure",
    code: `function makeCounter() {
  let count = 0;
  return function increment() {
    count++;
    return count;
  };
}
const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2`,
    steps: [
      {
        description: "makeCounter is called. A new scope is created with count = 0.",
        scopes: [
          {
            name: "Global",
            variables: [
              { name: "makeCounter", value: "fn" },
              { name: "counter", value: "undefined" },
            ],
            color: "#6366f1",
          },
          { name: "makeCounter()", variables: [{ name: "count", value: "0" }], color: "#22c55e" },
        ],
        highlight: "let count = 0;",
      },
      {
        description:
          "makeCounter returns the inner function. makeCounter's scope should be garbage collected... but it won't be.",
        scopes: [
          {
            name: "Global",
            variables: [
              { name: "makeCounter", value: "fn" },
              { name: "counter", value: "fn increment" },
            ],
            color: "#6366f1",
          },
          {
            name: "makeCounter() [closed over]",
            variables: [{ name: "count", value: "0" }],
            color: "#22c55e",
          },
        ],
        highlight: "return function increment()",
      },
      {
        description:
          "counter() is called. increment runs inside its own scope, but reaches into the closed-over scope to find count.",
        scopes: [
          {
            name: "Global",
            variables: [{ name: "counter", value: "fn increment" }],
            color: "#6366f1",
          },
          {
            name: "makeCounter() [closed over]",
            variables: [{ name: "count", value: "1" }],
            color: "#22c55e",
          },
          { name: "increment()", variables: [], color: "#f59e0b" },
        ],
        highlight: "count++;",
        output: "1",
      },
      {
        description:
          "counter() called again. Same closed-over scope. count is still alive and is now 1, so it becomes 2.",
        scopes: [
          {
            name: "Global",
            variables: [{ name: "counter", value: "fn increment" }],
            color: "#6366f1",
          },
          {
            name: "makeCounter() [closed over]",
            variables: [{ name: "count", value: "2" }],
            color: "#22c55e",
          },
          { name: "increment()", variables: [], color: "#f59e0b" },
        ],
        highlight: "count++;",
        output: "2",
      },
    ],
  },
  {
    label: "Loop trap",
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 3, 3, 3 (not 0, 1, 2)

// Fix with let:
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
// Prints: 0, 1, 2`,
    steps: [
      {
        description:
          "var i is hoisted to function scope. There's one i shared across all iterations.",
        scopes: [
          {
            name: "Function scope",
            variables: [{ name: "i (var)", value: "0" }],
            color: "#6366f1",
          },
        ],
        highlight: "var i = 0",
      },
      {
        description:
          "Loop runs. Three setTimeout callbacks are created. Each one closes over the SAME i variable.",
        scopes: [
          {
            name: "Function scope",
            variables: [{ name: "i (var)", value: "3" }],
            color: "#6366f1",
          },
          {
            name: "setTimeout cb 1",
            variables: [{ name: "closes over", value: "i (shared)" }],
            color: "#ef4444",
          },
          {
            name: "setTimeout cb 2",
            variables: [{ name: "closes over", value: "i (shared)" }],
            color: "#ef4444",
          },
          {
            name: "setTimeout cb 3",
            variables: [{ name: "closes over", value: "i (shared)" }],
            color: "#ef4444",
          },
        ],
        highlight: "setTimeout(() => console.log(i), 100)",
        output: "3, 3, 3",
      },
      {
        description:
          "With let, each iteration gets its OWN j in a new block scope. Each callback closes over a different j.",
        scopes: [
          {
            name: "Block scope (i=0)",
            variables: [{ name: "j (let)", value: "0" }],
            color: "#22c55e",
          },
          {
            name: "Block scope (i=1)",
            variables: [{ name: "j (let)", value: "1" }],
            color: "#22c55e",
          },
          {
            name: "Block scope (i=2)",
            variables: [{ name: "j (let)", value: "2" }],
            color: "#22c55e",
          },
        ],
        highlight: "let j = 0",
        output: "0, 1, 2",
      },
    ],
  },
  {
    label: "Private state",
    code: `function createUser(name) {
  let loginCount = 0;  // private

  return {
    getName: () => name,
    login: () => {
      loginCount++;
      return loginCount;
    },
    getLogins: () => loginCount,
  };
}
const user = createUser("Alice");
user.login(); user.login();
console.log(user.getLogins()); // 2
console.log(user.loginCount);  // undefined`,
    steps: [
      {
        description: "createUser is called. name and loginCount exist in its scope.",
        scopes: [
          { name: "Global", variables: [{ name: "user", value: "undefined" }], color: "#6366f1" },
          {
            name: "createUser()",
            variables: [
              { name: "name", value: '"Alice"' },
              { name: "loginCount", value: "0" },
            ],
            color: "#22c55e",
          },
        ],
        highlight: "let loginCount = 0;",
      },
      {
        description:
          "The returned object's methods close over name and loginCount. The variables are accessible through the methods but not directly on the object.",
        scopes: [
          {
            name: "Global",
            variables: [{ name: "user", value: "{ getName, login, getLogins }" }],
            color: "#6366f1",
          },
          {
            name: "createUser() [closed over]",
            variables: [
              { name: "name", value: '"Alice"' },
              { name: "loginCount", value: "0" },
            ],
            color: "#22c55e",
          },
        ],
        highlight: "return {",
      },
      {
        description:
          "user.login() is called twice. Each call reaches into the closure and increments loginCount. The variable is truly private.",
        scopes: [
          {
            name: "Global",
            variables: [{ name: "user", value: "{ getName, login, getLogins }" }],
            color: "#6366f1",
          },
          {
            name: "createUser() [closed over]",
            variables: [
              { name: "name", value: '"Alice"' },
              { name: "loginCount", value: "2" },
            ],
            color: "#22c55e",
          },
        ],
        highlight: "loginCount++;",
        output: "user.getLogins() = 2, user.loginCount = undefined",
      },
    ],
  },
];

export default function ClosureVisualizer() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const scenario = scenarios[scenarioIdx];
  const step = scenario.steps[stepIdx];

  return (
    <div className="interactive-demo">
      <h4>Try it: Closure Scope Chain</h4>
      <p style={{ fontSize: "0.85rem", color: "var(--sl-color-gray-2)", margin: "0 0 1rem" }}>
        Step through each scenario and watch the scope chain build up. Closed-over variables stay
        alive even after their parent function returns.
      </p>

      <div className="demo-controls">
        {scenarios.map((s, i) => (
          <button
            key={i}
            className={`demo-button ${i === scenarioIdx ? "primary" : ""}`}
            onClick={() => {
              setScenarioIdx(i);
              setStepIdx(0);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <pre
        style={{
          background: "var(--sl-color-gray-6)",
          padding: "0.75rem",
          borderRadius: "4px",
          fontSize: "0.8rem",
          overflow: "auto",
          margin: "0.75rem 0",
        }}
      >
        <code>{scenario.code}</code>
      </pre>

      <div className="demo-controls">
        <button
          className="demo-button"
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          disabled={stepIdx <= 0}
        >
          Back
        </button>
        <button
          className="demo-button primary"
          onClick={() => setStepIdx((i) => Math.min(i + 1, scenario.steps.length - 1))}
          disabled={stepIdx >= scenario.steps.length - 1}
        >
          Next
        </button>
        <span style={{ fontSize: "0.8rem", color: "var(--sl-color-gray-3)", alignSelf: "center" }}>
          Step {stepIdx + 1}/{scenario.steps.length}
        </span>
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        <div className="comparison-label">Scope chain</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {step.scopes.map((scope, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${scope.color}40`,
                borderLeft: `3px solid ${scope.color}`,
                borderRadius: "4px",
                padding: "0.5rem 0.75rem",
                background: `color-mix(in srgb, ${scope.color} 8%, var(--sl-color-gray-6))`,
                marginLeft: `${i * 16}px`,
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: scope.color,
                  marginBottom: "0.25rem",
                }}
              >
                {scope.name}
              </div>
              {scope.variables.map((v, j) => (
                <div key={j} style={{ fontSize: "0.8rem", fontFamily: "var(--sl-font-mono)" }}>
                  <span style={{ color: "var(--sl-color-gray-3)" }}>{v.name}</span>
                  <span style={{ color: "var(--sl-color-gray-4)" }}> = </span>
                  <span style={{ color: "var(--sl-color-accent)" }}>{v.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="demo-output" style={{ marginTop: "0.75rem" }}>
        <div style={{ marginBottom: "0.3rem" }}>{step.description}</div>
        {step.output && (
          <div style={{ marginTop: "0.3rem" }}>
            <strong>Output:</strong> <code>{step.output}</code>
          </div>
        )}
      </div>
    </div>
  );
}
