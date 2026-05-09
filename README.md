# rag-chatbot

문서를 업로드하면 그 내용을 기반으로 AI와 대화할 수 있는 RAG(Retrieval-Augmented Generation) 챗봇입니다.  
순수 클라이언트 SPA로 별도의 백엔드 서버 없이 브라우저에서 OpenAI API를 직접 호출합니다.

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 목적 | 사용자가 업로드한 문서를 벡터화하여 관련 컨텍스트를 추출하고, 이를 기반으로 AI 답변을 생성 |
| 실행 환경 | 브라우저 전용 SPA (서버 불필요) |
| AI 모델 | OpenAI `text-embedding-ada-002` (임베딩), `gpt-4o-mini` (채팅 스트리밍) |
| 벡터 스토어 | 인메모리 (페이지 새로고침 시 초기화) |
| 지원 형식 | `.txt`, `.md`, `.csv` |

---

## 기술 스택

### 프론트엔드

| 기술 | 버전 | 역할 |
|------|------|------|
| Vue.js | 3.4 | UI 프레임워크 (Composition API / `<script setup>`) |
| TypeScript | 5.4 | 정적 타입 시스템 |
| Vite | 5.2 | 빌드 도구 및 개발 서버 |
| Pinia | 2.1 | 전역 상태 관리 (세션, 메시지, 업로드 진행률) |
| Vue Router | 4.3 | SPA 라우팅 |

### UI / 스타일

| 기술 | 버전 | 역할 |
|------|------|------|
| Tailwind CSS | v4 | 유틸리티 기반 CSS 프레임워크 |
| shadcn-vue (Radix Vue) | 1.9 | 접근성 기반 헤드리스 UI 컴포넌트 |
| Lucide Vue Next | 0.475 | 아이콘 라이브러리 |
| clsx / tailwind-merge | 최신 | 조건부 클래스 병합 유틸리티 |

### AI / 외부 서비스

| 기술 | 버전 | 역할 |
|------|------|------|
| OpenAI SDK | 4.47 | 임베딩 생성 및 스트리밍 채팅 완성 |

### 유틸리티

| 기술 | 버전 | 역할 |
|------|------|------|
| uuid | 9.0 | 문서 및 메시지 고유 ID 생성 |
| class-variance-authority | 0.7 | 컴포넌트 variant 스타일 정의 |

---

## 프로젝트 구조

```
rag-chatbot/
├── src/
│   ├── App.vue                          # 루트 컴포넌트 — 레이아웃 및 라우터 뷰 마운트
│   ├── main.ts                          # Vue 앱 초기화, Pinia·Router 플러그인 등록
│   ├── vite-env.d.ts                    # Vite 환경 변수 타입 선언
│   │
│   ├── assets/
│   │   └── main.css                     # Tailwind CSS 진입점 및 전역 스타일
│   │
│   ├── types/                           # 전 레이어 공유 순수 TypeScript 인터페이스
│   │   ├── chat.types.ts                # ChatMessage, ChatSession 타입
│   │   ├── document.types.ts            # RagDocument, DocumentChunk 타입
│   │   └── openai.types.ts              # OpenAI 요청/응답 래퍼 타입
│   │
│   ├── services/                        # Vue에 의존하지 않는 순수 비즈니스 로직
│   │   ├── document.service.ts          # 파일 → 텍스트 추출 → 청킹 → 임베딩 생성
│   │   ├── rag.service.ts               # 인메모리 벡터 스토어 관리, 코사인 유사도 검색
│   │   └── openai.service.ts            # OpenAI SDK 래퍼 (임베딩 API, 스트리밍 채팅 API)
│   │
│   ├── stores/                          # Pinia 스토어 — UI 상태 관리
│   │   ├── chat.store.ts                # 채팅 세션, 메시지 목록, 스트리밍 상태
│   │   └── document.store.ts            # 업로드된 문서 목록, 업로드 진행률
│   │
│   ├── composables/                     # stores + services를 컴포넌트에 연결하는 브릿지
│   │   ├── useChat.ts                   # sendMessage, 스트리밍 처리, RAG 컨텍스트 조합
│   │   └── useDocuments.ts              # uploadFiles, removeDocument, 진행률 관리
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInput.vue            # 메시지 입력창 (shadcn Textarea 래핑, Enter 전송)
│   │   │   ├── ChatMessage.vue          # 개별 메시지 말풍선 (role별 스타일 분기)
│   │   │   └── ChatWindow.vue           # 메시지 목록 + 타이핑 인디케이터
│   │   ├── document/
│   │   │   ├── DocumentUploader.vue     # 드래그앤드롭 파일 업로드 + 진행률 표시
│   │   │   └── DocumentList.vue         # 업로드된 문서 목록 및 삭제
│   │   └── ui/                          # shadcn-vue 기반 재사용 UI 원자 컴포넌트
│   │       ├── badge/                   # Badge 컴포넌트
│   │       ├── button/                  # Button 컴포넌트
│   │       ├── progress/                # Progress 바 컴포넌트
│   │       ├── scroll-area/             # ScrollArea 컴포넌트
│   │       └── textarea/                # Textarea 컴포넌트
│   │
│   ├── router/
│   │   └── index.ts                     # Vue Router 설정 (현재 ChatView 단일 라우트)
│   │
│   ├── lib/
│   │   └── utils.ts                     # cn() 유틸리티 (clsx + tailwind-merge)
│   │
│   └── views/
│       └── ChatView.vue                 # 메인 페이지 — 사이드바(문서) + 채팅 영역 레이아웃
│
├── .env.example                         # 환경 변수 템플릿
├── index.html                           # Vite SPA 진입 HTML
├── package.json                         # 의존성 및 npm 스크립트
├── tsconfig.json                        # TypeScript 컴파일러 설정
└── vite.config.ts                       # Vite 빌드 설정 (Tailwind CSS 플러그인 포함)
```

