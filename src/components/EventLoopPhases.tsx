import { useState } from "react";

type Phase = {
  name: string;
  color: string;
  what: string;
  examples: string[];
  detail: string;
};

const phases: Phase[] = [
  {
    name: "Timers",
    color: "#ef4444",
    what: "Executes callbacks from setTimeout and setInterval",
    examples: ["setTimeout(cb, 100)", "setInterval(cb, 1000)"],
    detail:
      "Timers don't guarantee exact execution time. A setTimeout(cb, 100) means 'run cb no sooner than 100ms.' If the event loop is busy with I/O callbacks, the timer fires late. This is why setTimeout(..., 0) doesn't mean 'immediately' — it means 'as soon as the current phase and all microtasks finish.'",
  },
  {
    name: "Pending callbacks",
    color: "#f59e0b",
    what: "Executes I/O callbacks deferred from the previous loop",
    examples: ["TCP error callbacks", "Some OS-level callbacks"],
    detail:
      "Most I/O callbacks run in the Poll phase. This phase handles the edge cases: callbacks for certain system operations (like TCP errors) that were deferred to the next loop iteration. You rarely interact with this phase directly.",
  },
  {
    name: "Idle, prepare",
    color: "#6366f1",
    what: "Internal bookkeeping (used by Node internally)",
    examples: ["Not user-facing"],
    detail:
      "This phase is for Node's internal use. libuv does housekeeping here. You can't schedule work into this phase from JavaScript. It exists in the architecture but you never think about it.",
  },
  {
    name: "Poll",
    color: "#22c55e",
    what: "Retrieves new I/O events. Runs I/O callbacks. Blocks here when idle.",
    examples: [
      "fs.readFile callback",
      "http.get response",
      "database query result",
      "net.Socket data",
    ],
    detail:
      "This is where Node spends most of its time. The poll phase calculates how long it should block waiting for I/O, then executes callbacks for completed I/O operations. If the poll queue is empty AND there are no timers scheduled, Node blocks here waiting for new events. If there ARE timers, it moves on so they can fire on time.",
  },
  {
    name: "Check",
    color: "#3b82f6",
    what: "Executes setImmediate callbacks",
    examples: ["setImmediate(cb)"],
    detail:
      "setImmediate runs after the poll phase completes. It's guaranteed to run before any timers in the next loop iteration. The classic question: setTimeout(cb, 0) vs setImmediate(cb) — within an I/O callback, setImmediate always fires first because the check phase comes right after poll. Outside I/O, the order is unpredictable.",
  },
  {
    name: "Close callbacks",
    color: "#a855f7",
    what: "Runs close event handlers",
    examples: ["socket.on('close', cb)", "server.on('close', cb)"],
    detail:
      "When a socket or handle is closed abruptly (socket.destroy()), the close callback fires here. If a socket closes normally via .end(), the close event is emitted elsewhere. This phase cleans up resources at the end of the loop.",
  },
];

export default function EventLoopPhases() {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  function animate() {
    setAnimating(true);
    setActivePhase(null);
    let i = 0;
    const interval = setInterval(() => {
      setHighlightIdx(i);
      if (i >= phases.length) {
        clearInterval(interval);
        setAnimating(false);
        setHighlightIdx(-1);
      }
      i++;
    }, 800);
  }

  return (
    <div className="interactive-demo">
      <h4>Try it: Node.js Event Loop Phases</h4>
      <p style={{ fontSize: "0.85rem", color: "var(--sl-color-gray-2)", margin: "0 0 1rem" }}>
        Click a phase to see what runs there, or hit Animate to watch the loop cycle through all
        phases.
      </p>

      <div className="demo-controls">
        <button className="demo-button primary" onClick={animate} disabled={animating}>
          {animating ? "Running..." : "Animate one cycle"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "1rem" }}>
        {phases.map((phase, i) => {
          const isActive = activePhase === i;
          const isHighlighted = highlightIdx === i;
          return (
            <button
              key={i}
              onClick={() => {
                if (!animating) setActivePhase(isActive ? null : i);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 0.75rem",
                border: `1px solid ${isActive || isHighlighted ? phase.color : "var(--sl-color-gray-5)"}`,
                borderLeft: `4px solid ${phase.color}`,
                borderRadius: "4px",
                background: isHighlighted
                  ? `color-mix(in srgb, ${phase.color} 20%, var(--sl-color-gray-6))`
                  : isActive
                    ? `color-mix(in srgb, ${phase.color} 10%, var(--sl-color-gray-6))`
                    : "var(--sl-color-gray-6)",
                cursor: animating ? "default" : "pointer",
                textAlign: "left",
                width: "100%",
                fontFamily: "inherit",
                fontSize: "0.85rem",
                color: "inherit",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontWeight: 600, color: phase.color, minWidth: "130px" }}>
                {phase.name}
              </span>
              <span style={{ color: "var(--sl-color-gray-2)" }}>{phase.what}</span>
            </button>
          );
        })}
        <div
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "var(--sl-color-gray-4)",
            padding: "0.25rem",
          }}
        >
          ↑ loop repeats from Timers
        </div>
      </div>

      {activePhase !== null && (
        <div className="demo-output" style={{ marginTop: "0.75rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: phases[activePhase].color }}>{phases[activePhase].name}</strong>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <span style={{ color: "var(--sl-color-gray-3)" }}>Runs: </span>
            {phases[activePhase].examples.map((ex, i) => (
              <code key={i} style={{ marginRight: "0.5rem" }}>
                {ex}
              </code>
            ))}
          </div>
          <div style={{ lineHeight: 1.6 }}>{phases[activePhase].detail}</div>
        </div>
      )}

      <div
        style={{
          marginTop: "0.75rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "4px",
          background: "color-mix(in srgb, #f59e0b 8%, var(--sl-color-gray-6))",
          fontSize: "0.8rem",
          color: "var(--sl-color-gray-2)",
        }}
      >
        <strong>Between every phase:</strong> Node drains the microtask queue (Promise callbacks,
        process.nextTick). process.nextTick runs before Promise callbacks. This is why nextTick can
        starve I/O if used recursively.
      </div>
    </div>
  );
}
