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
      <p className="demo-description">
        Click a phase to see what runs there, or hit Animate to watch the loop cycle through all
        phases.
      </p>

      <div className="demo-controls">
        <button className="demo-button primary" onClick={animate} disabled={animating}>
          {animating ? "Running..." : "Animate one cycle"}
        </button>
      </div>

      <div className="demo-phase-list">
        {phases.map((phase, i) => {
          const isActive = activePhase === i;
          const isHighlighted = highlightIdx === i;
          return (
            <button
              key={i}
              className={`demo-phase-button ${isActive ? "is-active" : ""} ${isHighlighted ? "is-highlighted" : ""}`}
              onClick={() => {
                if (!animating) setActivePhase(isActive ? null : i);
              }}
              style={{ "--phase-color": phase.color } as React.CSSProperties}
            >
              <span className="demo-phase-name">{phase.name}</span>
              <span className="demo-phase-what">{phase.what}</span>
            </button>
          );
        })}
        <div className="demo-phase-loop">↑ loop repeats from Timers</div>
      </div>

      {activePhase !== null && (
        <div
          className="demo-output"
          style={{ "--phase-color": phases[activePhase].color } as React.CSSProperties}
        >
          <div className="demo-detail-title">
            <strong>{phases[activePhase].name}</strong>
          </div>
          <div className="demo-detail-meta">
            <span>Runs: </span>
            {phases[activePhase].examples.map((ex, i) => (
              <code key={i}>{ex}</code>
            ))}
          </div>
          <div className="demo-detail-copy">{phases[activePhase].detail}</div>
        </div>
      )}

      <div className="demo-note">
        <strong>Between every phase:</strong> Node drains the microtask queue (Promise callbacks,
        process.nextTick). process.nextTick runs before Promise callbacks. This is why nextTick can
        starve I/O if used recursively.
      </div>
    </div>
  );
}
