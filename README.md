# Frontend

---

## 프로젝트 개요

RAG Chatbot은 **Retrieval-Augmented Generation** 기법을 활용한 순수 클라이언트 사이드 AI 챗봇 애플리케이션입니다.

사용자가 텍스트 문서를 업로드하면 내용을 청크(chunk)로 분할하고 OpenAI Embedding API로 벡터화하여 브라우저 메모리에 저장합니다. 이후 사용자가 질문을 입력하면 코사인 유사도 기반 벡터 검색으로 관련 문서 조각을 찾아 LLM의 컨텍스트에 주입한 뒤 스트리밍 방식으로 답변을 생성합니다.

별도 백엔드 서버 없이 브라우저만으로 완전한 RAG 파이프라인을 구현한 것이 핵심 특징입니다.

| 항목 | 내용 |
|------|------|
| 아키텍처 | 순수 클라이언트 SPA (백엔드 없음) |
| LLM | OpenAI GPT-4o-mini (Chat Completion, SSE 스트리밍) |
| 임베딩 모델 | OpenAI text-embedding-3-small |
| 벡터 스토어 | 인메모리 배열 (페이지 세션 동안만 유지) |
| 지원 파일 형식 | `.txt`, `.md`, `.csv` |
| 청킹 전략 | 슬라이딩 윈도우 (500단어, 50단어 오버랩) |
| 검색 전략 | 코사인 유사도 Top-5, 임계값 0.3 |

---

## 기술 스택

### 프론트엔드 프레임워크
| 분류 | 기술 | 역할 |
|------|------|------|
| UI 프레임워크 | Vue 3 (Composition API) | 컴포넌트 기반 UI 구성 |
| 언어 | TypeScript | 정적 타입 안전성 |
| 빌드 도구 | Vite | 빠른 HMR, 번들링 |
| 라우터 | Vue Router 4 | SPA 라우팅 (`/` → ChatView) |
| 상태 관리 | Pinia | 전역 상태 (세션, 문서, 스트리밍) |

### UI / 스타일링
| 분류 | 기술 | 역할 |
|------|------|------|
| CSS 프레임워크 | Tailwind CSS v4 | 유틸리티 퍼스트 스타일링 |
| UI 컴포넌트 라이브러리 | shadcn-vue | 접근성 기반 컴포넌트 (Textarea, Button 등) |
| 아이콘 | Lucide Vue | SVG 아이콘 세트 |

### AI / 벡터 처리
| 분류 | 기술 | 역할 |
|------|------|------|
| LLM API | OpenAI Chat Completions API | 질의응답 스트리밍 생성 |
| 임베딩 API | OpenAI Embeddings API | 텍스트 → 벡터 변환 |
| 유사도 계산 | 코사인 유사도 (순수 구현) | 쿼리-청크 간 관련도 측정 |
| SDK | openai (npm) | 브라우저 직접 호출 (`dangerouslyAllowBrowser: true`) |

### 개발 환경
| 분류 | 기술 | 역할 |
|------|------|------|
| 패키지 매니저 | npm | 의존성 관리 |
| 타입 검사 | vue-tsc | Vue SFC + TypeScript 타입 검증 |
| 환경변수 | Vite `.env` | API 키 주입 (`VITE_` 접두사) |

---

## 프로젝트 구조

