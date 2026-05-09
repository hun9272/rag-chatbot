// ─────────────────────────────────────────────
//  document.types.ts
//  RAG 문서 도메인 관련 타입 정의
// ─────────────────────────────────────────────

export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'error'

export interface RagDocument {
  id: string
  name: string
  size: number
  mimeType: string
  status: DocumentStatus
  /** 임베딩 완료된 청크 수 */
  chunkCount?: number
  uploadedAt: Date
  errorMessage?: string
}

export interface DocumentChunk {
  id: string
  documentId: string
  content: string
  /** 텍스트 임베딩 벡터 (OpenAI text-embedding-3-small 등) */
  embedding: number[]
  metadata: {
    pageNumber?: number
    startIndex: number
    endIndex: number
  }
}

export interface DocumentUploadPayload {
  file: File
}

export interface ChunkingOptions {
  /** 청크당 최대 토큰 수 */
  chunkSize: number
  /** 인접 청크 간 겹치는 토큰 수 */
  chunkOverlap: number
}
