# JASO AI — AI 자기소개서 분석 웹 서비스

## 1. 서비스 소개

JASO AI는 대학생 취업 준비생을 위한 AI 자기소개서 분석 서비스입니다. 사용자가 지원 직무와 자기소개서를
입력하면 AI가 채용 담당자의 관점에서 자기소개서를 평가하고, 점수와 구체적인 개선 방법 및 수정 예시를
제공합니다.

## 2. 주요 기능

- 지원 직무 / 자기소개서 문항 / 자기소개서 본문 입력
- AI 분석: 문장 표현, 문단 구조, 논리적 흐름, 구체성, 직무 적합성, 경험의 설득력, 차별성, 추상적 표현,
  반복 표현, 전체적인 설득력
- 분석 결과: 종합 점수(원형 그래프), 5개 항목별 점수(Progress Bar), 채용 담당자 관점 한줄 평가,
  잘된 점, 개선할 점, 문장별 피드백(원문/분석/수정 예시), 전체 수정 예시, AI 추천 키워드,
  가장 먼저 개선할 부분
- 입력 검증 및 오류 처리(빈 입력, 100자 미만, API 오류, 응답 지연)
- 분석 결과 localStorage 저장 → 새로고침 후에도 마지막 결과 확인 가능
- 자기소개서 작성 가이드 6개 항목(잘못된 예시 / 개선된 예시 / TIP)
- 데스크톱·태블릿·모바일 반응형, 모바일 햄버거 메뉴

## 3. 타겟 사용자

- 자기소개서를 처음 작성하는 대학생 및 취업 준비생
- 제출 전 자기소개서를 객관적으로 점검하고 싶은 지원자

## 4. 기술 스택

- 프론트엔드: React 19 + TypeScript, TanStack Router(파일 기반 라우팅), Tailwind CSS v4
- 백엔드: TanStack Start 서버 함수(`createServerFn`) — 서버에서만 실행되는 API 계층
- AI: Lovable AI Gateway (`google/gemini-2.5-flash`), JSON 응답 강제 및 파싱 오류 방어 처리
- 배포: Lovable 호스팅(Cloudflare Workers 런타임)

> 참고: 요청서에는 정적 HTML/CSS/JS + Vercel Python Functions 구조가 적혀 있었지만, 이 프로젝트의
> 실행 환경은 TanStack Start(React + 서버 함수)입니다. 역할 분리(프론트엔드 ↔ 서버 API ↔ AI API)와
> API 키 보안 원칙은 동일하게 유지했습니다.

## 5. 프로젝트 구조

```
src/
├── routes/
│   ├── __root.tsx          # 공통 레이아웃(Navigation, Footer, Toast)
│   ├── index.tsx           # 홈(랜딩)
│   ├── analyze.tsx         # 자기소개서 분석(입력 폼 + 로딩)
│   ├── result.tsx          # 분석 결과
│   └── guide.tsx           # 작성 가이드
├── components/
│   ├── SiteNav.tsx         # 상단 Navigation(모바일 햄버거)
│   ├── SiteFooter.tsx
│   └── ui/                 # 공통 UI 컴포넌트
├── lib/
│   ├── analyze.functions.ts  # 프론트엔드가 호출하는 서버 함수(입력 검증)
│   ├── analyze.server.ts     # AI API 호출 + 응답 정규화(서버 전용)
│   └── jaso.ts               # 타입, 점수 메시지, localStorage 유틸
└── styles.css              # 디자인 시스템(색상/그림자/타이포 토큰)
```

## 6. AI 기능 동작 방식

```
사용자 입력(지원 직무 / 문항 / 자기소개서)
  ↓
클라이언트 검증(빈 값, 100자 미만)
  ↓
서버 함수 호출 (analyzeCoverLetter)
  ↓
서버에서 환경변수로 AI API 키 로드 → AI API 호출
  ↓
AI가 JSON 형식 분석 결과 반환
  ↓
서버에서 JSON 파싱 및 필드 정규화(점수 범위 보정, 누락 필드 기본값)
  ↓
클라이언트가 결과를 localStorage에 저장 후 결과 페이지로 이동
```

