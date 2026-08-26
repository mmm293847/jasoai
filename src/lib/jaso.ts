export type Scores = {
  writing: number;
  structure: number;
  specificity: number;
  job_fit: number;
  persuasiveness: number;
};

export type Improvement = { title: string; description: string };
export type SentenceFeedback = { original: string; feedback: string; suggestion: string };

export type AnalysisResult = {
  overall_score: number;
  scores: Scores;
  score_comments?: Partial<Record<keyof Scores, string>>;
  recruiter_comment: string;
  strengths: string[];
  improvements: Improvement[];
  sentence_feedback: SentenceFeedback[];
  keywords: string[];
  priority_improvement: Improvement;
  rewrite_example: string;
};

export type StoredAnalysis = {
  job: string;
  question: string;
  content: string;
  analyzedAt: number;
  result: AnalysisResult;
};

export const STORAGE_KEY = "jaso-ai:last-analysis";

export const SCORE_LABELS: { key: keyof Scores; label: string }[] = [
  { key: "writing", label: "문장 표현" },
  { key: "structure", label: "구조" },
  { key: "specificity", label: "구체성" },
  { key: "job_fit", label: "직무 적합성" },
  { key: "persuasiveness", label: "설득력" },
];

export function scoreMessage(score: number) {
  if (score >= 90) return "매우 뛰어난 자기소개서입니다.";
  if (score >= 80) return "좋은 자기소개서입니다.";
  if (score >= 70) return "개선하면 더욱 좋아질 수 있습니다.";
  if (score >= 60) return "보완이 필요한 부분이 있습니다.";
  return "전반적인 수정이 필요합니다.";
}

export function saveAnalysis(data: StoredAnalysis) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}

export function loadAnalysis(): StoredAnalysis | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAnalysis;
    if (!parsed?.result?.scores) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 분석 완료";
  if (min < 60) return `${min}분 전 분석 완료`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}시간 전 분석 완료`;
  return `${Math.floor(hours / 24)}일 전 분석 완료`;
}
