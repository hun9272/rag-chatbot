<template>
  <ScrollArea class="h-full">
    <div class="pr-3">
      <p
        v-if="documents.length === 0"
        class="p-4 text-muted-foreground text-sm text-center"
      >
        업로드된 문서가 없습니다.
      </p>

      <ul v-else class="list-none m-0 p-0 flex flex-col gap-2">
        <li
          v-for="doc in documents"
          :key="doc.id"
          class="flex flex-col gap-1.5 px-3 py-2.5 bg-secondary rounded-lg border border-border relative"
        >
          <!-- 문서 정보 -->
          <div class="flex items-start gap-2 pr-7">
            <span class="text-base flex-shrink-0 leading-none mt-0.5">{{ statusIcon(doc.status) }}</span>
            <div class="min-w-0">
              <p
                class="m-0 text-sm font-medium break-all leading-snug"
                :class="doc.status === 'error' ? 'text-destructive' : 'text-foreground'"
              >
                {{ doc.name }}
              </p>
              <small class="text-muted-foreground text-xs">
                {{ formatSize(doc.size) }}
                <template v-if="doc.chunkCount"> · {{ doc.chunkCount }}개 청크</template>
              </small>
            </div>
          </div>

          <!-- 진행 바 (shadcn Progress) -->
          <Progress
            v-if="doc.status === 'processing' && uploadProgress[doc.id] !== undefined"
            :model-value="uploadProgress[doc.id]"
          />

          <!-- 삭제 버튼 (shadcn Button ghost + icon) -->
          <Button
            v-if="doc.status === 'ready' || doc.status === 'error'"
            variant="ghost"
            size="icon"
            class="absolute top-1.5 right-1.5 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="삭제"
            @click="removeDocument(doc.id)"
          >
            <X class="h-3 w-3" />
          </Button>
        </li>
      </ul>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useDocuments } from '@/composables/useDocuments'
import type { DocumentStatus } from '@/types/document.types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

const { documents, uploadProgress, removeDocument } = useDocuments()

function statusIcon(status: DocumentStatus): string {
  const icons: Record<DocumentStatus, string> = {
    pending: '⏳',
    processing: '⚙️',
    ready: '✅',
    error: '❌',
  }
  return icons[status]
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
