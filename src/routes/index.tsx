import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Layers,
  MessageSquareQuote,
  Sparkles,
  Target,
  Telescope,
  Type,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JASO AI — AI 자기소개서 분석 서비스" },
      {
        name: "description",
        content:
          "자기소개서를 입력하면 AI가 채용 담당자 관점에서 점수, 잘된 점, 개선할 점, 문장별 피드백과 수정 예시를 제공합니다.",
      },
      { property: "og:title", content: "JASO AI — AI 자기소개서 분석 서비스" },
      {
        property: "og:description",
        content: "AI 채용 담당자에게 내 자기소개서를 먼저 평가받아보세요.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Type,
    title: "문장 표현",
    desc: "어색한 표현과 반복되는 문장을 찾아냅니다.",
  },
  {
    icon: Layers,
    title: "구조",
    desc: "자기소개서의 논리적 흐름을 분석합니다.",
  },
  {
    icon: Telescope,
    title: "구체성",
    desc: "추상적인 표현과 부족한 근거를 찾아냅니다.",
  },
  {
    icon: Target,
    title: "직무 적합성",
    desc: "지원 직무와 경험의 연결성을 분석합니다.",
  },
  {
    icon: MessageSquareQuote,
    title: "설득력",
    desc: "채용 담당자에게 얼마나 설득력 있게 전달되는지 평가합니다.",
  },
];

const steps = [
  { step: "STEP 01", title: "자기소개서 입력", desc: "지원 직무와 문항, 자기소개서를 입력합니다." },
  { step: "STEP 02", title: "AI 분석", desc: "AI가 10가지 기준으로 자기소개서를 평가합니다." },
  { step: "STEP 03", title: "맞춤 피드백 확인", desc: "점수와 개선 방향, 수정 예시를 확인합니다." },
];

const previewScores = [
  { label: "문장 표현", value: 88 },
  { label: "구조", value: 82 },
  { label: "구체성", value: 79 },
  { label: "직무 적합성", value: 86 },
];

function Home() {
  return (
    <div className="animate-fade-up">
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="size-3.5" />
              AI 자기소개서 분석
            </span>
            <h1 className="mt-6 text-3xl font-bold leading-[1.28] tracking-tight text-foreground sm:text-4xl lg:text-[2.9rem]">
              당신의 자기소개서,
              <br />
              <span className="text-gradient-primary">AI 채용 담당자</span>에게
              <br />
              먼저 평가받아보세요.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              자기소개서를 입력하면 AI가 문장, 구조, 구체성, 직무 적합성을 분석하고 더 설득력 있는
              작성 방향을 제안합니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/analyze"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
              >
                자기소개서 분석하기
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/guide"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <BookOpen className="size-4" />
                작성 가이드 보기
              </Link>
            </div>
          </div>

          <div className="surface-card p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">AI 분석 결과</p>
              <span className="rounded-full bg-brand-blue-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                예시
              </span>
            </div>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-5xl font-bold tracking-tight text-primary">84</span>
              <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">종합 점수</p>

            <div className="mt-6 space-y-3.5">
              {previewScores.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>{s.label}</span>
                    <span className="text-foreground">{s.value}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-brand-blue transition-[width] duration-700"
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <blockquote className="mt-6 rounded-lg border-l-2 border-brand-blue bg-secondary/70 p-4 text-sm leading-relaxed text-secondary-foreground">
              “경험은 좋지만 결과를 수치로 구체화하면 더욱 설득력 있습니다.”
            </blockquote>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          JASO AI가 분석하는 것
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          채용 담당자가 실제로 보는 기준을 AI가 항목별로 평가합니다.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="surface-card p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-blue-soft text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            AI 분석은 3단계로 진행됩니다.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="surface-card p-6">
                <p className="text-xs font-bold tracking-widest text-brand-blue">{s.step}</p>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="rounded-2xl border border-border bg-[image:var(--gradient-primary)] px-6 py-12 text-center shadow-[var(--shadow-elevated)] sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
            지금 내 자기소개서를 분석해보세요.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80">
            300자 이상만 입력하면 AI가 바로 점수와 개선 방향을 제시합니다.
          </p>
          <Link
            to="/analyze"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-card px-6 py-3.5 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
          >
            AI 분석 시작하기
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
