<template>
  <div class="grid h-screen gap-4 p-4 bg-gray-100
              grid-cols-[300px_1fr]
              max-md:grid-cols-1 max-md:grid-rows-[auto_1fr]">

    <!-- 사이드바: 문서 관리 -->
    <aside class="flex flex-col gap-3 overflow-hidden">
      <header class="flex items-center justify-between px-1">
        <h2 class="m-0 text-base font-semibold text-gray-800">📚 문서 관리</h2>
        <Badge v-if="totalChunks > 0" variant="secondary" class="text-blue-700 bg-blue-100 border-transparent">
          {{ totalChunks.toLocaleString() }} 청크
        </Badge>
      </header>

      <DocumentUploader />
      <DocumentList class="flex-1 overflow-y-auto" />
    </aside>

    <!-- 메인: 채팅 -->
    <main class="flex flex-col gap-3 min-h-0">
      <header class="px-1">
        <h1 class="m-0 text-xl font-bold text-gray-900">💬 RAG 챗봇</h1>
        <small class="text-gray-500 text-sm">OpenAI GPT-4o-mini + 문서 기반 응답</small>
      </header>

      <ChatWindow class="flex-1 min-h-0" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useDocuments } from '@/composables/useDocuments'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import DocumentUploader from '@/components/document/DocumentUploader.vue'
import DocumentList from '@/components/document/DocumentList.vue'
import { Badge } from '@/components/ui/badge'

const { totalChunks } = useDocuments()
</script>