```
rag-chatbot/
├── .env.example                      # 환경변수 템플릿 (API Key 입력 가이드)
├── .env                              # 실제 환경변수 파일 (git 제외, .gitignore에 등록)
├── index.html                        # Vite SPA 진입점 HTML (id="app" 마운트 대상)
├── package.json                      # 의존성 목록 및 npm 스크립트 정의
├── tsconfig.json                     # TypeScript 컴파일러 옵션 (strict, paths 등)
├── tsconfig.app.json                 # 앱 소스 전용 TypeScript 설정
├── tsconfig.node.json                # vite.config.ts 등 Node 환경 TypeScript 설정
├── vite.config.ts                    # Vite 빌드 설정 + '@' 경로 alias (→ src/)
│
└── src/
    ├── main.ts                       # 앱 진입점: Vue 앱 생성, Pinia/Router 플러그인 등록
    ├── App.vue                       # 루트 컴포넌트: <RouterView /> 렌더링만 담당
    │
    ├── types/                        # ── 도메인 타입 정의 레이어 ────────────────
    │   ├── chat.types.ts             # 채팅 관련 타입 (메시지, 세션, 검색 소스)
    │   ├── document.types.ts         # 문서/청크 관련 타입 (업로드 상태, 청킹 옵션)
    │   └── openai.types.ts           # OpenAI API 요청/응답 타입 (모델, 스트림 청크)
    │
    ├── services/                     # ── 비즈니스 로직 레이어 (Vue 비의존) ──────
    │   ├── openai.service.ts         # OpenAI SDK 래퍼: 채팅 완성, 임베딩 생성
    │   ├── rag.service.ts            # RAG 핵심 엔진: 청킹, 벡터 저장, 유사도 검색
    │   └── document.service.ts       # 파일 업로드 파이프라인: 추출→청킹→임베딩→저장
    │
    ├── stores/                       # ── 전역 상태 관리 (Pinia) ──────────────
    │   ├── chat.store.ts             # 대화 세션/메시지 목록, 로딩/에러/스트리밍 상태
    │   └── document.store.ts         # 업로드 문서 목록, 파일별 업로드 진행률(0~100)
    │
    ├── composables/                  # ── Composition API 훅 (Store + Service 연결) ─
    │   ├── useChat.ts                # 메시지 전송 → RAG 검색 → 스트리밍 응답 파이프라인
    │   └── useDocuments.ts           # 파일 업로드 처리 및 문서 삭제 UI 로직
    │
    ├── components/                   # ── UI 컴포넌트 ──────────────────────────
    │   ├── chat/
    │   │   ├── ChatWindow.vue        # 메시지 목록 렌더링, 자동 스크롤, 타이핑 인디케이터
    │   │   ├── ChatMessage.vue       # 역할별 말풍선(user/assistant), RAG 소스 표시, 스트리밍 커서
    │   │   └── ChatInput.vue         # 자동 리사이즈 textarea, Enter 전송, Shift+Enter 줄바꿈
    │   └── document/
    │       ├── DocumentUploader.vue  # 드래그&드롭 / 파일 선택, 파일 업로드 트리거
    │       └── DocumentList.vue      # 문서 목록 카드, 처리 상태 아이콘, 진행 바, 삭제 버튼
    │
    ├── views/                        # ── 페이지 뷰 (라우터에 등록되는 단위) ────
    │   └── ChatView.vue              # 사이드바(문서 관리) + 메인(채팅) 2열 Grid 레이아웃
    │
    └── router/                       # ── 클라이언트 사이드 라우팅 ──────────────
        └── index.ts                  # createRouter: '/' → ChatView 단일 라우트
```

---

## 시작하기 (Getting Started)

### 사전 요구 사항

