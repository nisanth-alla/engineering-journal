import { useState } from "react";

type DemoObject = {
  name: string;
  address: { city: string };
};

type Mutation = "none" | "top-level" | "nested" | "both";

const INITIAL: DemoObject = { name: "Alice", address: { city: "NYC" } };

function getStates(mutation: Mutation) {
  const original: DemoObject = {
    name: mutation === "top-level" || mutation === "both" ? "Bob" : "Alice",
    address: { city: mutation === "nested" || mutation === "both" ? "LA" : "NYC" },
  };
  // Reference assignment — same object, always mirrors original
  const reference = original;
  // Shallow copy — own top-level props, but nested address is shared
  const shallow: DemoObject = {
    name: mutation === "top-level" || mutation === "both" ? "Alice" : "Alice",
    address: original.address, // shared reference to nested object
  };
  if (mutation === "top-level" || mutation === "both") {
    // Top-level was copied before mutation, so shallow keeps "Alice"
    shallow.name = "Alice";
  }
  // Deep copy — completely independent snapshot taken before any mutation
  const deep: DemoObject = { name: "Alice", address: { city: "NYC" } };

  return { original, reference, shallow, deep };
}

function explain(mutation: Mutation): string {
  if (mutation === "none") {
    return 'No mutations yet. All four boxes show the same initial object. Click a "Mutate" button to see how each copy strategy responds differently.';
  }
  if (mutation === "top-level") {
    return (
      'We changed original.name to "Bob". The reference variable points to the exact same object, so it sees "Bob" too. ' +
      'The shallow copy has its own top-level properties (name was copied by value), so it still shows "Alice". ' +
      "The deep copy is fully independent — no change is visible."
    );
  }
  if (mutation === "nested") {
    return (
      'We changed original.address.city to "LA". The reference mirrors it (same object). ' +
      'The shallow copy shared the address object reference — it was not cloned, just copied by reference — so it also shows "LA". This is the classic shallow copy gotcha. ' +
      'The deep copy recursively cloned everything, so its address is independent and still shows "NYC".'
    );
  }
  return (
    "Both mutations applied. Reference mirrors everything. " +
    'Shallow copy: name is still "Alice" (own copy), but city is "LA" (shared nested ref). ' +
    "Deep copy: completely untouched — both values remain original."
  );
}

function ObjectDisplay({ obj, baseline }: { obj: DemoObject; baseline: DemoObject }) {
  const nameChanged = obj.name !== baseline.name;
  const cityChanged = obj.address.city !== baseline.address.city;

  return (
    <div className="demo-component" style={{ gap: "0.3rem" }}>
      <div style={{ fontFamily: "var(--sl-font-mono)", fontSize: "0.8rem" }}>
        {"{"} <span style={{ color: "var(--ej-muted)" }}>name:</span>{" "}
        <span
          style={{
            color: nameChanged ? "#ef4444" : "#22a06b",
            fontWeight: nameChanged ? 700 : 400,
          }}
        >
          "{obj.name}"
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--sl-font-mono)",
          fontSize: "0.8rem",
          paddingLeft: "0.6rem",
        }}
      >
        <span style={{ color: "var(--ej-muted)" }}>address:</span> {"{ "}
        <span style={{ color: "var(--ej-muted)" }}>city:</span>{" "}
        <span
          style={{
            color: cityChanged ? "#ef4444" : "#22a06b",
            fontWeight: cityChanged ? 700 : 400,
          }}
        >
          "{obj.address.city}"
        </span>
        {" }"}
      </div>
      <div style={{ fontFamily: "var(--sl-font-mono)", fontSize: "0.8rem" }}>{"}"}</div>
    </div>
  );
}

export default function ReferenceVisualizer() {
  const [mutation, setMutation] = useState<Mutation>("none");
  const { original, reference, shallow, deep } = getStates(mutation);

  const mutateTopLevel = () => {
    setMutation((prev) => (prev === "nested" || prev === "both" ? "both" : "top-level"));
  };

  const mutateNested = () => {
    setMutation((prev) => (prev === "top-level" || prev === "both" ? "both" : "nested"));
  };

  const boxes: { label: string; code: string; obj: DemoObject }[] = [
    { label: "Original", code: "const original = { ... }", obj: original },
    { label: "Reference (assignment)", code: "const ref = original", obj: reference },
    { label: "Shallow Copy", code: "const shallow = { ...original }", obj: shallow },
    { label: "Deep Copy", code: "const deep = structuredClone(original)", obj: deep },
  ];

  return (
    <div className="interactive-demo">
      <span className="demo-kicker">Interactive</span>
      <h3>Reference vs. Shallow Copy vs. Deep Copy</h3>
      <p className="demo-description">
        Mutate the original object and observe which copies reflect the change. Green values are
        unchanged from the initial state; red values have been affected by a mutation.
      </p>

      <div className="demo-controls">
        <button
          className="demo-button primary"
          onClick={mutateTopLevel}
          disabled={mutation === "top-level" || mutation === "both"}
        >
          Mutate top-level property
        </button>
        <button
          className="demo-button primary"
          onClick={mutateNested}
          disabled={mutation === "nested" || mutation === "both"}
        >
          Mutate nested property
        </button>
        <button
          className="demo-button"
          onClick={() => setMutation("none")}
          disabled={mutation === "none"}
        >
          Reset
        </button>
        {mutation !== "none" && (
          <span className="demo-step-count">
            {mutation === "both" ? "2 mutations" : "1 mutation"} applied
          </span>
        )}
      </div>

      <div className="demo-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {boxes.map((box) => (
          <div key={box.label}>
            <div className="comparison-label">{box.label}</div>
            <div
              style={{
                fontFamily: "var(--sl-font-mono)",
                fontSize: "0.72rem",
                color: "var(--ej-subtle)",
                marginBottom: "0.4rem",
              }}
            >
              {box.code}
            </div>
            <ObjectDisplay obj={box.obj} baseline={INITIAL} />
          </div>
        ))}
      </div>

      <div className="demo-output">
        <strong>What happened:</strong>
        <br />
        {explain(mutation)}
      </div>
    </div>
  );
}
