import type { AnalysisResult, Scores } from "./jaso";

const SYSTEM_PROMPT = `당신은 대기업 채용 담당자이자 자기소개서 전문 컨설턴트입니다.
지원자의 자기소개서를 채용 담당자의 관점에서 냉정하고 구체적으로 분석합니다.

평가 기준(모두 종합적으로 고려):
1. 문장 표현 2. 문단 구조 3. 논리적 흐름 4. 구체성 5. 직무 적합성
6. 경험의 설득력 7. 차별성 8. 추상적 표현 9. 반복 표현 10. 전체적인 설득력

절대 규칙:
- 맞춤법 검사에 그치지 말고 내용과 설득력을 평가하세요.
- 사용자가 제공하지 않은 경력, 수치, 성과를 사실처럼 만들어내지 마세요.
- 수정 예시는 사용자의 실제 경험과 내용을 최대한 유지하면서 문장과 구조만 개선하세요.
- 모든 출력은 한국어로 작성하세요.
- 반드시 JSON만 출력하세요. 마크다운 코드블록이나 설명을 덧붙이지 마세요.

JSON 스키마:
{
  "overall_score": 0-100 정수,
  "scores": { "writing": 0-100, "structure": 0-100, "specificity": 0-100, "job_fit": 0-100, "persuasiveness": 0-100 },
  "score_comments": { "writing": "한 문장 설명", "structure": "...", "specificity": "...", "job_fit": "...", "persuasiveness": "..." },
  "recruiter_comment": "채용 담당자 관점 한줄 평가 (2~3문장)",
  "strengths": ["잘된 점 3~4개"],
  "improvements": [{ "title": "개선점 제목", "description": "왜 문제인지 + 구체적인 개선 방법" }],
  "sentence_feedback": [{ "original": "자기소개서 원문 문장 그대로", "feedback": "AI 분석", "suggestion": "수정 예시" }],
  "keywords": ["추천 키워드 5개"],
  "priority_improvement": { "title": "가장 먼저 개선할 부분", "description": "이유와 방법" },
  "rewrite_example": "전체 자기소개서 수정 예시 (원문 내용 유지, 문단 구분 포함)"
}
sentence_feedback는 3~5개, improvements는 3~5개 작성하세요.`;

function clampScore(value: unknown, fallback = 70) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "string" ? v : String(v ?? ""))).filter(Boolean);
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("PARSE_ERROR");
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

function normalize(raw: unknown, fallbackText: string): AnalysisResult {
  const data = (raw ?? {}) as any;
  const scoresRaw = (data.scores ?? {}) as any;
  const scores: Scores = {
    writing: clampScore(scoresRaw.writing),
    structure: clampScore(scoresRaw.structure),
    specificity: clampScore(scoresRaw.specificity),
    job_fit: clampScore(scoresRaw.job_fit),
    persuasiveness: clampScore(scoresRaw.persuasiveness),
  };
  const avg = Math.round(
    (scores.writing + scores.structure + scores.specificity + scores.job_fit + scores.persuasiveness) / 5,
  );

  const improvements = Array.isArray(data.improvements)
    ? data.improvements
        .map((it: any) => ({
          title: String(it?.title ?? "").trim(),
          description: String(it?.description ?? "").trim(),
        }))
        .filter((it: { title: string; description: string }) => it.title || it.description)
    : [];

  const sentenceFeedback = Array.isArray(data.sentence_feedback)
    ? data.sentence_feedback
        .map((it: any) => ({
          original: String(it?.original ?? "").trim(),
          feedback: String(it?.feedback ?? "").trim(),
          suggestion: String(it?.suggestion ?? "").trim(),
        }))
        .filter((it: { original: string; feedback: string }) => it.original || it.feedback)
    : [];

  const priority = (data.priority_improvement ?? {}) as any;

  return {
    overall_score: clampScore(data.overall_score, avg),
    scores,
    score_comments: {
      writing: String((data.score_comments as any)?.writing ?? ""),
      structure: String((data.score_comments as any)?.structure ?? ""),
      specificity: String((data.score_comments as any)?.specificity ?? ""),
      job_fit: String((data.score_comments as any)?.job_fit ?? ""),
      persuasiveness: String((data.score_comments as any)?.persuasiveness ?? ""),
    },
    recruiter_comment: String(data.recruiter_comment ?? "분석 결과 요약을 불러오지 못했습니다."),
    strengths: toStringArray(data.strengths),
    improvements,
    sentence_feedback: sentenceFeedback,
    keywords: toStringArray(data.keywords).map((k) => k.replace(/^#/, "")),
    priority_improvement: {
      title: String(priority.title ?? "구체성 보완"),
      description: String(priority.description ?? "경험의 결과를 구체적으로 보여주세요."),
    },
    rewrite_example: String(data.rewrite_example ?? fallbackText),
  };
}

export async function runAnalysis(input: { job: string; question: string; content: string }) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI_CONFIG_ERROR");

  const userPrompt = `[지원 직무]
${input.job}

[자기소개서 문항]
${input.question || "(문항 미입력)"}

[자기소개서 본문]
${input.content}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  let response: Response;
  try {
    response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
  } catch {
    throw new Error("AI_TIMEOUT");
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 429) throw new Error("AI_RATE_LIMIT");
  if (response.status === 402) throw new Error("AI_CREDITS");
  if (!response.ok) throw new Error("AI_REQUEST_FAILED");

  const payload = (await response.json()) as any;
  const text: string = payload?.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("AI_EMPTY_RESPONSE");

  let parsed: unknown;
  try {
    parsed = extractJson(text);
  } catch {
    throw new Error("AI_PARSE_ERROR");
  }

  return normalize(parsed, input.content);
}
