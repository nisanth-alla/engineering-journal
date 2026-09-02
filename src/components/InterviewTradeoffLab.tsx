import { useState } from "react";

type Choice = { label: string; value: string; explanation: string; tradeoff: string };
const choices: Choice[] = [
  {
    label: "State ownership",
    value: "Keep it local",
    explanation:
      "The search query belongs to the search surface, so local state keeps unrelated components from re-rendering.",
    tradeoff: "Simple now; share it only if another feature truly needs it.",
  },
  {
    label: "State ownership",
    value: "Put it in a global store",
    explanation:
      "A global store can coordinate distant consumers, but it adds a subscription and invalidation problem for a value used in one feature.",
    tradeoff: "Useful for cross-route state; unnecessary for isolated UI state.",
  },
  {
    label: "Data freshness",
    value: "Cache with revalidation",
    explanation:
      "A product catalogue can tolerate a short stale window. A cache reduces latency while revalidation keeps it moving toward fresh data.",
    tradeoff: "Faster and cheaper; readers may briefly see an older result.",
  },
  {
    label: "Data freshness",
    value: "Fetch on every request",
    explanation:
      "Freshness wins when the answer changes every second or is personalized, but every request pays the network and database cost.",
    tradeoff: "Most current; higher latency and infrastructure load.",
  },
];

export default function InterviewTradeoffLab() {
  const [selected, setSelected] = useState(0);
  const choice = choices[selected];
  const related = choices.filter((item) => item.label === choice.label);
  return (
    <div className="interactive-demo demo-tradeoff-lab">
      <div className="demo-kicker">Practice the reasoning · system design</div>
      <h3>Turn a preference into a tradeoff</h3>
      <p>
        Strong interview answers do not start with a tool name. Choose a constraint, then explain
        why the decision fits it and what it costs.
      </p>
      <div className="demo-scenario">
        <span>Scenario</span>
        <strong>Design a product search page for a busy marketplace.</strong>
      </div>
      <div className="demo-choice-group" role="group" aria-label={choice.label}>
        {related.map((item) => {
          const index = choices.indexOf(item);
          return (
            <button
              key={item.value}
              className={`demo-choice ${index === selected ? "is-selected" : ""}`}
              onClick={() => setSelected(index)}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </button>
          );
        })}
      </div>
      <div className="demo-tradeoff-grid">
        <div>
          <span className="demo-column-label">Say this</span>
          <p>{choice.explanation}</p>
        </div>
        <div>
          <span className="demo-column-label">Name the cost</span>
          <p>{choice.tradeoff}</p>
        </div>
      </div>
      <div className="demo-controls demo-tradeoff-controls">
        <button className="demo-button" onClick={() => setSelected(selected < 2 ? 2 : 0)}>
          Change constraint
        </button>
        <span className="demo-step-count">The best answer is conditional, not absolute.</span>
      </div>
    </div>
  );
}