---

## 시작하기 (Getting Started)

### 사전 요구사항

- **Node.js** v18 이상 — [nodejs.org](https://nodejs.org/)
- **OpenAI API 키** — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/hun9272/rag-chatbot.git
cd rag-chatbot

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (아래 '환경 변수 설정' 섹션 참고)
cp .env.example .env

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.

### 주요 명령어

```bash
npm run dev          # 개발 서버 실행 (HMR 포함)
npm run build        # vue-tsc 타입 검사 후 프로덕션 빌드
npm run type-check   # 타입 검사만 실행 (빌드 없음)
npm run preview      # 프로덕션 빌드 결과 미리보기
```

---

## 환경 변수 설정

프로젝트 루트의 `.env.example`을 복사하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

`.env` 파일을 열고 OpenAI API 키를 입력합니다.

```env
# .env
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `VITE_OPENAI_API_KEY` | ✅ | OpenAI API 인증 키. `VITE_` 접두사가 있어야 Vite가 브라우저에 노출합니다. |

> **주의**: 이 키는 브라우저 번들에 포함됩니다(`dangerouslyAllowBrowser: true`).  
> 개발·학습 목적 외 프로덕션 배포 시 서버 프록시를 통해 키를 보호하세요.

---

## 백엔드 연동 구조

이 프로젝트는 **별도의 백엔드 서버가 없습니다.**  
브라우저가 OpenAI API를 직접 호출하는 순수 클라이언트 SPA 구조입니다.

```
┌─────────────────────────────────────┐
│           브라우저 (SPA)             │
│                                     │
│  DocumentUploader                   │
│       │ 파일 선택                    │
│       ▼                             │
│  document.service                   │
│       │ 텍스트 추출 → 청킹           │
│       ▼                             │
│  openai.service ──────────────────────────► OpenAI API
│  (createEmbeddings)                 │       text-embedding-ada-002
│       │ 임베딩 벡터 수신             │◄──────────────────────────────
│       ▼                             │
│  rag.service                        │
│  (인메모리 vectorStore)              │
│       │                             │
│  ChatInput → useChat.sendMessage    │
│       │ 질문 임베딩 생성             │
│       │ 코사인 유사도 검색 (Top-5)   │
│       │ 시스템 프롬프트 조합         │
│       ▼                             │
│  openai.service ──────────────────────────► OpenAI API
│  (streamChatCompletion)             │       gpt-4o-mini (SSE)
│       │ 토큰 스트림 수신             │◄──────────────────────────────
│       ▼                             │
│  chatStore.appendToLastMessage      │
│  ChatWindow (실시간 렌더링)          │
└─────────────────────────────────────┘
```

### RAG 파이프라인 상세

**문서 처리 흐름**

```
파일 업로드
  → extractText()          파일 형식별 텍스트 추출 (.txt / .md / .csv)
  → chunkText()            슬라이딩 윈도우 청킹 (500단어, 50단어 overlap)
  → createEmbeddings()     OpenAI 임베딩 API (20개씩 배치 처리)
  → rag.service.addChunksToStore()   모듈 레벨 배열에 저장
```

**채팅 흐름**

```
사용자 입력
  → 질문 임베딩 생성 (text-embedding-ada-002)
  → retrieveRelevantChunks()   코사인 유사도, Top-5, 임계값 0.3
  → buildSystemPrompt()        검색된 청크를 컨텍스트로 주입
  → streamChatCompletion()     gpt-4o-mini SSE 스트리밍
  → chatStore.appendToLastMessage()   토큰 단위 실시간 렌더링
```

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **문서 업로드** | `.txt`, `.md`, `.csv` 파일을 드래그앤드롭 또는 파일 선택으로 업로드 |
| **텍스트 청킹** | 슬라이딩 윈도우 방식으로 500단어 청크, 50단어 overlap 적용 |
| **벡터 임베딩** | OpenAI `text-embedding-ada-002` 모델로 청크별 임베딩 벡터 생성 |
| **의미 검색** | 질문과 문서 청크 간 코사인 유사도 계산, 임계값 0.3 이상 Top-5 반환 |
| **스트리밍 응답** | `gpt-4o-mini` SSE 스트리밍으로 토큰 단위 실시간 응답 렌더링 |
| **업로드 진행률** | 임베딩 생성 중 Progress 바로 실시간 진행률 표시 |
| **다중 문서** | 여러 문서를 동시에 업로드하여 통합 검색 가능 |
| **문서 관리** | 업로드된 문서 목록 확인 및 개별 삭제 |

### 설계 제약 사항

- **인메모리 스토어**: 벡터 데이터는 `rag.service.ts`의 모듈 레벨 변수에 저장되어 **페이지 새로고침 시 초기화**됩니다.
- **문서 ID 교체**: 업로드 중 임시 UUID로 스토어에 먼저 등록한 뒤, 처리 완료 후 실제 UUID로 교체됩니다.
- **타이핑 인디케이터**: `isLoading && !hasStreamingMessage` 조건일 때만 표시되어 스트리밍 중 이중 피드백을 방지합니다.
