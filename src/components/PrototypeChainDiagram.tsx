import { useState } from "react";

type ChainLevel = { name: string; properties: string[] };

const chain: ChainLevel[] = [
  { name: "dog", properties: ["name"] },
  { name: "Animal.prototype", properties: ["speak", "walk"] },
  { name: "Object.prototype", properties: ["hasOwnProperty", "toString"] },
  { name: "null", properties: [] },
];

const lookupProperties = ["name", "speak", "walk", "hasOwnProperty", "fly"] as const;

type LookupState = {
  property: string;
  position: number;
  found: number | null;
  done: boolean;
};

const propValues: Record<string, string> = {
  name: '"Rex"',
  speak: "ƒ speak()",
  walk: "ƒ walk()",
  hasOwnProperty: "ƒ hasOwnProperty()",
  toString: "ƒ toString()",
};

function findProperty(prop: string): number | null {
  for (let i = 0; i < chain.length; i++) {
    if (chain[i].properties.includes(prop)) return i;
  }
  return null;
}

export default function PrototypeChainDiagram() {
  const [lookup, setLookup] = useState<LookupState | null>(null);

  function runFullLookup(prop: string) {
    const foundAt = findProperty(prop);
    setLookup({
      property: prop,
      position: foundAt ?? chain.length - 1,
      found: foundAt,
      done: true,
    });
  }

  function stepForward() {
    if (!lookup || lookup.done) {
      setLookup({ property: lookup?.property ?? "name", position: 0, found: null, done: false });
      return;
    }
    const level = chain[lookup.position];
    if (level.properties.includes(lookup.property)) {
      setLookup({ ...lookup, found: lookup.position, done: true });
    } else if (lookup.position >= chain.length - 1) {
      setLookup({ ...lookup, done: true });
    } else {
      setLookup({ ...lookup, position: lookup.position + 1 });
    }
  }

  function getBoxStatus(idx: number): string {
    if (!lookup) return "idle";
    if (lookup.done && lookup.found === idx) return "found";
    if (idx < lookup.position) return "checked";
    if (idx === lookup.position && !lookup.done) return "active";
    if (idx === lookup.position && lookup.done && lookup.found === null) return "checked";
    return "idle";
  }

  function getPropStatus(levelIdx: number, prop: string): string {
    if (!lookup) return "idle";
    if (lookup.done && lookup.found === levelIdx && lookup.property === prop) return "found";
    if (levelIdx < lookup.position) return "dimmed";
    if (levelIdx === lookup.position && lookup.done && lookup.found === null) return "dimmed";
    return "idle";
  }

  function statusMessage(): string {
    if (!lookup) return "Click a property to look it up on the prototype chain.";
    if (!lookup.done) {
      return `Looking for "${lookup.property}" — checking ${chain[lookup.position].name}…`;
    }
    if (lookup.found !== null) {
      return `Found "${lookup.property}" on ${chain[lookup.found].name}`;
    }
    return `undefined — "${lookup.property}" not found on any prototype`;
  }

  const borderColor = (s: string) =>
    s === "found" ? "var(--green)" : s === "active" ? "var(--accent)" : "var(--border)";

  const bgColor = (s: string) =>
    s === "found"
      ? "color-mix(in srgb, var(--green) 10%, transparent)"
      : s === "active"
        ? "color-mix(in srgb, var(--accent) 8%, transparent)"
        : "var(--surface)";

  return (
    <div className="interactive-demo">
      <span className="demo-kicker">Interactive</span>
      <h3>Try it: Prototype Chain Lookup</h3>
      <p className="demo-description">
        When you access a property on an object, JavaScript walks up the prototype chain until it
        finds it — or hits <code>null</code>.
      </p>

      <div className="demo-controls">
        {lookupProperties.map((prop) => (
          <button
            key={prop}
            className={`demo-button${lookup?.property === prop && lookup.done ? " primary" : ""}`}
            onClick={() => runFullLookup(prop)}
          >
            .{prop}
          </button>
        ))}
      </div>

      <div className="demo-controls">
        <button className="demo-button primary" onClick={stepForward}>
          {lookup && !lookup.done ? "Step →" : "Step-through"}
        </button>
        <button className="demo-button" onClick={() => setLookup(null)}>
          Reset
        </button>
        {lookup && (
          <span className="demo-step-count">
            Level {lookup.position + 1}/{chain.length}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {chain.map((level, idx) => {
          const status = getBoxStatus(idx);
          const isNull = level.name === "null";
          return (
            <div
              key={level.name}
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              {idx > 0 && (
                <div
                  style={{
                    fontSize: "1.25rem",
                    lineHeight: 1,
                    color: "var(--text-muted)",
                    padding: "0.25rem 0",
                  }}
                >
                  ↓ __proto__
                </div>
              )}
              <div
                style={{
                  border: `2px solid ${borderColor(status)}`,
                  borderRadius: "0.5rem",
                  padding: isNull ? "0.5rem 1.5rem" : "0.75rem 1.25rem",
                  minWidth: "14rem",
                  background: bgColor(status),
                  opacity: status === "checked" ? 0.5 : 1,
                  transition: "all 0.2s ease",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: isNull ? 0 : "0.375rem" }}>
                  {level.name}
                </div>
                {level.properties.map((prop) => {
                  const ps = getPropStatus(idx, prop);
                  return (
                    <div
                      key={prop}
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.85rem",
                        opacity: ps === "dimmed" ? 0.35 : 1,
                        color: ps === "found" ? "var(--green)" : "inherit",
                        fontWeight: ps === "found" ? 600 : 400,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {prop}: {propValues[prop]}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="demo-output">{statusMessage()}</div>
    </div>
  );
}
