import { useState } from "react";

type Mode = {
  label: string;
  eyebrow: string;
  description: string;
  steps: { label: string; detail: string; tone: "server" | "network" | "browser" | "boundary" }[];
  takeaway: string;
};

const modes: Mode[] = [
  {
    label: "Server Component",
    eyebrow: "Default in the App Router",
    description:
      "A server component can fetch private data, render HTML, and send no component JavaScript to the browser.",
    steps: [
      { label: "Request", detail: "The browser asks for /dashboard.", tone: "network" },
      {
        label: "Server runs page",
        detail: "The component awaits the database query on the server.",
        tone: "server",
      },
      {
        label: "HTML + RSC payload",
        detail: "The browser receives visible HTML plus React's instructions for the tree.",
        tone: "boundary",
      },
      {
        label: "Interactive islands hydrate",
        detail: "Only nested client components download JavaScript and attach events.",
        tone: "browser",
      },
    ],
    takeaway:
      "Keep data access on the server. Push the client boundary down to the smallest interactive island.",
  },
  {
    label: "Client Component",
    eyebrow: 'Opt in with "use client"',
    description:
      "A client component is the right place for state, event handlers, and browser APIs, but its module graph crosses the network.",
    steps: [
      { label: "Request", detail: "The browser asks for the route shell.", tone: "network" },
      {
        label: "Server renders shell",
        detail: "Next.js still produces initial HTML so the page is not blank.",
        tone: "server",
      },
      {
        label: "JavaScript downloads",
        detail: "The client component and its dependencies arrive in the browser bundle.",
        tone: "boundary",
      },
      {
        label: "Hydration",
        detail: "React matches the HTML and wires up state, events, and effects.",
        tone: "browser",
      },
    ],
    takeaway:
      "Use client components for interaction, not as a default wrapper around data fetching.",
  },
];

export default function NextRenderingBoundary() {
  const [modeIndex, setModeIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(-1);
  const mode = modes[modeIndex];

  return (
    <div className="interactive-demo demo-rendering-boundary">
      <div className="demo-kicker">Under the hood · Next.js</div>
      <h3>Trace the server/client boundary</h3>
      <p>{mode.description}</p>
      <div className="demo-tabs" role="tablist" aria-label="Rendering modes">
        {modes.map((item, index) => (
          <button
            key={item.label}
            className={`demo-tab ${index === modeIndex ? "is-active" : ""}`}
            onClick={() => {
              setModeIndex(index);
              setStepIndex(-1);
            }}
            role="tab"
            aria-selected={index === modeIndex}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="demo-boundary-map">
        <div className="demo-boundary-column">
          <span className="demo-column-label">Server</span>
          <span className="demo-boundary-node">page.tsx</span>
          <span className="demo-boundary-node demo-boundary-node-muted">database</span>
        </div>
        <div className="demo-boundary-line" aria-hidden="true" />
        <div className="demo-boundary-column">
          <span className="demo-column-label">Browser</span>
          <span className="demo-boundary-node">HTML shell</span>
          <span className="demo-boundary-node demo-boundary-node-muted">interactive island</span>
        </div>
      </div>
      <div className="demo-controls">
        <button
          className="demo-button primary"
          onClick={() => setStepIndex((value) => Math.min(value + 1, mode.steps.length - 1))}
          disabled={stepIndex >= mode.steps.length - 1}
        >
          {stepIndex < 0 ? "Start trace" : "Next step"}
        </button>
        <button className="demo-button" onClick={() => setStepIndex(-1)} disabled={stepIndex < 0}>
          Reset
        </button>
        <span className="demo-step-count">
          {stepIndex < 0 ? "Ready" : `Step ${stepIndex + 1} of ${mode.steps.length}`}
        </span>
      </div>
      <div className="demo-trace" aria-live="polite">
        {mode.steps.map((step, index) => (
          <div
            className={`demo-trace-step ${index <= stepIndex ? "is-visible" : ""} tone-${step.tone}`}
            key={step.label}
          >
            <span className="demo-trace-number">0{index + 1}</span>
            <div>
              <strong>{step.label}</strong>
              <span>{step.detail}</span>
            </div>
          </div>
        ))}
      </div>
      {stepIndex >= mode.steps.length - 1 && (
        <div className="demo-output demo-takeaway">
          <strong>Rule of thumb:</strong> {mode.takeaway}
        </div>
      )}
      <div className="demo-code-caption">
        <code>{modeIndex === 0 ? "async function Dashboard()" : '"use client"'}</code>
        <span>{mode.eyebrow}</span>
      </div>
    </div>
  );
}
