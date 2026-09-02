import { useState } from "react";

const ROWS = [
  { id: 1, name: "Alice", age: 28, status: "active" },
  { id: 2, name: "Bob", age: 34, status: "inactive" },
  { id: 3, name: "Carol", age: 22, status: "active" },
  { id: 4, name: "David", age: 41, status: "pending" },
  { id: 5, name: "Eve", age: 29, status: "active" },
  { id: 6, name: "Frank", age: 19, status: "inactive" },
  { id: 7, name: "Grace", age: 35, status: "active" },
  { id: 8, name: "Hal", age: 27, status: "pending" },
  { id: 9, name: "Iris", age: 44, status: "active" },
  { id: 10, name: "Jake", age: 31, status: "inactive" },
  { id: 11, name: "Kate", age: 26, status: "active" },
  { id: 12, name: "Leo", age: 38, status: "pending" },
];

const TARGET_ID = 9; // the row we're searching for

// B-tree: sorted leaf node positions to visit for id=9
const BTREE_PATH = [
  {
    type: "root",
    label: "Root [1 … 12]",
    detail: "Root node. id=9 is in the upper half → go right.",
  },
  {
    type: "internal",
    label: "Internal [7 … 12]",
    detail: "Internal node. id=9 is in the lower half → go left.",
  },
  {
    type: "leaf",
    label: "Leaf [7, 8, 9]",
    detail: "Leaf node. Found id=9. Jump to row in heap.",
  },
  {
    type: "heap",
    label: "Heap page 3",
    detail: "Fetch the actual row from the heap using the pointer stored in the index leaf.",
  },
];

type Mode = "none" | "seq" | "index";

