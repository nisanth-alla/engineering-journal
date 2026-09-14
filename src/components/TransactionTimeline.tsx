import { useState } from "react";

type IsolationLevel = "read-committed" | "repeatable-read" | "serializable";
type AnomalyType = "dirty-read" | "non-repeatable-read" | "phantom-read";

type Step = {
  txA: string;
  txB: string;
  explanation: string;
  isAnomaly: boolean;
};

type AnomalyDef = {
  label: string;
  steps: Step[];
  allowedResult: string;
  preventedResult: string;
  /** Minimum isolation level that prevents this anomaly */
  preventedAt: IsolationLevel;
};

const ANOMALIES: Record<AnomalyType, AnomalyDef> = {
  "dirty-read": {
    label: "Dirty read",
    steps: [
      { txA: "BEGIN", txB: "—", explanation: "Transaction A starts.", isAnomaly: false },
      { txA: "—", txB: "BEGIN", explanation: "Transaction B starts.", isAnomaly: false },
      {
        txA: "—",
        txB: "UPDATE orders SET status='cancelled' WHERE id=42",
        explanation: "B writes a new status but has NOT committed yet.",
        isAnomaly: false,
      },
      {
        txA: "SELECT status FROM orders WHERE id=42",
        txB: "—",
        explanation: "A reads the same row B just modified.",
        isAnomaly: true,
      },
      { txA: "—", txB: "ROLLBACK", explanation: "B rolls back — the write never happened.", isAnomaly: false },
      {
        txA: "— (acted on 'cancelled' which never existed)",
        txB: "—",
        explanation: "A made a decision based on data that was never committed.",
        isAnomaly: false,
      },
    ],
    allowedResult: "→ sees 'cancelled' (DIRTY READ)",
    preventedResult: "→ sees 'active' (PREVENTED)",
    preventedAt: "read-committed",
  },
  "non-repeatable-read": {
    label: "Non-repeatable read",
    steps: [
      {
        txA: "SELECT price FROM products WHERE id=7  → 100",
        txB: "—",
        explanation: "A reads the price: 100.",
        isAnomaly: false,
      },
      {
        txA: "—",
        txB: "UPDATE products SET price=150 WHERE id=7; COMMIT",
        explanation: "B updates the price to 150 and commits.",
        isAnomaly: false,
      },
      {
        txA: "SELECT price FROM products WHERE id=7",
        txB: "—",
        explanation: "A reads the same row a second time.",
        isAnomaly: true,
      },
    ],
    allowedResult: "→ sees 150 (NON-REPEATABLE READ)",
    preventedResult: "→ still sees 100 (PREVENTED)",
    preventedAt: "repeatable-read",
  },
  "phantom-read": {
    label: "Phantom read",
    steps: [
      {
        txA: "SELECT count(*) FROM orders WHERE status='pending'  → 5",
        txB: "—",
        explanation: "A counts pending orders: 5.",
        isAnomaly: false,
      },
      {
        txA: "—",
        txB: "INSERT INTO orders (status) VALUES ('pending'); COMMIT",
        explanation: "B inserts a new pending order and commits.",
        isAnomaly: false,
      },
      {
        txA: "SELECT count(*) FROM orders WHERE status='pending'",
        txB: "—",
        explanation: "A re-runs the same range query.",
        isAnomaly: true,
      },
    ],
    allowedResult: "→ sees 6 (PHANTOM READ)",
    preventedResult: "→ still sees 5 (PREVENTED)",
    preventedAt: "serializable",
  },
};

const ISOLATION_LEVELS: { value: IsolationLevel; label: string }[] = [
  { value: "read-committed", label: "Read Committed" },
  { value: "repeatable-read", label: "Repeatable Read" },
  { value: "serializable", label: "Serializable" },
];

const TABS: { value: AnomalyType; label: string }[] = [
  { value: "dirty-read", label: "Dirty read" },
  { value: "non-repeatable-read", label: "Non-repeatable read" },
  { value: "phantom-read", label: "Phantom read" },
];

const LEVEL_RANK: Record<IsolationLevel, number> = {
  "read-committed": 1,
  "repeatable-read": 2,
  "serializable": 3,
};

