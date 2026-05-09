// ─────────────────────────────────────────────
//  rag.service.ts
//  Retrieval-Augmented Generation 핵심 로직
//  - 청킹 → 임베딩 → 유사도 검색 → 프롬프트 조립
// ─────────────────────────────────────────────

import { createEmbeddings } from './openai.service'
import type { DocumentChunk, ChunkingOptions } from '@/types/document.types'
import type { RetrievedSource } from '@/types/chat.types'

// ── 1. 텍스트 청킹 ──────────────────────────────

const DEFAULT_CHUNK_OPTIONS: ChunkingOptions = {
  chunkSize: 500,
  chunkOverlap: 50,
}

/**
 * 긴 텍스트를 일정 크기의 청크로 분할합니다.
 * 단어 경계를 기준으로 겹치는(overlap) 슬라이딩 윈도우 방식 사용.
 */
export function chunkText(
  text: string,
  options: ChunkingOptions = DEFAULT_CHUNK_OPTIONS,
): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  let start = 0

  while (start < words.length) {
    const end = Math.min(start + options.chunkSize, words.length)
    chunks.push(words.slice(start, end).join(' '))
    start += options.chunkSize - options.chunkOverlap
    if (start >= words.length) break
  }

  return chunks
}

// ── 2. 코사인 유사도 ───────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return normA && normB ? dot / (normA * normB) : 0
}

// ── 3. 인메모리 벡터 스토어 ────────────────────

let vectorStore: DocumentChunk[] = []

export function addChunksToStore(chunks: DocumentChunk[]): void {
  vectorStore = [...vectorStore, ...chunks]
}

export function removeDocumentFromStore(documentId: string): void {
  vectorStore = vectorStore.filter((c) => c.documentId !== documentId)
}

export function clearStore(): void {
  vectorStore = []
}

// ── 4. 유사도 검색 ─────────────────────────────

/**
 * 쿼리를 임베딩하여 벡터 스토어에서 가장 유사한 청크를 반환합니다.
 * @param query   사용자 질문
 * @param topK    반환할 최대 청크 수
 * @param threshold 최소 유사도 임계값 (0~1)
 */
export async function retrieveRelevantChunks(
  query: string,
  topK = 5,
  threshold = 0.3,
): Promise<RetrievedSource[]> {
  if (vectorStore.length === 0) return []

  const [queryEmbedding] = await createEmbeddings([query])

  const scored = vectorStore
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return scored.map(({ chunk, score }) => ({
    documentId: chunk.documentId,
    documentName: chunk.metadata?.pageNumber
      ? `(p.${chunk.metadata.pageNumber})`
      : chunk.documentId,
    chunk: chunk.content,
    score,
    pageNumber: chunk.metadata?.pageNumber,
  }))
}

// ── 5. RAG System Prompt 조립 ──────────────────

/**
 * 검색된 컨텍스트를 system prompt 형태로 포매팅합니다.
 */
export function buildSystemPrompt(sources: RetrievedSource[]): string {
  const basePrompt = `당신은 주어진 문서를 기반으로 정확하게 답변하는 AI 어시스턴트입니다.
아래 [참고 문서] 내용만을 활용하여 답변하세요.
문서에 없는 내용은 "해당 정보는 제공된 문서에 없습니다."라고 답하세요.`

  if (sources.length === 0) {
    return `${basePrompt}\n\n[참고 문서]\n없음`
  }

  const context = sources
    .map((s, i) => `[${i + 1}] ${s.documentName}\n${s.chunk}`)
    .join('\n\n')

  return `${basePrompt}\n\n[참고 문서]\n${context}`
}