export default function IndexVisualizer() {
  const [mode, setMode] = useState<Mode>("none");
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);

  function startMode(m: Mode) {
    setMode(m);
    setStep(0);
    setDone(false);
  }

  function next() {
    if (mode === "seq") {
      if (step < ROWS.length - 1) setStep((s) => s + 1);
      else setDone(true);
    } else if (mode === "index") {
      if (step < BTREE_PATH.length - 1) setStep((s) => s + 1);
      else setDone(true);
    }
  }

  function reset() {
    setMode("none");
    setStep(-1);
    setDone(false);
  }

  const seqReadsNeeded = ROWS.findIndex((r) => r.id === TARGET_ID) + 1;
  const indexReadsNeeded = BTREE_PATH.length;

  return (
    <div className="interactive-demo">
      <div className="demo-kicker">Under the hood · Databases</div>
      <h3>Index vs sequential scan</h3>
      <p className="demo-description">
        Both searches find the same row: <code>WHERE id = {TARGET_ID}</code>. Watch how many rows
        (or nodes) each approach reads to get there.
      </p>

      <div className="demo-controls">
        <button
          className={`demo-button ${mode === "seq" ? "primary" : ""}`}
          onClick={() => startMode("seq")}
        >
          Sequential scan
        </button>
        <button
          className={`demo-button ${mode === "index" ? "primary" : ""}`}
          onClick={() => startMode("index")}
        >
          Index scan
        </button>
        <button className="demo-button" onClick={reset} disabled={mode === "none"}>
          Reset
        </button>
      </div>

      {mode === "none" && (
        <div className="demo-output">
          Choose a scan type to step through the search. The query is{" "}
          <code>SELECT * FROM users WHERE id = {TARGET_ID}</code>.
        </div>
      )}

      {mode === "seq" && (
        <div className="iv-seq-panel">
          <div className="comparison-label">
            Heap — rows in insertion order ({step + 1} read so far)
          </div>
          <div className="iv-row-grid">
            {ROWS.map((row, i) => {
              const isRead = i <= step;
              const isTarget = row.id === TARGET_ID;
              const isCurrentlyChecking = i === step && !done;
              return (
                <div
                  key={row.id}
                  className={`iv-row ${isRead ? "is-read" : ""} ${isTarget && isRead ? "is-found" : ""} ${isCurrentlyChecking ? "is-checking" : ""}`}
                >
                  <span className="iv-row-id">id={row.id}</span>
                  <span className="iv-row-name">{row.name}</span>
                </div>
              );
            })}
          </div>
          <div className="demo-controls">
            <button
              className="demo-button primary"
              onClick={next}
              disabled={done || (step >= 0 && ROWS[step]?.id === TARGET_ID)}
            >
              {ROWS[step]?.id === TARGET_ID || done ? "Found" : "Read next row"}
            </button>
            <span className="demo-step-count">
              {done || ROWS[step]?.id === TARGET_ID
                ? `Read ${seqReadsNeeded} row${seqReadsNeeded === 1 ? "" : "s"} to find id=${TARGET_ID}`
                : step < 0
                  ? "Click to start"
                  : `Row ${step + 1} of ${ROWS.length}`}
            </span>
          </div>
          {(done || ROWS[step]?.id === TARGET_ID) && (
            <div className="demo-output">
              <strong>Result:</strong> checked {seqReadsNeeded} rows to find 1 match. On a table
              with 1 million rows where the target is at position 900,000, that&apos;s 900,000 row
              reads.
            </div>
          )}
        </div>
      )}

      {mode === "index" && (
        <div className="iv-btree-panel">
          <div className="comparison-label">B-tree index on id</div>
          <div className="iv-tree">
            {BTREE_PATH.map((node, i) => {
              const isVisited = i <= step;
              const isCurrent = i === step;
              return (
                <div
                  key={i}
                  className={`iv-tree-node iv-node-${node.type} ${isVisited ? "is-visited" : ""} ${isCurrent ? "is-current" : ""}`}
                >
                  <span className="iv-node-label">{node.label}</span>
                  {isVisited && <span className="iv-node-detail">{node.detail}</span>}
                </div>
              );
            })}
          </div>
          <div className="demo-controls">
            <button className="demo-button primary" onClick={next} disabled={done}>
              {done ? "Done" : step === BTREE_PATH.length - 2 ? "Fetch row" : "Next node"}
            </button>
            <span className="demo-step-count">
              {done
                ? `Traversed ${indexReadsNeeded} nodes`
                : step < 0
                  ? "Click to start"
                  : `Node ${step + 1} of ${indexReadsNeeded}`}
            </span>
          </div>
          {done && (
            <div className="demo-output">
              <strong>Result:</strong> traversed {indexReadsNeeded} nodes (root → internal → leaf →
              heap) to find id={TARGET_ID}. For a table with 1 million rows, log₁₀₀(1,000,000) ≈ 3
              nodes — still just 3 reads.
            </div>
          )}
        </div>
      )}

      {!done && mode !== "none" && (
        <div className="iv-counter-row">
          <div className="iv-counter">
            <span className="iv-counter-label">Sequential reads so far</span>
            <span
              className="iv-counter-value iv-bad"
              style={
                { "--count-val": mode === "seq" ? step + 1 : ROWS.length } as React.CSSProperties
              }
            >
              {mode === "seq" ? step + 1 : ROWS.length}
            </span>
          </div>
          <div className="iv-counter">
            <span className="iv-counter-label">Index reads so far</span>
            <span
              className="iv-counter-value iv-good"
              style={
                {
                  "--count-val": mode === "index" ? step + 1 : indexReadsNeeded,
                } as React.CSSProperties
              }
            >
              {mode === "index" ? step + 1 : indexReadsNeeded}
            </span>
          </div>
        </div>
      )}

      {done && (
        <div className="iv-summary">
          <div className={`iv-summary-stat ${mode === "seq" ? "iv-highlight" : ""}`}>
            <span>Sequential scan</span>
            <strong>{seqReadsNeeded} rows read</strong>
          </div>
          <div className="iv-summary-divider">vs</div>
          <div className={`iv-summary-stat ${mode === "index" ? "iv-highlight" : ""}`}>
            <span>Index scan</span>
            <strong>{indexReadsNeeded} nodes traversed</strong>
          </div>
        </div>
      )}
    </div>
  );
}
