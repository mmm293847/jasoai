import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Lightbulb, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "자기소개서 작성 가이드 — JASO AI" },
      {
        name: "description",
        content:
          "지원동기, 구체성, STAR 구조, 추상적 표현 줄이기 등 좋은 자기소개서를 작성하는 6가지 원칙을 예시와 함께 정리했습니다.",
      },
      { property: "og:title", content: "자기소개서 작성 가이드 — JASO AI" },
      {
        property: "og:description",
        content: "AI에게 분석받기 전에 알아두면 좋은 자기소개서 작성 원칙 6가지.",
      },
    ],
  }),
  component: GuidePage,
});

const guides = [
  {
    title: "지원동기 작성법",
    bad: "평소 귀사에 관심이 많았고, 성장하고 싶어 지원했습니다.",
    good: "귀사의 사용자 로그 기반 개인화 서비스에 관심이 생겨, 학부 프로젝트에서 추천 알고리즘을 직접 구현해보며 이 분야에서 일하고 싶다는 확신을 갖게 되었습니다.",
    tip: "회사와 직무에 대한 관심을 '내가 직접 해본 경험'과 연결해서 설명하세요.",
  },
  {
    title: "경험을 구체적으로 작성하는 방법",
    bad: "팀 프로젝트에서 많은 역할을 수행했습니다.",
    good: "5인 팀 프로젝트에서 기획과 일정 관리를 맡아 주 2회 회의를 운영하고, 산출물 마감을 8주간 한 번도 놓치지 않았습니다.",
    tip: "'무엇을, 어떻게, 얼마나' 했는지가 들어가야 경험이 됩니다.",
  },
  {
    title: "STAR 구조 활용하기",
    bad: "문제가 있었지만 잘 해결했습니다.",
    good: "Situation: 마감 2주 전 요구사항이 변경됨 / Task: 일정 재구성 필요 / Action: 기능 우선순위를 재정렬하고 역할을 재분배 / Result: 마감 내 핵심 기능 100% 완성.",
    tip: "상황 → 과제 → 행동 → 결과 순으로 쓰면 읽는 사람이 흐름을 놓치지 않습니다.",
  },
  {
    title: "추상적인 표현 줄이기",
    bad: "열심히 노력했습니다.",
    good: "3개월 동안 매주 2회 팀 회의에 참여하고 프로젝트 일정을 관리했습니다.",
    tip: "노력했다는 사실보다 무엇을 했고 어떤 결과를 만들었는지를 보여주세요.",
  },
  {
    title: "경험과 지원 직무 연결하기",
    bad: "다양한 경험을 통해 성장했습니다.",
    good: "학과 학술제에서 설문 데이터 300건을 분석해 개선안을 도출한 경험은, 데이터 기반으로 캠페인을 설계하는 마케팅 직무에 바로 활용할 수 있습니다.",
    tip: "경험 문단의 마지막 한 문장은 항상 '그래서 이 직무에 어떻게 쓰이는지'로 마무리하세요.",
  },
  {
    title: "결과를 수치로 표현하기",
    bad: "행사 홍보에 기여해 참여자가 늘었습니다.",
    good: "SNS 카드뉴스 12건을 제작해 행사 신청자를 전년 대비 140명(약 45%) 늘렸습니다.",
    tip: "숫자가 없다면 기간, 횟수, 인원, 비율 중 하나라도 넣어보세요.",
  },
];

function GuidePage() {
  return (
    <div className="animate-fade-up">
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-18">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            좋은 자기소개서를 작성하는 방법
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            AI에게 분석받기 전에 알아두면 좋은 자기소개서 작성 원칙
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
          {guides.map((g, i) => (
            <AccordionItem
              key={g.title}
              value={`item-${i}`}
              className="surface-card border-b px-5 data-[state=open]:shadow-[var(--shadow-elevated)]"
            >
              <AccordionTrigger className="py-5 text-left hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-blue-soft text-xs font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-semibold text-foreground">{g.title}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                      <X className="size-3.5" /> 잘못된 예시
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">{g.bad}</p>
                  </div>
                  <div className="rounded-lg border border-success/25 bg-success/5 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-success">
                      <Check className="size-3.5" /> 개선된 예시
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">{g.good}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2.5 rounded-lg bg-secondary/70 p-4">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand-blue" />
                  <p className="text-sm leading-relaxed text-secondary-foreground">
                    <span className="font-semibold">TIP </span>
                    {g.tip}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="surface-card mt-10 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-foreground">이제 AI에게 분석받아보세요.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              작성한 자기소개서를 붙여넣으면 바로 점수와 피드백을 받을 수 있습니다.
            </p>
          </div>
          <Link
            to="/analyze"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            자기소개서 분석하기
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
