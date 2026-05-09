<template>
  <div
    class="flex gap-3 px-4 py-2 items-start"
    :class="message.role === 'user' ? 'flex-row-reverse' : ''"
  >
    <!-- 아바타 -->
    <div class="text-2xl flex-shrink-0">
      <span v-if="message.role === 'user'">👤</span>
      <span v-else>🤖</span>
    </div>

    <!-- 말풍선 -->
    <div
      class="max-w-[70%] px-4 py-3 rounded-2xl relative"
      :class="
        message.role === 'user'
          ? 'bg-blue-500 text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      "
    >
      <p class="m-0 whitespace-pre-wrap leading-relaxed">{{ message.content }}</p>

      <!-- 스트리밍 커서 -->
      <span v-if="message.isStreaming" class="animate-blink">▌</span>

      <!-- 참조 소스 목록 -->
      <div
        v-if="message.sources && message.sources.length > 0"
        class="mt-3 pt-2 border-t border-black/10 text-xs"
      >
        <p class="font-semibold m-0 mb-1">📎 참조 문서</p>
        <ul class="m-0 pl-4">
          <li
            v-for="(src, i) in message.sources"
            :key="i"
            class="flex justify-between gap-2"
          >
            <span>{{ src.documentName }}</span>
            <span :class="message.role === 'user' ? 'text-blue-200' : 'text-gray-400'">
              {{ (src.score * 100).toFixed(1) }}%
            </span>
          </li>
        </ul>
      </div>

      <!-- 타임스탬프 -->
      <time
        class="block text-[0.65rem] mt-1.5 text-right"
        :class="message.role === 'user' ? 'text-white/70' : 'text-gray-400'"
      >
        {{ formattedTime }}
      </time>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '@/types/chat.types'

const props = defineProps<{
  message: ChatMessage
}>()

const formattedTime = computed(() => {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(props.message.timestamp))
})
</script>