AI 프롬프트에는 다음 규칙이 포함됩니다.

- "당신은 채용 담당자이자 자기소개서 전문 컨설턴트입니다."
- 맞춤법 검사에 그치지 않고 10가지 기준으로 종합 평가
- 사용자가 제공하지 않은 경력·수치·성과를 임의로 만들어내지 않음
- 수정 예시는 사용자의 실제 내용을 최대한 유지하며 문장과 구조만 개선

### AI 결과 JSON 스키마

```json
{
  "overall_score": 84,
  "scores": { "writing": 88, "structure": 82, "specificity": 79, "job_fit": 86, "persuasiveness": 84 },
  "score_comments": { "writing": "...", "structure": "...", "specificity": "...", "job_fit": "...", "persuasiveness": "..." },
  "recruiter_comment": "채용 담당자 관점 한줄 평가",
  "strengths": ["잘된 점 1", "잘된 점 2"],
  "improvements": [{ "title": "개선점 제목", "description": "개선 방법" }],
  "sentence_feedback": [{ "original": "원문", "feedback": "AI 분석", "suggestion": "수정 예시" }],
  "keywords": ["협업", "문제해결"],
  "priority_improvement": { "title": "가장 먼저 개선할 부분", "description": "이유와 방법" },
  "rewrite_example": "전체 자기소개서 수정 예시"
}
```

JSON 파싱에 실패하거나 필드가 누락되어도 화면이 깨지지 않도록 서버에서 값 보정과 기본값 처리를 수행하고,
클라이언트에는 사용자용 오류 메시지를 반환합니다.

## 7. 환경변수 설정 방법

API 키는 HTML/CSS/JavaScript 등 클라이언트 코드에 절대 작성하지 않으며, 서버 함수 안에서만 환경변수로
읽습니다. 실제 키 값은 저장소나 README에 포함하지 않습니다.

- `LOVABLE_API_KEY` — AI Gateway 호출용 키(현재 구현에서 사용, 플랫폼에서 자동 주입)
- 다른 AI 제공자를 사용할 경우 `OPENAI_API_KEY`처럼 접두어 없는 이름으로 등록하고
  `src/lib/analyze.server.ts`의 호출부만 교체하면 됩니다.

```bash
# .env (커밋하지 않음 — .gitignore에 포함)
OPENAI_API_KEY=여기에_본인_키
```

`VITE_` 접두어가 붙은 변수는 클라이언트 번들에 노출되므로 API 키에는 절대 사용하지 않습니다.

## 8. 로컬 실행 방법

```bash
npm install
npm run dev
# http://localhost:8080
```

## 9. 배포 방법

Lovable 편집 화면 우측 상단의 **Publish** 버튼으로 배포합니다. 환경변수를 추가·수정한 뒤에는 다시
Publish 해야 운영 환경에 반영됩니다.

## 10. 배포 URL

- 미리보기: (프로젝트 Preview URL)
- 운영: (Publish 후 발급되는 URL 기재)

## 11. 테스트 방법

1. 홈에서 "자기소개서 분석하기" 클릭 → 분석 페이지 이동 확인
2. 아무것도 입력하지 않고 분석 시작 → "지원 직무를 입력해주세요." 확인
3. 직무만 입력하고 분석 시작 → "자기소개서를 입력해주세요." 확인
4. 자기소개서 50자 입력 → 100자 이상 권장 안내 확인
5. 직무와 300자 이상 자기소개서 입력 → 로딩 화면 및 상태 메시지 확인 후 결과 페이지 이동
6. 결과 페이지 새로고침 → 마지막 분석 결과가 유지되는지 확인
7. localStorage 삭제 후 `/result` 접속 → "아직 분석 결과가 없습니다." 안내 확인
8. 브라우저 창을 모바일 크기로 줄여 햄버거 메뉴, 1열 레이아웃, textarea 크기 확인
