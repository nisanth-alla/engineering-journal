import { useState } from "react";

type Strategy = "SSG" | "SSR" | "ISR" | "CSR";

type Recommendation = {
  strategy: Strategy;
  description: string;
  example: string;
  tradeoff: string;
  code: string;
};

type Question = {
  text: string;
  yesResult: Strategy | null;
  noResult: Strategy | null;
  yesNext: number | null;
  noNext: number | null;
};

const questions: Question[] = [
  {
    text: "Does the content change between requests?",
    yesResult: null,
    noResult: "SSG",
    yesNext: 1,
    noNext: null,
  },
  {
    text: "Is the data user-specific or personalized?",
    yesResult: "SSR",
    noResult: null,
    yesNext: null,
    noNext: 2,
  },
  {
    text: "Can the data be slightly stale (seconds to minutes)?",
    yesResult: "ISR",
    noResult: null,
    yesNext: null,
    noNext: 3,
  },
  {
    text: "Does it need real-time interactivity?",
    yesResult: "CSR",
    noResult: "SSR",
    yesNext: null,
    noNext: null,
  },
];

const recommendations: Record<Strategy, Recommendation> = {
  SSG: {
    strategy: "SSG",
    description: "Build once, serve forever from CDN. Fastest possible load time.",
    example: "Blog posts, docs, marketing pages",
    tradeoff: "Content is static until next build",
    code: `export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}`,
  },
  SSR: {
    strategy: "SSR",
    description: "Fresh HTML on every request. Always current, always personalized.",
    example: "User dashboards, search results, personalized feeds",
    tradeoff: "Slower TTFB, server must render every request",
    code: `// app/dashboard/page.tsx
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const data = await getPersonalizedData();
  return <main>{/* ... */}</main>;
}`,
  },
  ISR: {
    strategy: "ISR",
    description: "Static speed with eventual freshness. Best of both worlds for most content.",
    example: "Product pages, news articles, e-commerce catalog",
    tradeoff: "Users may see stale data for the revalidation window",
    code: `// app/products/[id]/page.tsx
export const revalidate = 60; // seconds

export default async function Product({ params }) {
  const product = await getProduct(params.id);
  return <main>{/* ... */}</main>;
}`,
  },
  CSR: {
    strategy: "CSR",
    description: "Server sends a shell, client renders everything. Full interactivity.",
    example: "Real-time dashboards, collaborative editors, complex interactive tools",
    tradeoff: "No SEO for dynamic content, slower initial paint, loading spinners",
    code: `'use client';

import { useState, useEffect } from 'react';

export default function LiveDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/live').then(r => r.json()).then(setData);
  }, []);
  return <main>{data ? /* ... */ : 'Loading...'}</main>;
}`,
  },
};

type Answer = { questionIndex: number; question: string; answer: "Yes" | "No" };

export default function RenderingStrategyPicker() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<Strategy | null>(null);

  function handleAnswer(answer: "Yes" | "No") {
    const question = questions[currentQuestion];
    const newAnswers = [
      ...answers,
      { questionIndex: currentQuestion, question: question.text, answer },
    ];
    setAnswers(newAnswers);

    const strategy = answer === "Yes" ? question.yesResult : question.noResult;
    const next = answer === "Yes" ? question.yesNext : question.noNext;

    if (strategy) {
      setResult(strategy);
    } else if (next !== null) {
      setCurrentQuestion(next);
    }
  }

  function reset() {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  }

  const rec = result ? recommendations[result] : null;

  return (
    <div className="interactive-demo">
      <div className="demo-kicker">Decision tree · Next.js rendering</div>
      <h3>Which rendering strategy fits your page?</h3>
      <p className="demo-description">
        Answer a few questions about your content and get a concrete recommendation with the Next.js
        implementation.
      </p>

      {answers.length > 0 && (
        <div className="demo-grid">
          {answers.map((a, i) => (
            <div
              key={i}
              className="demo-trace-step is-visible"
              style={{ opacity: result ? 0.5 : 0.65 }}
            >
              <span className="demo-trace-number">0{i + 1}</span>
              <div>
                <strong>{a.question}</strong>
                <span>{a.answer}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!result && (
        <>
          <div className="demo-output" aria-live="polite">
            <strong>{questions[currentQuestion].text}</strong>
          </div>
          <div className="demo-controls">
            <button className="demo-button primary" onClick={() => handleAnswer("Yes")}>
              Yes
            </button>
            <button className="demo-button" onClick={() => handleAnswer("No")}>
              No
            </button>
            <span className="demo-step-count">
              Question {answers.length + 1} of {questions.length}
            </span>
          </div>
        </>
      )}

      {rec && (
        <>
          <div className="demo-output">
            <strong>
              {rec.strategy} — {rec.description}
            </strong>
            <div className="demo-grid" style={{ marginTop: "0.75rem" }}>
              <div>
                <span className="demo-column-label">Example</span>
                <p>{rec.example}</p>
              </div>
              <div>
                <span className="demo-column-label">Tradeoff</span>
                <p>{rec.tradeoff}</p>
              </div>
            </div>
            <pre style={{ marginTop: "0.75rem", overflowX: "auto" }}>
              <code>{rec.code}</code>
            </pre>
          </div>
          <div className="demo-controls">
            <button className="demo-button primary" onClick={reset}>
              Start over
            </button>
            <span className="demo-step-count">
              Reached in {answers.length} {answers.length === 1 ? "step" : "steps"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
