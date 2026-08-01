import { useState, useEffect, useRef, useCallback } from "react";

type TimelineEntry = {
  id: number;
  phase: "mount" | "render" | "effect" | "cleanup" | "ref";
  label: string;
};

export default function HooksTimeline() {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(true);
  const nextId = useRef(0);

  // Batch: collect entries from the child via ref, flush once per user action
  const pendingEntries = useRef<Omit<TimelineEntry, "id">[]>([]);

  const queueEntry = useCallback(
    (phase: TimelineEntry["phase"], label: string) => {
      pendingEntries.current.push({ phase, label });
    },
    []
  );

  // Flush pending entries after each user-triggered render cycle
  // We use count and mounted as proxies for "the user did something"
  useEffect(() => {
    if (pendingEntries.current.length > 0) {
      const entries = pendingEntries.current.map((e) => ({
        ...e,
        id: nextId.current++,
      }));
      pendingEntries.current = [];
      setTimeline((prev) => [...prev, ...entries]);
    }
  }, [count, mounted]);

  return (
    <div className="interactive-demo">
      <h4>Try it: Hooks Lifecycle Timeline</h4>
      <div className="demo-controls">
        <button
          className="demo-button primary"
          onClick={() => {
            if (mounted) setCount((c) => c + 1);
          }}
        >
          Increment ({count})
        </button>
        <button
          className="demo-button"
          onClick={() => {
            setMounted((m) => !m);
            setCount(0);
          }}
        >
          {mounted ? "Unmount" : "Mount"}
        </button>
        <button
          className="demo-button"
          onClick={() => {
            setTimeline([]);
            nextId.current = 0;
            pendingEntries.current = [];
            setCount(0);
            setMounted(true);
          }}
        >
          Clear
        </button>
      </div>

      {mounted && <TrackedComponent count={count} onEvent={queueEntry} />}

      <div style={{ marginTop: "1rem" }}>
        <div className="comparison-label">
          Timeline ({timeline.length} events)
        </div>
        <div className="timeline">
          {timeline.length === 0 && (
            <span
              style={{ color: "var(--sl-color-gray-3)", fontSize: "0.8rem" }}
            >
              Click Increment or Unmount/Mount to see hooks execute
            </span>
          )}
          {timeline.map((entry) => (
            <div key={entry.id} className={`timeline-entry ${entry.phase}`}>
              <span style={{ width: "60px", flexShrink: 0 }}>
                [{entry.phase}]
              </span>
              <span>{entry.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackedComponent({
  count,
  onEvent,
}: {
  count: number;
  onEvent: (phase: TimelineEntry["phase"], label: string) => void;
}) {
  const renderCount = useRef(0);
  const divRef = useRef<HTMLDivElement>(null);

  renderCount.current++;

  // Log render phase (safe: onEvent writes to a ref, not state)
  onEvent("render", `Component rendered (render #${renderCount.current})`);

  useEffect(() => {
    onEvent("effect", `useEffect[count] ran (count is ${count})`);
    return () => {
      onEvent("cleanup", `useEffect[count] cleanup (count was ${count})`);
    };
  }, [count, onEvent]);

  useEffect(() => {
    onEvent("mount", "Component mounted");
    return () => {
      onEvent("cleanup", "Component unmounting");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (divRef.current) {
      onEvent(
        "ref",
        `useRef: div has ${divRef.current.childNodes.length} child nodes`
      );
    }
  }, [count, onEvent]);

  return (
    <div ref={divRef} className="demo-component">
      <div>
        Count: <strong>{count}</strong>
      </div>
      <div className="render-count">
        renders: <span className="count">{renderCount.current}</span>
      </div>
    </div>
  );
}
