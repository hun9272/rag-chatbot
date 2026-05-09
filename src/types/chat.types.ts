// ─────────────────────────────────────────────
//  chat.types.ts
//  채팅 도메인 관련 타입 정의
// ─────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  /** RAG 검색 결과에서 참조된 소스 목록 */
  sources?: RetrievedSource[]
  /** 스트리밍 응답 진행 여부 */
  isStreaming?: boolean
}

export interface RetrievedSource {
  documentId: string
  documentName: string
  /** 원문에서 추출된 관련 청크 */
  chunk: string
  /** 코사인 유사도 등 유사도 점수 (0~1) */
  score: number
  pageNumber?: number
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatCompletionRequest {
  messages: Pick<ChatMessage, 'role' | 'content'>[]
  /** 검색된 컨텍스트를 주입한 system prompt */
  systemPrompt: string
  stream?: boolean
  temperature?: number
  maxTokens?: number
}
