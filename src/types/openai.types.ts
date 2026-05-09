// ─────────────────────────────────────────────
//  openai.types.ts
//  OpenAI API 응답/요청 관련 타입 정의
// ─────────────────────────────────────────────

export type OpenAIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'

export type EmbeddingModel =
  | 'text-embedding-3-small'
  | 'text-embedding-3-large'
  | 'text-embedding-ada-002'

export interface OpenAIConfig {
  apiKey: string
  model: OpenAIModel
  embeddingModel: EmbeddingModel
  temperature: number
  maxTokens: number
  stream: boolean
}

/** SSE 스트리밍 델타 청크 */
export interface StreamChunk {
  id: string
  choices: Array<{
    delta: {
      content?: string
      role?: string
    }
    finish_reason: string | null
    index: number
  }>
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[]
    index: number
  }>
  model: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}
