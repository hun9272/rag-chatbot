<script setup lang="ts">
import { ProgressRoot, ProgressIndicator } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  modelValue?: number
  max?: number
}>()
</script>

<template>
  <ProgressRoot
    :class="cn('relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20', props.class)"
    :model-value="modelValue ?? 0"
    :max="max ?? 100"
  >
    <ProgressIndicator
      class="h-full w-full flex-1 bg-primary transition-all duration-300"
      :style="`transform: translateX(-${100 - (modelValue ?? 0)}%)`"
    />
  </ProgressRoot>
</template>
