<template>
  <div class="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm">

    <!-- 메시지 목록 -->
    <div ref="scrollEl" class="flex-1 overflow-y-auto py-4 scroll-smooth">
      <div
        v-if="messages.length === 0"
        class="flex items-center justify-center h-full text-gray-400 text-base"
      >
        <p>📄 문서를 업로드하고 질문해보세요!</p>
      </div>

      <ChatMessage
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      />

      <!-- 타이핑 인디케이터 -->
      <div
        v-if="isLoading && !hasStreamingMessage"
        class="flex gap-1.5 px-4 py-3 pl-16"
      >
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      </div>
    </div>

    <!-- 에러 배너 -->
    <div
      v-if="error"
      class="bg-red-50 text-red-600 px-4 py-2 text-sm border-t border-red-200"
    >
      ⚠️ {{ error }}
    </div>

    <!-- 입력창 -->
    <ChatInput :disabled="isLoading" @send="onSend" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat.store'
import { useChat } from '@/composables/useChat'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

const chatStore = useChatStore()
const { activeMessages: messages, isLoading, error } = storeToRefs(chatStore)
const { sendMessage } = useChat()

const scrollEl = ref<HTMLElement | null>(null)

const hasStreamingMessage = computed(() =>
  messages.value.some((m) => m.isStreaming),
)

async function onSend(text: string): Promise<void> {
  await sendMessage(text)
}

watch(
  messages,
  async () => {
    await nextTick()
    if (scrollEl.value) {
      scrollEl.value.scrollTop = scrollEl.value.scrollHeight
    }
  },
  { deep: true },
)
</script>
