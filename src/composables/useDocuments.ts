// ─────────────────────────────────────────────
//  useDocuments.ts
//  문서 업로드/삭제 UI 로직을 담당하는 Composable
// ─────────────────────────────────────────────

import { useDocumentStore } from '@/stores/document.store'
import { processDocument, deleteDocument } from '@/services/document.service'
import { v4 as uuidv4 } from 'uuid'
import type { RagDocument } from '@/types/document.types'

export function useDocuments() {
  const store = useDocumentStore()

  /**
   * 파일 목록을 받아 순차적으로 처리합니다.
   * 각 파일의 진행 상태를 스토어를 통해 UI에 반영합니다.
   */
  async function uploadFiles(files: FileList | File[]): Promise<void> {
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const tempId = uuidv4()

      // 처리 중 상태로 먼저 목록에 추가
      const pending: RagDocument = {
        id: tempId,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        status: 'processing',
        uploadedAt: new Date(),
      }
      store.addDocument(pending)
      store.setProgress(tempId, 0)

      try {
        const result = await processDocument(file, (progress) => {
          store.setProgress(tempId, progress)
        })

        // tempId → 실제 id로 교체
        store.removeDocument(tempId)
        store.addDocument(result)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '처리 실패'
        store.updateDocument(tempId, { status: 'error', errorMessage: message })
      } finally {
        store.clearProgress(tempId)
      }
    }
  }

  /**
   * 문서를 스토어와 벡터 DB에서 제거합니다.
   */
  function removeDocument(docId: string): void {
    deleteDocument(docId)
    store.removeDocument(docId)
  }

  return {
    documents: store.documents,
    uploadProgress: store.uploadProgress,
    hasDocuments: store.hasDocuments,
    totalChunks: store.totalChunks,
    uploadFiles,
    removeDocument,
  }
}
