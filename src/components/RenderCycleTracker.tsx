import { useState, useRef } from "react";

/**
 * RenderCycleTracker: a small component tree where you toggle state
 * at different levels and watch which components re-render.
 *
 * Each component shows a render counter. When you click a button,
 * the counter increments on every component that re-rendered.
 * This makes the "parent re-renders cause child re-renders" rule visible.
 */
export default function RenderCycleTracker() {
  const [parentCount, setParentCount] = useState(0);
  const parentRenders = useRef(0);
  parentRenders.current++;

  return (
    <div className="interactive-demo">
      <h4>Try it: What re-renders when?</h4>
      <p className="demo-description">
        Click buttons at different levels. Watch which render counters go up. Every component that
        re-renders flashes briefly.
      </p>

      <TrackedBox name="App (parent)" renders={parentRenders.current}>
        <div className="demo-controls">
          <button className="demo-button primary" onClick={() => setParentCount((c) => c + 1)}>
            Update parent state ({parentCount})
          </button>
        </div>

        <div className="demo-grid">
          <ChildA />
          <ChildB parentCount={parentCount} />
        </div>
      </TrackedBox>
    </div>
  );
}

function ChildA() {
  const [localCount, setLocalCount] = useState(0);
  const renders = useRef(0);
  renders.current++;

  return (
    <TrackedBox name="ChildA (own state)" renders={renders.current}>
      <button className="demo-button" onClick={() => setLocalCount((c) => c + 1)}>
        Local state ({localCount})
      </button>
      <GrandchildA />
    </TrackedBox>
  );
}

function ChildB({ parentCount }: { parentCount: number }) {
  const renders = useRef(0);
  renders.current++;

  return (
    <TrackedBox name="ChildB (receives prop)" renders={renders.current}>
      <div className="demo-child-value">parentCount: {parentCount}</div>
      <GrandchildB />
    </TrackedBox>
  );
}

function GrandchildA() {
  const renders = useRef(0);
  renders.current++;

  return (
    <TrackedBox name="GrandchildA" renders={renders.current} small>
      <span className="demo-tree-copy-muted">No props, no state</span>
    </TrackedBox>
  );
}

function GrandchildB() {
  const renders = useRef(0);
  renders.current++;

  return (
    <TrackedBox name="GrandchildB" renders={renders.current} small>
      <span className="demo-tree-copy-muted">No props, no state</span>
    </TrackedBox>
  );
}

function TrackedBox({
  name,
  renders,
  children,
  small,
}: {
  name: string;
  renders: number;
  children: React.ReactNode;
  small?: boolean;
}) {
  // Flash on render by keying the animation
  const flashKey = useRef(0);
  flashKey.current = renders;

  return (
    <div
      key={`flash-${flashKey.current}`}
      className="demo-component highlight demo-tree-box"
      style={
        {
          "--tree-padding": small ? "0.5rem" : "0.75rem",
          "--tree-margin-top": small ? "0.5rem" : "0",
          "--tree-title-size": small ? "0.75rem" : "0.85rem",
        } as React.CSSProperties
      }
    >
      <div className="demo-tree-header">
        <strong>{name}</strong>
        <span className="render-count">
          renders: <span className="count">{renders}</span>
        </span>
      </div>
      {children}
    </div>
  );
}
