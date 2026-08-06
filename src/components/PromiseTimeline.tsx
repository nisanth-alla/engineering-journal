import { useState } from "react";

type TimelineItem = {
  label: string;
  type: "sync" | "promise" | "then" | "catch" | "finally" | "error";
  indent: number;
};

type Scenario = {
  label: string;
  code: string;
  timeline: TimelineItem[];
  explanation: string;
};

const scenarios: Scenario[] = [
  {
    label: "Basic chain",
    code: `fetch("/api/user")
  .then(res => res.json())
  .then(user => console.log(user.name))
  .catch(err => console.error(err));`,
    timeline: [
      { label: "fetch('/api/user')", type: "promise", indent: 0 },
      { label: "pending... (waiting for network)", type: "sync", indent: 1 },
      { label: "resolved: Response object", type: "then", indent: 1 },
      { label: ".then(res => res.json())", type: "then", indent: 1 },
      { label: "resolved: { name: 'Alice', ... }", type: "then", indent: 2 },
      { label: ".then(user => console.log(user.name))", type: "then", indent: 2 },
      { label: 'output: "Alice"', type: "finally", indent: 2 },
    ],
    explanation:
      "Each .then returns a new Promise. The chain is sequential: res.json() doesn't run until fetch resolves. If fetch fails, the entire chain skips to .catch.",
  },
  {
    label: "Error propagation",
    code: `Promise.resolve("start")
  .then(val => { throw new Error("boom"); })
  .then(val => console.log("skipped"))
  .catch(err => console.log("caught:", err.message))
  .then(() => console.log("continues"));`,
    timeline: [
      { label: 'Promise.resolve("start")', type: "promise", indent: 0 },
      { label: 'resolved: "start"', type: "then", indent: 1 },
      { label: ".then() throws Error('boom')", type: "error", indent: 1 },
      { label: ".then(val => log('skipped')) SKIPPED", type: "sync", indent: 1 },
      { label: '.catch(err => log("caught:", err.message))', type: "catch", indent: 1 },
      { label: 'output: "caught: boom"', type: "catch", indent: 2 },
      { label: '.then(() => log("continues"))', type: "then", indent: 1 },
      { label: 'output: "continues"', type: "finally", indent: 2 },
    ],
    explanation:
      "Errors skip .then handlers and fall through to the nearest .catch. After .catch handles the error, the chain continues normally. The .then after .catch runs because .catch itself returned a resolved promise.",
  },
  {
    label: "Promise.all",
    code: `const [user, posts, comments] = await Promise.all([
  fetch("/api/user").then(r => r.json()),
  fetch("/api/posts").then(r => r.json()),
  fetch("/api/comments").then(r => r.json()),
]);`,
    timeline: [
      { label: "Promise.all([p1, p2, p3])", type: "promise", indent: 0 },
      { label: "fetch /api/user starts", type: "promise", indent: 1 },
      { label: "fetch /api/posts starts", type: "promise", indent: 1 },
      { label: "fetch /api/comments starts", type: "promise", indent: 1 },
      { label: "(all three run concurrently, not sequentially)", type: "sync", indent: 1 },
      { label: "/api/posts resolves (200ms)", type: "then", indent: 1 },
      { label: "/api/user resolves (250ms)", type: "then", indent: 1 },
      { label: "/api/comments resolves (300ms)", type: "then", indent: 1 },
      { label: "Promise.all resolves: [user, posts, comments]", type: "finally", indent: 0 },
    ],
    explanation:
      "All three fetches start at the same time. Promise.all waits for ALL of them. Total time = slowest request (300ms), not sum of all (750ms). If ANY promise rejects, the whole Promise.all rejects immediately.",
  },
  {
    label: "async/await vs .then",
    code: `// These are equivalent:
// .then version:
getUser(id)
  .then(user => getOrders(user.id))
  .then(orders => render(orders));

// async/await version:
const user = await getUser(id);
const orders = await getOrders(user.id);
render(orders);`,
    timeline: [
      { label: "getUser(id) called", type: "promise", indent: 0 },
      { label: "await pauses execution", type: "sync", indent: 1 },
      { label: "resolved: user object", type: "then", indent: 1 },
      { label: "getOrders(user.id) called", type: "promise", indent: 0 },
      { label: "await pauses execution", type: "sync", indent: 1 },
      { label: "resolved: orders array", type: "then", indent: 1 },
      { label: "render(orders) called", type: "finally", indent: 0 },
    ],
    explanation:
      "async/await is syntactic sugar over Promises. The code reads top-to-bottom like synchronous code, but each await pauses the function and yields to the event loop. Under the hood, the engine transforms it into a .then chain.",
  },
];

const typeColors: Record<string, string> = {
  sync: "var(--sl-color-gray-3)",
  promise: "#3b82f6",
  then: "#22c55e",
  catch: "#ef4444",
  error: "#ef4444",
  finally: "#f59e0b",
};

export default function PromiseTimeline() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const scenario = scenarios[scenarioIdx];

  return (
    <div className="interactive-demo">
      <h4>Try it: Promise Execution Flow</h4>
      <p style={{ fontSize: "0.85rem", color: "var(--sl-color-gray-2)", margin: "0 0 1rem" }}>
        Pick a pattern, then step through to see how promises resolve, chain, and propagate errors.
      </p>

      <div className="demo-controls">
        {scenarios.map((s, i) => (
          <button
            key={i}
            className={`demo-button ${i === scenarioIdx ? "primary" : ""}`}
            onClick={() => {
              setScenarioIdx(i);
              setRevealed(0);
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
          className="demo-button primary"
          onClick={() => setRevealed((r) => Math.min(r + 1, scenario.timeline.length))}
          disabled={revealed >= scenario.timeline.length}
        >
          {revealed === 0 ? "Start" : "Next step"}
        </button>
        <button className="demo-button" onClick={() => setRevealed(0)}>
          Reset
        </button>
        <button className="demo-button" onClick={() => setRevealed(scenario.timeline.length)}>
          Show all
        </button>
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        <div className="comparison-label">Execution timeline</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          {scenario.timeline.slice(0, revealed).map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.25rem 0.5rem",
                marginLeft: `${item.indent * 20}px`,
                borderRadius: "3px",
                fontSize: "0.8rem",
                fontFamily: "var(--sl-font-mono)",
                background: `color-mix(in srgb, ${typeColors[item.type]} 10%, transparent)`,
                color: typeColors[item.type],
                borderLeft: `2px solid ${typeColors[item.type]}`,
              }}
            >
              {item.label}
            </div>
          ))}
          {revealed === 0 && (
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--sl-color-gray-4)",
                fontStyle: "italic",
                padding: "0.25rem",
              }}
            >
              Click Start to begin
            </div>
          )}
        </div>
      </div>

      {revealed >= scenario.timeline.length && (
        <div className="demo-output" style={{ marginTop: "0.75rem" }}>
          {scenario.explanation}
        </div>
      )}
    </div>
  );
}
