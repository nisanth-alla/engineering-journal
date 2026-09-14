import { useState } from "react";

type Layer = {
  name: string;
  location: "Client" | "Server" | "Server / CDN";
  caches: string;
  defaultBehavior: string;
  invalidate: string;
  gotcha: string;
};

const layers: Layer[] = [
  {
    name: "Router Cache",
    location: "Client",
    caches: "Previously visited route segments in the browser.",
    defaultBehavior: "30s for dynamic routes, 5min for static.",
    invalidate: "router.refresh(), navigating away, or time expiry.",
    gotcha:
      "You updated the DB and called revalidatePath but the page still shows old data in the browser — the router cache hasn't expired yet.",
  },
  {
    name: "Full Route Cache",
    location: "Server / CDN",
    caches: "Complete rendered HTML + RSC payload of static routes.",
    defaultBehavior: "Cached at build time for static routes, not cached for dynamic.",
    invalidate: "revalidatePath(), revalidateTag(), or redeploy.",
    gotcha:
      "Your page is static (no dynamic functions) so Next.js caches the entire HTML even if you didn't intend it.",
  },
  {
    name: "Data Cache",
    location: "Server",
    caches: "Individual fetch() responses.",
    defaultBehavior: "Cached indefinitely (fetch is cached by default in Next.js).",
    invalidate: '{ cache: "no-store" }, { next: { revalidate: N } }, revalidateTag().',
    gotcha: "You assumed fetch() would always get fresh data but Next.js cached it silently.",
  },
  {
    name: "Request Memoization",
    location: "Server",
    caches: "Duplicate fetch() calls within a single render pass.",
    defaultBehavior: "Automatic for same URL in same render.",
    invalidate: "Not needed — only lasts for the duration of one request.",
    gotcha:
      "Calling the same fetch in a layout and a page doesn't make two network requests.",
  },
];

export default function CacheLayerExplorer() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [traceMode, setTraceMode] = useState(false);
  const [layerEnabled, setLayerEnabled] = useState([true, true, true, true]);
  const [traceStep, setTraceStep] = useState(-1);

  function toggleLayer(index: number) {
    setLayerEnabled((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
    setTraceStep(-1);
  }

  function reset() {
    setExpanded(null);
    setTraceMode(false);
    setLayerEnabled([true, true, true, true]);
    setTraceStep(-1);
  }

  function hitLayer(): number {
    for (let i = 0; i < layers.length; i++) {
      if (layerEnabled[i]) return i;
    }
    return -1;
  }

  const servingLayer = hitLayer();
  const maxTraceStep = layers.length;

  function advanceTrace() {
    setTraceStep((prev) => Math.min(prev + 1, maxTraceStep));
  }

  function traceResult(index: number): "HIT" | "MISS" | "pending" {
    if (traceStep < index) return "pending";
    if (traceStep === index && layerEnabled[index]) return "HIT";
    if (traceStep >= index && !layerEnabled[index]) return "MISS";
    if (traceStep > index && layerEnabled[index]) return "HIT";
    return "pending";
  }

  const traceComplete = traceStep >= maxTraceStep || (servingLayer >= 0 && traceStep > servingLayer);

  return (
    <div className="interactive-demo">
      <div className="demo-kicker">Under the hood · Next.js</div>
      <h3>Cache Layer Explorer</h3>
      <p className="demo-description">
        {traceMode
          ? "Toggle layers on/off, then trace a request through the stack to see where it gets served."
          : "Click a layer to see what it caches, how to invalidate it, and the common gotcha."}
      </p>

      <div className="demo-controls">
        <button
          className={`demo-button ${traceMode ? "primary" : ""}`}
          onClick={() => {
            setTraceMode(!traceMode);
            setExpanded(null);
            setTraceStep(-1);
          }}
        >
          {traceMode ? "Exit trace mode" : "Trace a request"}
        </button>
        {traceMode && (
          <button
            className="demo-button primary"
            onClick={advanceTrace}
            disabled={traceComplete}
          >
            {traceStep < 0 ? "Start trace" : "Next layer"}
          </button>
        )}
        <button className="demo-button" onClick={reset}>
          Reset
        </button>
        {traceMode && (
          <span className="demo-step-count">
            {traceStep < 0
              ? "Ready"
              : traceComplete
                ? "Trace complete"
                : `Layer ${Math.min(traceStep + 1, layers.length)} of ${layers.length}`}
          </span>
        )}
      </div>

      <div className="demo-phase-list">
        {layers.map((layer, i) => {
          const isExpanded = expanded === i;
          const result = traceMode ? traceResult(i) : null;
          const isHit = result === "HIT";
          const isMiss = result === "MISS";
          const isPending = result === "pending";

          return (
            <div key={layer.name}>
              <button
                className={`demo-phase-button ${isExpanded ? "is-active" : ""} ${isHit ? "is-highlighted" : ""}`}
                onClick={() => {
                  if (traceMode) {
                    toggleLayer(i);
                  } else {
                    setExpanded(isExpanded ? null : i);
                  }
                }}
                style={{ opacity: traceMode && isPending ? 0.5 : 1 }}
              >
                <span className="demo-phase-name">
                  {traceMode && (
                    <span style={{ marginRight: "0.5em" }}>
                      {layerEnabled[i] ? "\u25C9" : "\u25CB"}
                    </span>
                  )}
                  {layer.name}
                </span>
                <span className="demo-phase-what">
                  {traceMode && !isPending && (
                    <strong style={{ marginRight: "0.5em" }}>
                      {isHit ? "\u2705 HIT" : "\u274C MISS"}
                    </strong>
                  )}
                  {layer.location}
                </span>
              </button>

              {!traceMode && isExpanded && (
                <div className="demo-output">
                  <div className="demo-detail-meta">
                    <strong>Caches:</strong> {layer.caches}
                  </div>
                  <div className="demo-detail-meta">
                    <strong>Where:</strong> {layer.location}
                  </div>
                  <div className="demo-detail-meta">
                    <strong>Default:</strong> {layer.defaultBehavior}
                  </div>
                  <div className="demo-detail-meta">
                    <strong>Invalidate:</strong> <code>{layer.invalidate}</code>
                  </div>
                  <div className="demo-detail-copy">
                    <strong>Gotcha:</strong> {layer.gotcha}
                  </div>
                </div>
              )}

              {i < layers.length - 1 && traceMode && (
                <div
                  className="demo-phase-loop"
                  style={{ opacity: traceStep > i ? 1 : 0.3 }}
                >
                  {traceStep > i && layerEnabled[i] ? "\u2190 served here" : "\u2193 pass through"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {traceMode && traceComplete && (
        <div className="demo-output demo-takeaway">
          <strong>Result: </strong>
          {servingLayer >= 0 ? (
            <>
              Served by <strong>{layers[servingLayer].name}</strong> ({layers[servingLayer].location}
              ).
              {servingLayer === 0 &&
                " Data may be up to 30s stale (dynamic) or 5min (static)."}
              {servingLayer === 1 && " Serving build-time HTML — redeploy or revalidate to refresh."}
              {servingLayer === 2 && " Fetch response from cache — may be stale indefinitely."}
              {servingLayer === 3 &&
                " Deduplicated within this render — always fresh for this request."}
            </>
          ) : (
            "All caches disabled — the request hits the origin for every fetch. Freshest data, highest latency."
          )}
        </div>
      )}

      <div className="demo-note">
        <strong>Mental model:</strong> A request flows top-to-bottom. The first enabled cache layer
        with a match serves the response. Layers below never run.
      </div>
    </div>
  );
}
