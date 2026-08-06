import { useState, useRef, memo, useCallback } from "react";

/**
 * MemoComparison: side-by-side comparison of a component with and without
 * React.memo. Shows render counts for each to demonstrate when memo
 * actually helps (and when it doesn't).
 */
export default function MemoComparison() {
  const [parentCount, setParentCount] = useState(0);
  const [childValue, setChildValue] = useState("hello");

  // Stable callback using useCallback
  const stableCallback = useCallback(() => {
    console.log("clicked");
  }, []);

  // Unstable callback: new reference every render
  const unstableCallback = () => {
    console.log("clicked");
  };

  return (
    <div className="interactive-demo">
      <h4>Try it: React.memo comparison</h4>
      <p style={{ fontSize: "0.85rem", color: "var(--sl-color-gray-2)", margin: "0 0 1rem" }}>
        Click "Update parent" and watch the render counts. The memoized child on the right skips
        re-rendering when its props haven't changed. Then try "Change child prop" to see both
        re-render.
      </p>

      <div className="demo-controls">
        <button className="demo-button primary" onClick={() => setParentCount((c) => c + 1)}>
          Update parent state ({parentCount})
        </button>
        <button
          className="demo-button"
          onClick={() => setChildValue((v) => (v === "hello" ? "world" : "hello"))}
        >
          Change child prop ("{childValue}")
        </button>
      </div>

      <div className="demo-grid">
        <div>
          <div className="comparison-label">Without memo</div>
          <RegularChild value={childValue} onClick={unstableCallback} />
        </div>
        <div>
          <div className="comparison-label">With React.memo</div>
          <MemoizedChild value={childValue} onClick={stableCallback} />
        </div>
      </div>

      <div className="demo-output" style={{ marginTop: "1rem" }}>
        <strong>What's happening:</strong>
        <br />
        {parentCount === 0
          ? "Click 'Update parent' to see the difference. The left child re-renders every time. The right child only re-renders when its props change."
          : `Parent rendered ${parentCount + 1} times. The regular child re-rendered every time. The memoized child only re-rendered when you clicked 'Change child prop' because React.memo does a shallow comparison of the previous and next props.`}
        <br />
        <br />
        <strong>Why the callback matters:</strong>
        <br />
        The left child receives an unstable onClick (new function every render), so even with memo
        it would re-render. The right child gets a useCallback-wrapped onClick (same reference), so
        memo can actually skip the re-render. This is the most common reason memo "doesn't work."
      </div>
    </div>
  );
}

// Regular child: re-renders whenever parent re-renders
function RegularChild({ value, onClick }: { value: string; onClick: () => void }) {
  const renders = useRef(0);
  renders.current++;

  return (
    <div key={`flash-${renders.current}`} className="demo-component highlight">
      <div className="render-count" style={{ marginBottom: "0.3rem" }}>
        renders: <span className="count">{renders.current}</span>
      </div>
      <div style={{ fontSize: "0.85rem" }}>value: "{value}"</div>
      <button className="demo-button" style={{ marginTop: "0.3rem" }} onClick={onClick}>
        Child button
      </button>
    </div>
  );
}

// Memoized child: only re-renders when props actually change
const MemoizedChild = memo(function MemoizedChild({
  value,
  onClick,
}: {
  value: string;
  onClick: () => void;
}) {
  const renders = useRef(0);
  renders.current++;

  return (
    <div key={`flash-${renders.current}`} className="demo-component highlight">
      <div className="render-count" style={{ marginBottom: "0.3rem" }}>
        renders: <span className="count">{renders.current}</span>
      </div>
      <div style={{ fontSize: "0.85rem" }}>value: "{value}"</div>
      <button className="demo-button" style={{ marginTop: "0.3rem" }} onClick={onClick}>
        Child button
      </button>
    </div>
  );
});