- Node.js 18 이상
- npm 9 이상
- OpenAI API 키 ([platform.openai.com](https://platform.openai.com) 에서 발급)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <repository-url>
cd rag-chatbot

# 2. 의존성 설치
npm install

# 3. 환경변수 파일 생성
cp .env.example .env

# 4. .env 파일에 OpenAI API 키 입력 (아래 환경변수 설정 섹션 참고)

# 5. 개발 서버 실행
npm run dev
# → http://localhost:5173 에서 확인
```

### 빌드 및 배포

```bash
# 타입 검사만 실행
npm run type-check

# 프로덕션 빌드 (dist/ 디렉터리에 출력)
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview
```

빌드 결과물(`dist/`)은 정적 파일이므로 Vercel, Netlify, GitHub Pages 등 어떤 정적 호스팅 서비스에도 배포 가능합니다.

---

## 환경변수 설정

프로젝트 루트의 `.env.example`을 복사해 `.env` 파일을 만들고 값을 채웁니다.

```bash
cp .env.example .env
```

### `.env.example` 전체 항목

```dotenv
# OpenAI API 키 (필수)
# platform.openai.com → API Keys 메뉴에서 발급
VITE_OPENAI_API_KEY=sk-...

# 사용할 채팅 모델 (선택, 기본값: gpt-4o-mini)
VITE_OPENAI_MODEL=gpt-4o-mini

# 사용할 임베딩 모델 (선택, 기본값: text-embedding-3-small)
VITE_OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### 주의 사항

| 항목 | 설명 |
|------|------|
| `VITE_` 접두사 | Vite 빌드 시 클라이언트 번들에 인라인됩니다. 브라우저 DevTools에서 노출됩니다. |
| API 키 노출 위험 | 프로덕션 배포 시 OpenAI 대시보드에서 **사용량 제한(Usage Limits)** 및 **도메인 제한**을 반드시 설정하세요. |
| `.env` gitignore | `.env` 파일은 `.gitignore`에 등록되어 있어 저장소에 커밋되지 않습니다. |
| `.env.example` | API 키 값은 비워 두고 커밋합니다. 팀원이 어떤 변수가 필요한지 파악하는 용도입니다. |

---

## 백엔드 연동 구조

현재 이 프로젝트는 **백엔드 서버가 없는 순수 클라이언트 아키텍처**입니다. 모든 AI 처리는 브라우저에서 OpenAI API를 직접 호출합니다.

### 현재 구조 (백엔드 없음)

```
브라우저
│
├── openai.service.ts
│     ├── POST https://api.openai.com/v1/chat/completions   (채팅 스트리밍)
│     └── POST https://api.openai.com/v1/embeddings          (벡터 생성)
│
└── 인메모리 벡터 스토어 (rag.service.ts)
      └── let vectorStore: DocumentChunk[]  ← 페이지 새로고침 시 초기화
```

### API 호출 흐름

```
[문서 업로드 시]
브라우저 → POST /v1/embeddings
  요청: { model: "text-embedding-3-small", input: ["청크1", "청크2", ...] }
  응답: { data: [{ embedding: [0.12, -0.34, ...] }, ...] }
         ↓
  rag.service.vectorStore 배열에 추가

[채팅 메시지 전송 시]
브라우저 → POST /v1/embeddings  (쿼리 벡터화)
         → 코사인 유사도 계산 (로컬)
         → POST /v1/chat/completions  (stream: true)
  응답: SSE 스트림 → 토큰 단위 콜백 → chatStore.appendToLastMessage()
```

### 백엔드 서버 도입 시 확장 방향

실제 서비스 배포 시 API 키 보안과 벡터 퍼시스턴스를 위해 백엔드 도입을 권장합니다.

```
[백엔드 도입 후 예상 구조]

브라우저 (Vue SPA)
    │
    ▼
백엔드 API 서버 (예: Express / FastAPI / Next.js API Routes)
    ├── POST /api/embed       ← 임베딩 처리 (API 키 서버에 보관)
    ├── POST /api/chat        ← 채팅 완성 스트리밍 프록시
    ├── POST /api/documents   ← 문서 업로드 및 벡터 저장
    └── GET  /api/documents   ← 저장된 문서 목록 조회
         │
         ▼
    벡터 DB (Supabase pgvector / Pinecone / Weaviate)
    관계형 DB (PostgreSQL — 문서 메타데이터)
```

| 현재 방식 | 백엔드 도입 후 |
|-----------|----------------|
| API 키가 브라우저 번들에 노출 | API 키가 서버 환경변수에 보관 |
| 벡터 데이터가 세션 종료 시 소멸 | 벡터 DB에 영구 저장 |
| 단일 사용자만 지원 | 다중 사용자 + 인증 지원 |
| 대용량 처리 불가 (브라우저 메모리 한계) | 서버 사이드 배치 처리 가능 |

---

## 주요 기능

### 1. 문서 업로드 및 벡터화

- **드래그&드롭** 또는 파일 선택 버튼으로 복수 파일 동시 업로드
- 지원 형식: `.txt`, `.md`, `.csv`
- 업로드된 파일은 500단어 단위(50단어 오버랩)의 슬라이딩 윈도우 청크로 분할
- 각 청크를 `text-embedding-3-small` 모델로 벡터화하여 인메모리 저장
- 업로드 진행률 실시간 표시 (0 → 100%)
- 처리 완료된 문서는 "ready" 상태 뱃지와 함께 청크 수 표시

### 2. RAG 기반 문서 검색

- 사용자 질문을 동일 임베딩 모델로 벡터화
- 저장된 모든 청크와 **코사인 유사도** 계산
- 유사도 0.3 이상인 청크 중 상위 5개 선택 (Top-K 검색)
- 선택된 청크를 LLM system prompt에 컨텍스트로 주입

### 3. 스트리밍 채팅

- OpenAI Chat Completions API의 **SSE(Server-Sent Events) 스트리밍** 사용
- 토큰 단위로 실시간 렌더링 (타이핑 효과)
- 스트리밍 중 커서(▌) 표시로 생성 중임을 시각화
- 스트리밍 완료 전 중복 타이핑 인디케이터 방지 로직 내장

### 4. 다중 대화 세션

- 새 대화(New Chat) 버튼으로 독립적인 세션 생성
- 첫 메시지 내용으로 세션 제목 자동 설정
- 세션별 메시지 히스토리 독립 유지

### 5. RAG 소스 표시

- 답변 하단에 참조된 문서 청크 출처 표시
- 파일명, 청크 순번, 유사도 점수 함께 표시
- 어떤 문서 내용을 기반으로 답변했는지 투명하게 공개

### 6. 반응형 레이아웃

- 데스크톱: 사이드바(문서 관리) + 메인(채팅) 2열 레이아웃
- 모바일(768px 이하): 자동 1열 수직 레이아웃 전환

---

## 레이어별 역할 상세 설명

### 1. `types/` — 타입 정의 레이어

모든 도메인 모델을 TypeScript 인터페이스로 선언합니다.
서비스·스토어·컴포넌트 전체에서 공유되며, 타입 불일치로 인한 런타임 오류를 컴파일 시점에 차단합니다.

| 파일 | 핵심 타입 |
|------|-----------|
| `chat.types.ts` | `ChatMessage`, `ChatSession`, `RetrievedSource`, `ChatCompletionRequest` |
| `document.types.ts` | `RagDocument`, `DocumentChunk`, `DocumentStatus`, `ChunkingOptions` |
| `openai.types.ts` | `OpenAIConfig`, `OpenAIModel`, `EmbeddingModel`, `StreamChunk` |

---

### 2. `services/` — 비즈니스 로직 레이어

Vue에 의존하지 않는 순수 TypeScript 함수들로 구성됩니다.
UI와 분리되어 있어 테스트와 교체(예: 다른 LLM으로 변경)가 용이합니다.

#### `openai.service.ts`
OpenAI Node SDK를 브라우저 환경에서 사용하는 래퍼 모듈입니다.
- `streamChatCompletion()` — SSE 스트리밍으로 토큰을 콜백으로 전달
- `chatCompletion()` — 단일 응답 요청
- `createEmbeddings()` — 텍스트 배열을 벡터로 변환 (20개씩 배치 처리)

#### `rag.service.ts`
RAG의 핵심 알고리즘이 담긴 모듈입니다.

```
사용자 질문
    │
    ▼
[1] chunkText()               — 긴 문서를 슬라이딩 윈도우로 분할
    │
    ▼
[2] addChunksToStore()        — 임베딩된 청크를 모듈 레벨 배열에 저장
    │
    ▼
[3] retrieveRelevantChunks()  — 쿼리 임베딩 → 코사인 유사도 Top-K 검색
    │
    ▼
[4] buildSystemPrompt()       — 검색 결과를 system prompt에 주입
```

#### `document.service.ts`
파일 업로드 파이프라인 전체를 담당합니다.

```
File 객체
    │
    ▼  extractText()       — 텍스트 추출 (txt / md / csv)
    │
    ▼  chunkText()         — 청크 분할
    │
    ▼  createEmbeddings()  — 배치 임베딩 (20개씩)
    │
    ▼  addChunksToStore()  — 벡터 스토어 저장
    │
    ▼  RagDocument 반환    — 메타데이터(id, name, chunkCount …)
```

---

### 3. `stores/` — 전역 상태 (Pinia)

Composition API 스타일의 Pinia 스토어로 UI 상태를 관리합니다.

#### `chat.store.ts`
```
State
  sessions[]         — 모든 대화 세션 목록
  activeSessionId    — 현재 활성 세션 ID
  isLoading          — API 호출 중 여부
  error              — 마지막 에러 메시지

Getters
  activeSession      — 현재 세션 객체
  activeMessages     — 현재 세션의 메시지 배열

Actions
  createSession()        — 새 세션 생성
  addMessage()           — 메시지 추가 (자동 제목 설정)
  appendToLastMessage()  — 스트리밍 델타 토큰 누적
  finalizeLastMessage()  — 스트리밍 완료 플래그 해제
```

#### `document.store.ts`
```
State
  documents[]        — 업로드된 문서 메타데이터 목록
  uploadProgress{}   — 문서 ID별 업로드 진행률 (0~100)

Getters
  readyDocuments     — status === 'ready' 필터
  totalChunks        — 전체 청크 수 합계
  hasDocuments       — 준비된 문서 존재 여부
```

---

### 4. `composables/` — Composition API 훅

스토어와 서비스를 조합하여 컴포넌트에서 쉽게 사용할 수 있는 인터페이스를 제공합니다.

#### `useChat.ts` — 채팅 전체 파이프라인
```
sendMessage(userInput)
    │
    ├─ [1] chatStore.addMessage({ role: 'user' })
    ├─ [2] retrieveRelevantChunks(userInput)    ← RAG 검색
    ├─ [3] buildSystemPrompt(sources)           ← 컨텍스트 주입
    ├─ [4] chatStore.addMessage({ role: 'assistant', isStreaming: true })
    ├─ [5] streamChatCompletion(…, onChunk)
    │       └─ chatStore.appendToLastMessage(chunk)
    └─ [6] chatStore.finalizeLastMessage()
```

#### `useDocuments.ts` — 문서 업로드/삭제
- `uploadFiles(files)` — 파일 목록을 순차 처리하며 스토어 상태 업데이트
- `removeDocument(id)` — 벡터 스토어 + Pinia 스토어 동시 삭제

---

### 5. `components/` — UI 컴포넌트

#### chat/ 그룹

| 컴포넌트 | 책임 |
|----------|------|
| `ChatWindow.vue` | 메시지 목록 렌더링, 자동 스크롤, 타이핑 인디케이터 |
| `ChatMessage.vue` | 역할별 말풍선 스타일, RAG 소스 표시, 스트리밍 커서(▌) |
| `ChatInput.vue` | 자동 높이 조절 textarea, Enter 전송, Shift+Enter 줄바꿈 |

#### document/ 그룹

| 컴포넌트 | 책임 |
|----------|------|
| `DocumentUploader.vue` | 드래그&드롭 / 파일 선택, 업로드 트리거 |
| `DocumentList.vue` | 문서 목록, 처리 상태 아이콘, 진행 바, 삭제 버튼 |

---

### 6. `views/` — 페이지 뷰

`ChatView.vue`는 전체 앱의 유일한 페이지로, CSS Grid로 2열 레이아웃을 구성합니다.

```
┌─────────────────────────────────────────────────┐
│  사이드바 (300px)      │  메인 영역               │
│  ┌───────────────┐    │  ┌───────────────────┐  │
│  │ DocumentUploader│   │  │   ChatWindow      │  │
│  │ DocumentList  │    │  │  (메시지 + 입력창) │  │
│  └───────────────┘    │  └───────────────────┘  │
└─────────────────────────────────────────────────┘
```

모바일(768px 이하)에서는 자동으로 1열 수직 레이아웃으로 전환됩니다.

---

## 데이터 흐름 요약

```
[파일 업로드 흐름]
User → DocumentUploader
         └─ useDocuments.uploadFiles()
               └─ document.service.processDocument()
                     ├─ extractText()
                     ├─ chunkText()
                     ├─ openai.service.createEmbeddings()
                     └─ rag.service.addChunksToStore()
                           └─ documentStore.addDocument()

[채팅 흐름]
User → ChatInput (emit: send)
         └─ ChatWindow.onSend()
               └─ useChat.sendMessage()
                     ├─ chatStore.addMessage(user)
                     ├─ rag.service.retrieveRelevantChunks()  ← 벡터 검색
                     ├─ rag.service.buildSystemPrompt()        ← 프롬프트 조립
                     ├─ chatStore.addMessage(assistant, isStreaming=true)
                     └─ openai.service.streamChatCompletion()
                           └─ chatStore.appendToLastMessage(chunk)  ← 실시간 렌더링
```

---

## 확장 포인트

| 항목 | 현재 | 확장 방향 |
|------|------|-----------|
| 벡터 스토어 | 인메모리 배열 | Supabase pgvector / Pinecone / Weaviate |
| 파일 형식 | txt, md, csv | pdfjs-dist(PDF) / mammoth(DOCX) 추가 |
| LLM | GPT-4o-mini | 모델 선택 UI, Claude / Gemini 교체 가능 |
| 임베딩 | text-embedding-3-small | 모델 교체 또는 로컬 임베딩(transformers.js) |
| 인증 | 없음 | Supabase Auth / Firebase Auth 연동 |
| 세션 유지 | 메모리 (새로고침 시 초기화) | localStorage / IndexedDB 퍼시스턴스 |
| 백엔드 | 없음 (브라우저 직접 호출) | Express / FastAPI API 서버 프록시 도입 |
| 배포 | 정적 파일 호스팅 가능 | Vercel / Netlify / Docker 컨테이너 |
