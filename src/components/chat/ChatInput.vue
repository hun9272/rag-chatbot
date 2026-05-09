<template>
  <div class="flex gap-2 items-end px-4 py-3 border-t border-border bg-card">
    <Textarea
      ref="textareaRef"
      v-model="inputText"
      class="flex-1 rounded-xl px-4 py-2.5 leading-relaxed font-[inherit] min-h-0"
      placeholder="질문을 입력하세요... (Shift+Enter: 줄바꿈)"
      :disabled="disabled"
      rows="1"
      @keydown.enter.exact.prevent="handleSend"
      @input="autoResize"
    />
    <Button
      size="icon"
      class="rounded-full flex-shrink-0 h-10 w-10 transition-transform hover:scale-105"
      :disabled="disabled || !inputText.trim()"
      @click="handleSend"
    >
      <span v-if="disabled" class="text-base">⏳</span>
      <SendHorizonal v-else class="h-4 w-4" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { SendHorizonal } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
}>()

const inputText = ref('')
const textareaRef = ref<{ $el: HTMLTextAreaElement } | null>(null)

function handleSend(): void {
  const text = inputText.value.trim()
  if (!text || props.disabled) return
  emit('send', text)
  inputText.value = ''
  nextTick(() => autoResize())
}

function autoResize(): void {
  const el = textareaRef.value?.$el
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`
}
</script>