function isPrevented(anomaly: AnomalyDef, level: IsolationLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[anomaly.preventedAt];
}

export default function TransactionTimeline() {
  const [activeTab, setActiveTab] = useState<AnomalyType>("dirty-read");
  const [isolation, setIsolation] = useState<IsolationLevel>("read-committed");
  const [step, setStep] = useState(-1);

  const anomaly = ANOMALIES[activeTab];
  const prevented = isPrevented(anomaly, isolation);
  const totalSteps = anomaly.steps.length;

  function selectTab(tab: AnomalyType) {
    setActiveTab(tab);
    setStep(-1);
  }

  function advance() {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  }

  function reset() {
    setStep(-1);
  }

  function cellText(raw: string, s: Step, isTxA: boolean): string {
    if (!s.isAnomaly) return raw;
    if (!isTxA && raw === "—") return raw;
    if (isTxA) return raw + " " + (prevented ? anomaly.preventedResult : anomaly.allowedResult);
    return raw;
  }

  return (
    <div className="interactive-demo">
      <div className="demo-kicker">Under the hood · Databases</div>
      <h3>Transaction isolation anomalies</h3>
      <p className="demo-description">
        Two transactions run concurrently. Step through to see how interleaved
        operations cause anomalies — and which isolation levels prevent them.
      </p>

      <div className="demo-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`demo-tab ${activeTab === tab.value ? "is-active" : ""}`}
            onClick={() => selectTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="demo-controls">
        {ISOLATION_LEVELS.map((lvl) => (
          <button
            key={lvl.value}
            className={`demo-button ${isolation === lvl.value ? "primary" : ""}`}
            onClick={() => { setIsolation(lvl.value); setStep(-1); }}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      <div className="demo-controls">
        <button
          className="demo-button primary"
          onClick={advance}
          disabled={step >= totalSteps - 1}
        >
          {step < 0 ? "Start" : step >= totalSteps - 1 ? "Done" : "Step"}
        </button>
        <button className="demo-button" onClick={reset} disabled={step < 0}>
          Reset
        </button>
        <span className="demo-step-count">
          {step < 0
            ? `${totalSteps} steps`
            : `Step ${step + 1} of ${totalSteps}`}
        </span>
      </div>

      <div className="demo-grid">
        <div>
          <div className="comparison-label">Transaction A</div>
          <div className="tt-swimlane">
            {anomaly.steps.map((s, i) => {
              const visible = i <= step;
              const isCurrent = i === step;
              const isAnomalyStep = s.isAnomaly && visible;
              const anomalyAllowed = isAnomalyStep && !prevented;
              const anomalyBlocked = isAnomalyStep && prevented;
              return (
                <div
                  key={i}
                  className={`tt-cell${visible ? " tt-visible" : ""}${isCurrent ? " tt-current" : ""}${anomalyAllowed ? " tt-anomaly" : ""}${anomalyBlocked ? " tt-prevented" : ""}`}
                >
                  <span className="tt-step-num">{i + 1}</span>
                  <span className="tt-sql">
                    {visible ? cellText(s.txA, s, true) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="comparison-label">Transaction B</div>
          <div className="tt-swimlane">
            {anomaly.steps.map((s, i) => {
              const visible = i <= step;
              const isCurrent = i === step;
              return (
                <div
                  key={i}
                  className={`tt-cell${visible ? " tt-visible" : ""}${isCurrent ? " tt-current" : ""}`}
                >
                  <span className="tt-step-num">{i + 1}</span>
                  <span className="tt-sql">
                    {visible ? cellText(s.txB, s, false) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {step >= 0 && (
        <div className="demo-output">
          <strong>Step {step + 1}:</strong>{" "}
          {anomaly.steps[step].explanation}
          {anomaly.steps[step].isAnomaly && (
            <div
              className="tt-verdict"
              style={{ color: prevented ? "#22a06b" : "#ef4444" }}
            >
              {prevented
                ? `✓ ${anomaly.label} prevented by ${ISOLATION_LEVELS.find((l) => l.value === isolation)?.label}.`
                : `✗ ${anomaly.label} occurs — ${isolation === "read-committed" ? "Read Committed" : "this isolation level"} does not prevent it.`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
