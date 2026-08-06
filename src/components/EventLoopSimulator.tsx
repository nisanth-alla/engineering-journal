import { useState } from "react";

type Step = {
  callStack: string[];
  microtaskQueue: string[];
  macrotaskQueue: string[];
  output: string[];
  explanation: string;
};

type Scenario = {
  label: string;
  code: string;
  steps: Step[];
};

const scenarios: Scenario[] = [
  {
    label: "Basic order",
    code: `console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");`,
    steps: [
      {
        callStack: ['console.log("1")'],
        microtaskQueue: [],
        macrotaskQueue: [],
        output: ["1"],
        explanation: 'Synchronous. Runs immediately on the call stack. Prints "1".',
      },
      {
        callStack: ["setTimeout(cb, 0)"],
        microtaskQueue: [],
        macrotaskQueue: ["cb: log(2)"],
        output: ["1"],
        explanation:
          "setTimeout registers its callback in the macrotask queue (even with 0ms delay). The callback doesn't run yet.",
      },
      {
        callStack: ["Promise.resolve().then(cb)"],
        microtaskQueue: ["cb: log(3)"],
        macrotaskQueue: ["cb: log(2)"],
        output: ["1"],
        explanation:
          "Promise.then registers its callback in the microtask queue. Microtasks have higher priority than macrotasks.",
      },
      {
        callStack: ['console.log("4")'],
        microtaskQueue: ["cb: log(3)"],
        macrotaskQueue: ["cb: log(2)"],
        output: ["1", "4"],
        explanation: 'Synchronous. Runs on the call stack. Prints "4". Call stack is now empty.',
      },
      {
        callStack: ["cb: log(3)"],
        microtaskQueue: [],
        macrotaskQueue: ["cb: log(2)"],
        output: ["1", "4", "3"],
        explanation:
          'Call stack is empty, so the event loop checks the microtask queue first. Runs the Promise callback. Prints "3".',
      },
      {
        callStack: ["cb: log(2)"],
        microtaskQueue: [],
        macrotaskQueue: [],
        output: ["1", "4", "3", "2"],
        explanation:
          'Microtask queue empty. Now the event loop picks from the macrotask queue. Runs the setTimeout callback. Prints "2". Final order: 1, 4, 3, 2.',
      },
    ],
  },
  {
    label: "Nested microtasks",
    code: `setTimeout(() => console.log("A"), 0);
Promise.resolve()
  .then(() => {
    console.log("B");
    Promise.resolve().then(() => console.log("C"));
  })
  .then(() => console.log("D"));
console.log("E");`,
    steps: [
      {
        callStack: ["setTimeout(cb, 0)"],
        microtaskQueue: [],
        macrotaskQueue: ['cb: log("A")'],
        output: [],
        explanation: "setTimeout callback goes to the macrotask queue.",
      },
      {
        callStack: ["Promise chain setup"],
        microtaskQueue: ['cb: log("B") + nest'],
        macrotaskQueue: ['cb: log("A")'],
        output: [],
        explanation:
          "The first .then callback is queued as a microtask. The second .then waits for the first to resolve.",
      },
      {
        callStack: ['console.log("E")'],
        microtaskQueue: ['cb: log("B") + nest'],
        macrotaskQueue: ['cb: log("A")'],
        output: ["E"],
        explanation: 'Synchronous. Prints "E". Call stack is now empty.',
      },
      {
        callStack: ['cb: log("B") + nest'],
        microtaskQueue: ['cb: log("C")', 'cb: log("D")'],
        macrotaskQueue: ['cb: log("A")'],
        output: ["E", "B"],
        explanation:
          'First microtask runs. Prints "B". Inside it, a new Promise.then queues log("C") as another microtask. The chained .then queues log("D").',
      },
      {
        callStack: ['cb: log("C")'],
        microtaskQueue: ['cb: log("D")'],
        macrotaskQueue: ['cb: log("A")'],
        output: ["E", "B", "C"],
        explanation:
          'The nested microtask runs next. Microtasks added during microtask processing run before any macrotask. Prints "C".',
      },
      {
        callStack: ['cb: log("D")'],
        microtaskQueue: [],
        macrotaskQueue: ['cb: log("A")'],
        output: ["E", "B", "C", "D"],
        explanation: 'Next microtask. Prints "D". Microtask queue is now empty.',
      },
      {
        callStack: ['cb: log("A")'],
        microtaskQueue: [],
        macrotaskQueue: [],
        output: ["E", "B", "C", "D", "A"],
        explanation:
          'Finally the macrotask runs. Prints "A". Key insight: ALL microtasks (including nested ones) run before any macrotask.',
      },
    ],
  },
  {
    label: "async/await",
    code: `async function foo() {
  console.log("1");
  await Promise.resolve();
  console.log("2");
}
console.log("3");
foo();
console.log("4");`,
    steps: [
      {
        callStack: ['console.log("3")'],
        microtaskQueue: [],
        macrotaskQueue: [],
        output: ["3"],
        explanation: 'Synchronous. Prints "3".',
      },
      {
        callStack: ["foo()", 'console.log("1")'],
        microtaskQueue: [],
        macrotaskQueue: [],
        output: ["3", "1"],
        explanation:
          'foo() is called. Everything before the first await runs synchronously. Prints "1".',
      },
      {
        callStack: ["await Promise.resolve()"],
        microtaskQueue: ["resume foo: log(2)"],
        macrotaskQueue: [],
        output: ["3", "1"],
        explanation:
          "await pauses foo. The rest of the function (after await) is scheduled as a microtask. Control returns to the caller.",
      },
      {
        callStack: ['console.log("4")'],
        microtaskQueue: ["resume foo: log(2)"],
        macrotaskQueue: [],
        output: ["3", "1", "4"],
        explanation:
          'Back in the global scope. Prints "4". This is why code after an async function call runs before the awaited code inside it.',
      },
      {
        callStack: ['resume foo: log("2")'],
        microtaskQueue: [],
        macrotaskQueue: [],
        output: ["3", "1", "4", "2"],
        explanation:
          'Call stack empty. Microtask runs, resuming foo after the await. Prints "2". Final order: 3, 1, 4, 2.',
      },
    ],
  },
];

