<template>
  <div
    class="border-2 border-dashed rounded-xl transition-colors duration-150 cursor-pointer"
    :class="isDragging
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-300 hover:border-gray-400'"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <input
      ref="fileInput"
      type="file"
      multiple
      accept=".txt,.md,.csv"
      class="hidden"
      @change="onFileChange"
    />

    <div class="flex flex-col items-center gap-1.5 p-6 text-gray-500 text-center select-none">
      <span class="text-3xl">📂</span>
      <p class="m-0 text-sm font-medium">파일을 드래그하거나 클릭해서 업로드</p>
      <small class="text-xs text-gray-400">지원 형식: .txt, .md, .csv</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDocuments } from '@/composables/useDocuments'

const { uploadFiles } = useDocuments()
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function onFileChange(e: Event): Promise<void> {
  const files = (e.target as HTMLInputElement).files
  if (files) await uploadFiles(files)
}

async function onDrop(e: DragEvent): Promise<void> {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) await uploadFiles(files)
}
</script>
