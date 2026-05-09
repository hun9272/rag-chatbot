<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

defineProps<{
  class?: HTMLAttributes['class']
  modelValue?: string | number
}>()

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <textarea
    v-bind="$attrs"
    :class="cn(
      'flex w-full rounded-md border border-input bg-transparent px-3 py-2',
      'text-sm shadow-sm placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'resize-none transition-colors duration-150',
      $props.class,
    )"
  />
</template>
