<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { badgeVariants, type BadgeVariants } from '.'
import { cn } from '@/lib/utils'

defineProps<{
  class?: HTMLAttributes['class']
  variant?: BadgeVariants['variant']
}>()
</script>

<template>
  <div :class="cn(badgeVariants({ variant }), $attrs.class as string)">
    <slot />
  </div>
</template>