export default function EventLoopSimulator() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(-1);
  const scenario = scenarios[scenarioIdx];
  const step = stepIdx >= 0 ? scenario.steps[stepIdx] : null;

  return (
    <div className="interactive-demo">
      <h4>Try it: Event Loop Simulator</h4>
      <p style={{ fontSize: "0.85rem", color: "var(--sl-color-gray-2)", margin: "0 0 1rem" }}>
        Pick a scenario, then step through tick by tick. Watch items move between the call stack,
        microtask queue, and macrotask queue.
      </p>

      <div className="demo-controls">
        {scenarios.map((s, i) => (
          <button
            key={i}
            className={`demo-button ${i === scenarioIdx ? "primary" : ""}`}
            onClick={() => {
              setScenarioIdx(i);
              setStepIdx(-1);
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
          margin: "1rem 0",
        }}
      >
        <code>{scenario.code}</code>
      </pre>

      <div className="demo-controls">
        <button
          className="demo-button primary"
          onClick={() => setStepIdx((i) => Math.min(i + 1, scenario.steps.length - 1))}
          disabled={stepIdx >= scenario.steps.length - 1}
        >
          {stepIdx < 0 ? "Start" : "Next tick"}
        </button>
        <button className="demo-button" onClick={() => setStepIdx(-1)}>
          Reset
        </button>
        <span style={{ fontSize: "0.8rem", color: "var(--sl-color-gray-3)", alignSelf: "center" }}>
          {stepIdx >= 0 ? `Step ${stepIdx + 1}/${scenario.steps.length}` : "Ready"}
        </span>
      </div>

      <div className="demo-queue-grid">
        <QueueBox title="Call Stack" items={step?.callStack ?? []} color="#3b82f6" />
        <QueueBox title="Microtask Queue" items={step?.microtaskQueue ?? []} color="#f59e0b" />
        <QueueBox title="Macrotask Queue" items={step?.macrotaskQueue ?? []} color="#8b5cf6" />
      </div>

      {step && (
        <>
          <div className="demo-output" style={{ marginTop: "0.75rem" }}>
            <strong>Console output:</strong>{" "}
            <code>{step.output.length > 0 ? step.output.join(", ") : "(empty)"}</code>
          </div>
          <div
            className="demo-output"
            style={{ marginTop: "0.5rem", background: "transparent", padding: "0.5rem 0" }}
          >
            {step.explanation}
          </div>
        </>
      )}
    </div>
  );
}

function QueueBox({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="queue-box">
      <div className="queue-box-title">{title}</div>
      {items.length === 0 && <div className="queue-empty">empty</div>}
      {items.map((item, i) => (
        <div
          key={i}
          className="queue-item"
          style={{ "--queue-color": color } as React.CSSProperties}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
