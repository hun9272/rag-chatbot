# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```bash
npm run dev          # 개발 서버 실행 (http://localhost:5173)
npm run build        # vue-tsc 타입 검사 후 Vite 프로덕션 빌드
npm run type-check   # 타입 검사만 실행 (빌드 없음)
npm run preview      # 프로덕션 빌드 미리보기
```

실행 전 `.env.example`을 복사해 `.env`를 만들고 `VITE_OPENAI_API_KEY`를 설정해야 합니다.

## 아키텍처

**스택**: Vue 3 (Composition API) + TypeScript + Pinia + Vite + Tailwind CSS v4 + shadcn-vue UI 컴포넌트  
**런타임**: 순수 클라이언트 SPA — 백엔드 없음. OpenAI API를 브라우저에서 직접 호출 (`dangerouslyAllowBrowser: true`). 벡터 데이터는 메모리에만 존재하며 페이지 새로고침 시 초기화됩니다.

### 레이어별 역할

```
types/          모든 레이어가 공유하는 순수 TypeScript 인터페이스
services/       Vue에 의존하지 않는 순수 비즈니스 로직
stores/         Pinia: UI 상태 관리 (세션, 메시지, 업로드 진행률)
composables/    stores + services를 Vue 컴포넌트에 연결하는 브릿지
views/          페이지 레이아웃 (현재 ChatView 하나만 존재)
components/     composable을 사용하는 UI 컴포넌트
```

### RAG 데이터 흐름

**문서 업로드**
`DocumentUploader` → `useDocuments.uploadFiles()` → `document.service.processDocument()` → `extractText` → `chunkText` (슬라이딩 윈도우, 500단어, 50 overlap) → `createEmbeddings` (20개씩 배치 처리) → `rag.service.addChunksToStore()` (모듈 레벨 배열에 저장)

**채팅**
`ChatInput` → `useChat.sendMessage()` → `retrieveRelevantChunks()` (코사인 유사도, Top-5, 임계값 0.3) → `buildSystemPrompt()` → `streamChatCompletion()` → SSE 토큰마다 `chatStore.appendToLastMessage(chunk)` 호출

### 주요 설계 제약

- `rag.service.ts`의 인메모리 벡터 스토어는 모듈 레벨 변수(`let vectorStore: DocumentChunk[]`)입니다. 모든 컴포넌트 인스턴스가 공유하며 페이지 세션 동안만 유지됩니다.
- `document.service.ts`는 문서 처리 중에 임시 UUID로 `RagDocument`를 먼저 스토어에 추가하고, 처리 완료 후 실제 문서(새 UUID)로 교체합니다. 컴포넌트는 이 ID 교체를 고려해야 합니다.
- 스트리밍은 `ChatMessage`의 `isStreaming: boolean` 플래그로 관리합니다. `ChatWindow`의 타이핑 인디케이터는 `isLoading && !hasStreamingMessage` 조건일 때만 표시되어 이중 피드백을 방지합니다.
- `ChatInput.vue`는 shadcn `Textarea` 컴포넌트를 감싸고 있어 `textareaRef.value?.$el`로 실제 DOM `<textarea>` 요소에 접근합니다.

### 지원 파일 형식

`.txt`, `.md`, `.csv` — MIME 타입 또는 `.md` 확장자로 판별합니다. PDF/DOCX 지원은 `document.service.ts`의 `extractText()` 함수에 `pdfjs-dist` / `mammoth` 라이브러리 연동이 필요합니다.
