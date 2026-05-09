// ─────────────────────────────────────────────
//  document.store.ts  (Pinia)
//  업로드된 RAG 문서 목록 전역 상태 관리
// ─────────────────────────────────────────────

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RagDocument } from '@/types/document.types'

export const useDocumentStore = defineStore('document', () => {
  // ── State ──────────────────────────────────
  const documents = ref<RagDocument[]>([])
  const uploadProgress = ref<Record<string, number>>({})

  // ── Getters ────────────────────────────────
  const readyDocuments = computed(() =>
    documents.value.filter((d) => d.status === 'ready'),
  )

  const totalChunks = computed(() =>
    documents.value.reduce((sum, d) => sum + (d.chunkCount ?? 0), 0),
  )

  const hasDocuments = computed(() => readyDocuments.value.length > 0)

  // ── Actions ────────────────────────────────

  function addDocument(doc: RagDocument): void {
    documents.value.unshift(doc)
  }

  function updateDocument(id: string, patch: Partial<RagDocument>): void {
    const idx = documents.value.findIndex((d) => d.id === id)
    if (idx !== -1) {
      documents.value[idx] = { ...documents.value[idx], ...patch }
    }
  }

  function removeDocument(id: string): void {
    documents.value = documents.value.filter((d) => d.id !== id)
    delete uploadProgress.value[id]
  }

  function setProgress(docId: string, progress: number): void {
    uploadProgress.value[docId] = progress
  }

  function clearProgress(docId: string): void {
    delete uploadProgress.value[docId]
  }

  return {
    documents,
    uploadProgress,
    readyDocuments,
    totalChunks,
    hasDocuments,
    addDocument,
    updateDocument,
    removeDocument,
    setProgress,
    clearProgress,
  }
})
