import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, FileText, Sparkles, Target } from "lucide-react";

import {
  SCORE_LABELS,
  loadAnalysis,
  relativeTime,
  scoreMessage,
  type StoredAnalysis,
} from "@/lib/jaso";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "AI 분석 결과 — JASO AI" },
      {
        name: "description",
        content:
          "종합 점수, 항목별 평가, 채용 담당자 한줄 평가, 문장별 피드백과 AI 수정 예시를 한 화면에서 확인하세요.",
      },
      { property: "og:title", content: "AI 분석 결과 — JASO AI" },
      {
        property: "og:description",
        content: "내 자기소개서의 점수와 개선 방향을 확인해보세요.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultPage,
});

function ScoreRing({ score }: { score: number }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative size-44 shrink-0">
      <svg viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          strokeWidth="12"
          className="stroke-secondary"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          className="stroke-brand-blue transition-[stroke-dashoffset] duration-[1200ms] ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight text-primary">{progress}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function Bar({ value }: { value: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 150);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full bg-brand-blue transition-[width] duration-[900ms] ease-out"
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-blue-soft text-primary">
        <FileText className="size-6" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
        아직 분석 결과가 없습니다.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        자기소개서를 입력하고 AI 분석을 진행하면 이곳에서 결과를 확인할 수 있습니다.
      </p>
      <Link
        to="/analyze"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        자기소개서 분석하기
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function ResultPage() {
  const [data, setData] = useState<StoredAnalysis | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"original" | "rewrite">("rewrite");

  useEffect(() => {
    setData(loadAnalysis());
    setReady(true);
  }, []);

  const analyzedLabel = useMemo(
    () => (data ? relativeTime(data.analyzedAt) : ""),
    [data],
  );

  if (!ready) return <div className="min-h-[60vh]" />;
  if (!data) return <EmptyState />;

  const { result } = data;

  return (
    <div className="animate-fade-up">
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            <Sparkles className="size-3.5" />
            AI 분석 완료
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI 분석 결과
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>
              지원 직무 <span className="font-semibold text-foreground">{data.job}</span>
            </span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>{analyzedLabel}</span>
          </div>
          {data.question && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              문항 · {data.question}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        {/* 종합 점수 + 평가 항목 */}
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="surface-card flex flex-col items-center p-7 text-center">
            <p className="text-sm font-semibold text-muted-foreground">종합 점수</p>
            <div className="mt-4">
              <ScoreRing score={result.overall_score} />
            </div>
            <p className="mt-5 text-base font-semibold text-foreground">
              {scoreMessage(result.overall_score)}
            </p>
          </div>

          <div className="surface-card p-7">
            <h2 className="text-base font-semibold text-foreground">평가 항목</h2>
            <div className="mt-6 space-y-5">
              {SCORE_LABELS.map(({ key, label }) => (
                <div key={key}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="text-sm font-bold text-primary">
                      {result.scores[key]}
                      <span className="text-xs font-medium text-muted-foreground">점</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <Bar value={result.scores[key]} />
                  </div>
                  {result.score_comments?.[key] && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {result.score_comments[key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 채용 담당자 한줄 평가 */}
        <div className="rounded-2xl border border-border bg-[image:var(--gradient-primary)] p-7 shadow-[var(--shadow-elevated)]">
          <p className="text-xs font-semibold tracking-wide text-primary-foreground/75">
            채용 담당자 관점 한줄 평가
          </p>
          <p className="mt-3 text-base leading-relaxed text-primary-foreground sm:text-lg">
            “{result.recruiter_comment}”
          </p>
        </div>

        {/* 가장 먼저 개선할 부분 */}
        <div className="surface-card border-l-4 border-l-brand-blue p-7">
          <p className="text-sm font-bold text-brand-blue">🎯 가장 먼저 개선하세요</p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">
            {result.priority_improvement.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {result.priority_improvement.description}
          </p>
        </div>

        {/* 잘된 점 / 개선할 점 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-7">
            <h2 className="text-base font-semibold text-foreground">👍 잘된 점</h2>
            <ul className="mt-5 space-y-3">
              {result.strengths.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-lg border border-success/20 bg-success/5 p-4"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <span className="text-sm leading-relaxed text-foreground">{s}</span>
                </li>
              ))}
              {result.strengths.length === 0 && (
                <li className="text-sm text-muted-foreground">강점 분석 내용이 없습니다.</li>
              )}
            </ul>
          </div>

          <div className="surface-card p-7">
            <h2 className="text-base font-semibold text-foreground">⚠️ 개선할 점</h2>
            <ol className="mt-5 space-y-4">
              {result.improvements.map((imp, i) => (
                <li key={i} className="rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{imp.title}</p>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {imp.description}
                  </p>
                </li>
              ))}
              {result.improvements.length === 0 && (
                <li className="text-sm text-muted-foreground">개선점 분석 내용이 없습니다.</li>
              )}
            </ol>
          </div>
        </div>

        {/* 문장별 피드백 */}
        <div className="surface-card p-7">
          <h2 className="text-base font-semibold text-foreground">✏️ 문장별 AI 피드백</h2>
          <div className="mt-5 space-y-5">
            {result.sentence_feedback.map((fb, i) => (
              <div key={i} className="rounded-xl border border-border p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-secondary/60 p-4">
                    <p className="text-xs font-bold text-muted-foreground">원문</p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">{fb.original}</p>
                  </div>
                  <div className="rounded-lg bg-brand-blue-soft/60 p-4">
                    <p className="text-xs font-bold text-primary">수정 예시</p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">{fb.suggestion}</p>
                  </div>
                </div>
                <p className="mt-4 flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Target className="mt-0.5 size-4 shrink-0 text-brand-blue" />
                  <span>{fb.feedback}</span>
                </p>
              </div>
            ))}
            {result.sentence_feedback.length === 0 && (
              <p className="text-sm text-muted-foreground">문장별 피드백이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 전체 수정 예시 */}
        <div className="surface-card p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-foreground">
              ✏️ AI가 제안하는 수정 예시
            </h2>
            <div className="inline-flex rounded-lg border border-border bg-secondary/60 p-1">
              {(
                [
                  ["original", "원문"],
                  ["rewrite", "AI 수정 예시"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                    tab === value
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-border bg-secondary/40 p-5">
            <p className="whitespace-pre-line text-sm leading-7 text-foreground">
              {tab === "original" ? data.content : result.rewrite_example}
            </p>
          </div>
        </div>

        {/* 키워드 */}
        <div className="surface-card p-7">
          <h2 className="text-base font-semibold text-foreground">⭐ AI 추천 키워드</h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {result.keywords.map((k) => (
              <span
                key={k}
                className="rounded-full border border-border bg-brand-blue-soft px-4 py-2 text-sm font-medium text-primary"
              >
                #{k}
              </span>
            ))}
            {result.keywords.length === 0 && (
              <span className="text-sm text-muted-foreground">추천 키워드가 없습니다.</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-4 sm:flex-row">
          <Link
            to="/analyze"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            다시 분석하기
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/guide"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            작성 가이드 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
