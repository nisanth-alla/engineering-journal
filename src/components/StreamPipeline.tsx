import { Fragment, useState, useEffect, useRef } from "react";

type PipeStage = {
  name: string;
  type: "readable" | "transform" | "writable";
  color: string;
};

type Chunk = {
  id: number;
  label: string;
  stage: number; // -1 = not started, 0-2 = at stage, 3 = done
};

const stages: PipeStage[] = [
  { name: "Readable", type: "readable", color: "#3b82f6" },
  { name: "Transform", type: "transform", color: "#f59e0b" },
  { name: "Writable", type: "writable", color: "#22c55e" },
];

export default function StreamPipeline() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [running, setRunning] = useState(false);
  const [backpressure, setBackpressure] = useState(false);
  const [speed, setSpeed] = useState<"normal" | "slow-writer">("normal");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextId = useRef(0);

  function start() {
    setChunks([]);
    setRunning(true);
    setBackpressure(false);
    nextId.current = 0;

    const totalChunks = 8;
    let tick = 0;

    // Generate initial chunks
    const initial: Chunk[] = Array.from({ length: totalChunks }, (_, i) => ({
      id: i,
      label: `chunk_${i}`,
      stage: -1,
    }));
    nextId.current = totalChunks;
    setChunks(initial);

    const writerDelay = speed === "slow-writer" ? 3 : 1; // slow writer takes 3 ticks per chunk

    intervalRef.current = setInterval(() => {
      tick++;
      setChunks((prev) => {
        const next = prev.map((c) => ({ ...c }));
        let writerBusy = false;

        // Move chunks forward through the pipeline
        // Process from right to left so we don't double-advance
        for (let i = next.length - 1; i >= 0; i--) {
          const chunk = next[i];

          if (chunk.stage === 2) {
            // At writable: advance to done (with potential delay)
            if (tick % writerDelay === 0) {
              chunk.stage = 3;
            } else {
              writerBusy = true;
            }
          } else if (chunk.stage === 1) {
            // At transform: advance to writable if writable is free
            const atWritable = next.filter((c) => c.stage === 2).length;
            if (atWritable === 0) {
              chunk.stage = 2;
            }
          } else if (chunk.stage === 0) {
            // At readable: advance to transform if transform is free
            const atTransform = next.filter((c) => c.stage === 1).length;
            if (atTransform === 0) {
              chunk.stage = 1;
            }
          } else if (chunk.stage === -1) {
            // Not started: enter readable if readable is free
            const atReadable = next.filter((c) => c.stage === 0).length;
            if (atReadable === 0) {
              chunk.stage = 0;
            }
          }
        }

        // Detect backpressure: chunks pile up because writer is slow
        const waiting = next.filter(
          (c) => c.stage >= 0 && c.stage < 3
        ).length;
        setBackpressure(writerBusy && waiting > 2);

        // Check if all done
        const allDone = next.every((c) => c.stage === 3);
        if (allDone) {
          clearInterval(intervalRef.current!);
          setRunning(false);
        }

        return next;
      });
    }, 500);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="interactive-demo">
      <h4>Try it: Stream Pipeline</h4>
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--sl-color-gray-2)",
          margin: "0 0 1rem",
        }}
      >
        Watch data chunks flow through a Readable → Transform → Writable
        pipeline. Switch to "Slow writer" to see backpressure in action.
      </p>

      <div className="demo-controls">
        <button
          className="demo-button primary"
          onClick={running ? stop : start}
        >
          {running ? "Stop" : "Start pipeline"}
        </button>
        <button
          className={`demo-button ${speed === "normal" ? "primary" : ""}`}
          onClick={() => setSpeed("normal")}
          disabled={running}
        >
          Normal speed
        </button>
        <button
          className={`demo-button ${speed === "slow-writer" ? "primary" : ""}`}
          onClick={() => setSpeed("slow-writer")}
          disabled={running}
        >
          Slow writer
        </button>
      </div>

      {/* Pipeline visualization */}
      <div className="demo-pipeline">
        {stages.map((stage, si) => (
          <Fragment key={stage.name}>
            <div className="demo-pipeline-stage" style={{ "--pipeline-color": stage.color } as React.CSSProperties}>
              <div className="demo-pipeline-stage-title">{stage.name}</div>
              <div className="demo-pipeline-stage-items">
                {chunks
                  .filter((c) => c.stage === si)
                  .map((c) => (
                    <div key={c.id} className="demo-pipeline-chunk">
                      {c.label}
                    </div>
                  ))}
              </div>
            </div>
            {si < 2 && (
              <div key={`arrow-${si}`} className="demo-pipeline-arrow">
                →
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Status */}
      <div className="demo-pipeline-stats">
        <div>
          <span className="demo-pipeline-label">Pending: </span>
          <span>{chunks.filter((c) => c.stage === -1).length}</span>
        </div>
        <div>
          <span className="demo-pipeline-label">In pipeline: </span>
          <span>{chunks.filter((c) => c.stage >= 0 && c.stage < 3).length}</span>
        </div>
        <div>
          <span className="demo-pipeline-label">Done: </span>
          <span>{chunks.filter((c) => c.stage === 3).length}</span>
        </div>
        {backpressure && (
          <div style={{ color: "#ef4444", fontWeight: 600 }}>
            BACKPRESSURE — writer can't keep up
          </div>
        )}
      </div>

      {!running && chunks.length > 0 && chunks.every((c) => c.stage === 3) && (
        <div className="demo-output" style={{ marginTop: "0.75rem" }}>
          All chunks processed. {speed === "slow-writer"
            ? "Notice how the slow writer caused chunks to wait at the transform stage. In real Node.js streams, this triggers the 'drain' event pattern: the readable pauses until the writable signals it's ready for more."
            : "Try 'Slow writer' to see what happens when one stage can't keep up with the others."}
        </div>
      )}
    </div>
  );
}
