// ─────────────────────────────────────────────
//  document.service.ts
//  파일 업로드 → 텍스트 추출 → 청킹 → 임베딩 저장
// ─────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid'
import { createEmbeddings } from './openai.service'
import { chunkText, addChunksToStore, removeDocumentFromStore } from './rag.service'
import type { DocumentChunk, RagDocument } from '@/types/document.types'

// ── 텍스트 추출 ────────────────────────────────

/**
 * 업로드된 File 객체에서 순수 텍스트를 추출합니다.
 * 현재 plain text / markdown 지원 (PDF는 별도 라이브러리 필요)
 */
async function extractText(file: File): Promise<string> {
  const supportedTextTypes = ['text/plain', 'text/markdown', 'text/csv']

  if (supportedTextTypes.includes(file.type) || file.name.endsWith('.md')) {
    return await file.text()
  }

  // PDF / DOCX 처리 예시 (pdfjs-dist / mammoth 연동 가능)
  throw new Error(`지원하지 않는 파일 형식: ${file.type}`)
}

// ── 문서 처리 파이프라인 ───────────────────────

/**
 * 파일을 받아 청킹 → 임베딩 → 벡터 스토어 저장까지 수행합니다.
 *
 * @param file         업로드된 File 객체
 * @param onProgress   진행률 콜백 (0~100)
 * @returns            생성된 RagDocument 메타데이터
 */
export async function processDocument(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<RagDocument> {
  const docId = uuidv4()
  onProgress?.(10)

  // 1. 텍스트 추출
  const rawText = await extractText(file)
  onProgress?.(30)

  // 2. 청킹
  const textChunks = chunkText(rawText)
  onProgress?.(50)

  // 3. 임베딩 (배치 처리 - OpenAI API 한도 고려)
  const BATCH_SIZE = 20
  const allEmbeddings: number[][] = []

  for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
    const batch = textChunks.slice(i, i + BATCH_SIZE)
    const embeddings = await createEmbeddings(batch)
    allEmbeddings.push(...embeddings)
    onProgress?.(50 + Math.floor((i / textChunks.length) * 40))
  }

  // 4. DocumentChunk 객체 생성 및 벡터 스토어에 저장
  const chunks: DocumentChunk[] = textChunks.map((content, idx) => ({
    id: uuidv4(),
    documentId: docId,
    content,
    embedding: allEmbeddings[idx],
    metadata: {
      startIndex: idx * 450, // 대략적인 문자 오프셋
      endIndex: idx * 450 + content.length,
    },
  }))

  addChunksToStore(chunks)
  onProgress?.(100)

  return {
    id: docId,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    status: 'ready',
    chunkCount: chunks.length,
    uploadedAt: new Date(),
  }
}

/**
 * 문서를 벡터 스토어에서 제거합니다.
 */
export function deleteDocument(documentId: string): void {
  removeDocumentFromStore(documentId)
}
