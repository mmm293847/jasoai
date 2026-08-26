import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { analyzeCoverLetter } from "@/lib/analyze.functions";
import { saveAnalysis } from "@/lib/jaso";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "자기소개서 AI 분석 — JASO AI" },
      {
        name: "description",
        content:
          "지원 직무와 자기소개서를 입력하면 AI가 문장 표현, 구조, 구체성, 직무 적합성, 설득력을 분석해 개선 방향을 알려드립니다.",
      },
      { property: "og:title", content: "자기소개서 AI 분석 — JASO AI" },
      {
        property: "og:description",
        content: "지원 직무와 자기소개서를 입력하고 AI 분석 결과를 받아보세요.",
      },
    ],
  }),
  component: AnalyzePage,
});

const MAX_LEN = 3000;

const LOADING_MESSAGES = [
  "문장 표현을 확인하고 있습니다...",
  "글의 구조를 분석하고 있습니다...",
  "구체성과 근거를 점검하고 있습니다...",
  "직무 적합성을 분석하고 있습니다...",
  "채용 담당자 관점의 피드백을 정리하고 있습니다...",
];

const ERROR_MESSAGES: Record<string, string> = {
  AI_TIMEOUT: "AI 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
  AI_RATE_LIMIT: "요청이 많아 분석이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
  AI_CREDITS: "AI 사용 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.",
  AI_PARSE_ERROR: "AI 분석 결과를 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
};

function AnalyzePage() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeCoverLetter);

  const [job, setJob] = useState("");
  const [question, setQuestion] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [delayed, setDelayed] = useState(false);
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    const delayTimer = setTimeout(() => setDelayed(true), 25000);
    return () => {
      clearInterval(interval);
      clearTimeout(delayTimer);
    };
  }, [loading]);

  useEffect(() => () => timers.current.forEach(clearInterval), []);

  const charCount = content.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!job.trim()) {
      setError("지원 직무를 입력해주세요.");
      toast.error("지원 직무를 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("자기소개서를 입력해주세요.");
      toast.error("자기소개서를 입력해주세요.");
      return;
    }
    if (content.trim().length < 100) {
      setError("조금 더 구체적인 내용을 작성해주세요. 100자 이상의 입력을 권장합니다.");
      toast.error("100자 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    setDelayed(false);
    setMsgIndex(0);

    try {
      const result = await analyze({
        data: { job: job.trim(), question: question.trim(), content: content.trim() },
      });
      saveAnalysis({
        job: job.trim(),
        question: question.trim(),
        content: content.trim(),
        analyzedAt: Date.now(),
        result,
      });
      toast.success("AI 분석이 완료되었습니다.");
      navigate({ to: "/result" });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const key = Object.keys(ERROR_MESSAGES).find((k) => raw.includes(k));
      const message = key
        ? ERROR_MESSAGES[key]
        : "AI 분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            자기소개서 AI 분석
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            지원 직무와 자기소개서를 입력하면 AI가 개선 방향을 알려드립니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
            <div className="relative flex size-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-blue/20" />
              <span className="flex size-16 items-center justify-center rounded-full bg-brand-blue-soft text-primary">
                <Loader2 className="size-7 animate-spin" />
              </span>
            </div>
            <h2 className="mt-6 text-lg font-semibold text-foreground">
              AI가 자기소개서를 분석하고 있습니다.
            </h2>
            <p className="mt-2 min-h-6 text-sm text-brand-blue">{LOADING_MESSAGES[msgIndex]}</p>
            <div className="mt-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/3 animate-[fade-up_1.4s_ease-in-out_infinite_alternate] rounded-full bg-brand-blue" />
            </div>
            {delayed && (
              <p className="mt-6 text-xs text-muted-foreground">
                AI 응답이 지연되고 있습니다. 조금만 더 기다려주세요.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="surface-card space-y-7 p-6 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="job" className="text-sm font-semibold">
                지원 직무
              </Label>
              <Input
                id="job"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="예: 마케팅 / 프론트엔드 개발자 / 회계 / UX 디자이너"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-semibold">
                자기소개서 문항
              </Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: 우리 회사에 지원한 동기와 입사 후 포부를 작성해주세요."
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-semibold">
                자기소개서
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_LEN))}
                placeholder="자신의 경험, 역량, 지원동기 등을 자유롭게 작성해주세요."
                className="min-h-[280px] resize-y leading-relaxed sm:min-h-[360px]"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">권장 입력 길이 300~2000자</span>
                <span
                  className={
                    charCount > 0 && charCount < 100 ? "text-warning" : "text-muted-foreground"
                  }
                >
                  {charCount} / {MAX_LEN}자
                </span>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex gap-2.5 rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm leading-relaxed text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p className="whitespace-pre-line">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              AI 분석 시작하기
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
