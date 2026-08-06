import { useState } from "react";

type Scenario = {
  label: string;
  description: string;
  genericCode: string;
  usageLines: { call: string; inferred: string; explanation: string }[];
};

const scenarios: Scenario[] = [
  {
    label: "Identity",
    description: "The simplest generic: returns whatever you pass in, preserving the type.",
    genericCode: `function identity<T>(value: T): T {
  return value;
}`,
    usageLines: [
      {
        call: 'identity("hello")',
        inferred: "T = string",
        explanation:
          'You passed a string literal, so TypeScript infers T as string. The return type is string, not "any" or "unknown".',
      },
      {
        call: "identity(42)",
        inferred: "T = number",
        explanation: "Same function, different type. T becomes number. No overloads needed.",
      },
      {
        call: "identity({ name: 'Alice', age: 30 })",
        inferred: "T = { name: string; age: number }",
        explanation:
          "T infers the full object shape. The return value has the same type, so you get autocomplete on .name and .age.",
      },
    ],
  },
  {
    label: "Constrained",
    description: "T extends a shape, so you can access properties on it safely.",
    genericCode: `function getLength<T extends { length: number }>(
  item: T
): number {
  return item.length;
}`,
    usageLines: [
      {
        call: 'getLength("hello")',
        inferred: "T = string (has .length)",
        explanation: "Strings have a length property, so they satisfy the constraint. Works.",
      },
      {
        call: "getLength([1, 2, 3])",
        inferred: "T = number[] (has .length)",
        explanation:
          "Arrays have length too. The constraint doesn't care about the specific type, just that .length exists.",
      },
      {
        call: "getLength(42)",
        inferred: "ERROR: number has no .length",
        explanation:
          "Numbers don't have a length property. TypeScript catches this at compile time. The constraint protects you from calling the function with something that would fail at runtime.",
      },
    ],
  },
  {
    label: "keyof",
    description: "K is constrained to actual keys of T, preventing typos at compile time.",
    genericCode: `function pick<T, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}`,
    usageLines: [
      {
        call: 'pick({ name: "Alice", age: 30 }, "name")',
        inferred: "T = { name: string; age: number }, K = 'name', returns string",
        explanation:
          '"name" is a valid key of the object. The return type is T[K] = string. TypeScript knows the result is a string, not string | number.',
      },
      {
        call: 'pick({ name: "Alice", age: 30 }, "age")',
        inferred: "K = 'age', returns number",
        explanation:
          "Same object, different key. The return type narrows to number because T['age'] is number.",
      },
      {
        call: 'pick({ name: "Alice", age: 30 }, "email")',
        inferred: 'ERROR: "email" is not in keyof T',
        explanation:
          "The object has no 'email' key. keyof T is 'name' | 'age', and 'email' isn't in that union. Caught at compile time, not runtime.",
      },
    ],
  },
  {
    label: "Mapped return",
    description: "The return type depends on the input in a way that generics preserve.",
    genericCode: `function wrapInArray<T>(value: T): T[] {
  return [value];
}`,
    usageLines: [
      {
        call: "wrapInArray(42)",
        inferred: "T = number, returns number[]",
        explanation:
          "The return type is T[], so with T = number you get number[]. Without generics, you'd get (string | number | ...)[] or unknown[].",
      },
      {
        call: 'wrapInArray("hello")',
        inferred: "T = string, returns string[]",
        explanation:
          "Same function, returns string[]. The generic preserves the relationship between input and output types.",
      },
      {
        call: "wrapInArray({ id: 1 })",
        inferred: "T = { id: number }, returns { id: number }[]",
        explanation:
          "Works with objects too. The returned array is typed as { id: number }[], so you get autocomplete on array[0].id.",
      },
    ],
  },
];

export default function GenericPlayground() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [expandedCall, setExpandedCall] = useState<number | null>(null);
  const scenario = scenarios[selectedScenario];

  return (
    <div className="interactive-demo">
      <h4>Try it: Generic Type Inference</h4>
      <p className="demo-description">
        Pick a generic pattern, then click each function call to see what TypeScript infers for the
        type parameters.
      </p>

      <div className="demo-controls">
        {scenarios.map((s, i) => (
          <button
            key={i}
            className={`demo-button ${i === selectedScenario ? "primary" : ""}`}
            onClick={() => {
              setSelectedScenario(i);
              setExpandedCall(null);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="demo-description">{scenario.description}</div>

      <div className="demo-section">
        <div className="comparison-label">Generic function</div>
        <pre>
          <code>{scenario.genericCode}</code>
        </pre>
      </div>

      <div className="demo-section">
        <div className="comparison-label">Click a call to see inference</div>
        <div className="demo-stack">
          {scenario.usageLines.map((usage, i) => {
            const isError = usage.inferred.startsWith("ERROR");
            return (
              <div key={i} className="demo-stack-item">
                <button
                  className={`demo-button demo-full-width ${expandedCall === i ? "primary" : ""}`}
                  onClick={() => setExpandedCall(expandedCall === i ? null : i)}
                >
                  <code>{usage.call}</code>
                </button>
                {expandedCall === i && (
                  <div className="demo-output">
                    <div>
                      <strong>Inferred:</strong>{" "}
                      <code className={isError ? "demo-error-code" : "demo-inline-code"}>
                        {usage.inferred}
                      </code>
                    </div>
                    <div className="demo-insight">{usage.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
