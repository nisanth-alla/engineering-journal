import { useState } from "react";

type Example = {
  label: string;
  inputType: string;
  code: string;
  steps: { guard: string; narrowedType: string; explanation: string }[];
};

const examples: Example[] = [
  {
    label: "typeof guard",
    inputType: "string | number",
    code: `function format(value: string | number) {
  if (typeof value === "string") {
    // value is string here
    return value.toUpperCase();
  }
  // value is number here
  return value.toFixed(2);
}`,
    steps: [
      {
        guard: 'typeof value === "string"',
        narrowedType: "string",
        explanation:
          "typeof checks the runtime type. Inside the if-block, TypeScript knows value can only be string because number was ruled out.",
      },
      {
        guard: "else branch",
        narrowedType: "number",
        explanation:
          "After the string check, only number remains. TypeScript tracks what's been eliminated.",
      },
    ],
  },
  {
    label: "Discriminated union",
    inputType: '{ type: "success"; data: User } | { type: "error"; message: string }',
    code: `type Result =
  | { type: "success"; data: User }
  | { type: "error"; message: string };

function handle(result: Result) {
  if (result.type === "success") {
    // result.data is available
    console.log(result.data.name);
  } else {
    // result.message is available
    console.log(result.message);
  }
}`,
    steps: [
      {
        guard: 'result.type === "success"',
        narrowedType: "{ type: 'success'; data: User }",
        explanation:
          "The 'type' field is the discriminant. Checking it tells TypeScript which variant of the union you have, unlocking the fields specific to that variant.",
      },
      {
        guard: "else branch",
        narrowedType: "{ type: 'error'; message: string }",
        explanation:
          "Only the error variant remains. result.data would be a type error here because the error variant doesn't have it.",
      },
    ],
  },
  {
    label: "in operator",
    inputType: "Fish | Bird",
    code: `type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim();
  } else {
    animal.fly();
  }
}`,
    steps: [
      {
        guard: '"swim" in animal',
        narrowedType: "Fish",
        explanation:
          "The 'in' operator checks if a property exists on the object. If 'swim' exists, it must be a Fish because Bird doesn't have that property.",
      },
      {
        guard: "else branch",
        narrowedType: "Bird",
        explanation:
          "If 'swim' is not present, the only remaining type is Bird. TypeScript infers this automatically.",
      },
    ],
  },
  {
    label: "Truthiness narrowing",
    inputType: "string | null | undefined",
    code: `function greet(name: string | null | undefined) {
  if (name) {
    // name is string here
    console.log("Hello, " + name);
  } else {
    // name is "" | null | undefined
    console.log("Hello, stranger");
  }
}`,
    steps: [
      {
        guard: "if (name)",
        narrowedType: "string",
        explanation:
          "Truthiness check eliminates null, undefined, and empty string. What remains is a non-empty string. Be careful: this also eliminates 0 and '' which might be valid values for other types.",
      },
      {
        guard: "else branch",
        narrowedType: 'string ("") | null | undefined',
        explanation:
          "The falsy values end up here. Notice that empty string is included, which can be surprising if you only wanted to check for null/undefined.",
      },
    ],
  },
];

export default function TypeNarrowing() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const example = examples[selectedExample];

  return (
    <div className="interactive-demo">
      <h3>Try it: Type Narrowing</h3>
      <p className="demo-description">
        Pick a narrowing pattern, then click each guard to see how the type changes.
      </p>

      <div className="demo-controls">
        {examples.map((ex, i) => (
          <button
            key={i}
            className={`demo-button ${i === selectedExample ? "primary" : ""}`}
            onClick={() => {
              setSelectedExample(i);
              setActiveStep(null);
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="demo-section">
        <div className="comparison-label">Input type</div>
        <div className="demo-output">
          <code>{example.inputType}</code>
        </div>
      </div>

      <div className="demo-section">
        <div className="comparison-label">Code</div>
        <pre>
          <code>{example.code}</code>
        </pre>
      </div>

      <div className="demo-section">
        <div className="comparison-label">Click a guard to see narrowing</div>
        <div className="demo-stack">
          {example.steps.map((step, i) => (
            <div key={i} className="demo-stack-item">
              <button
                className={`demo-button demo-full-width ${activeStep === i ? "primary" : ""}`}
                onClick={() => setActiveStep(activeStep === i ? null : i)}
              >
                Guard: <code>{step.guard}</code>
              </button>
              {activeStep === i && (
                <div className="demo-output">
                  <div>
                    <strong>Narrowed type:</strong>{" "}
                    <code className="demo-inline-code">{step.narrowedType}</code>
                  </div>
                  <div className="demo-insight">{step.explanation}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
