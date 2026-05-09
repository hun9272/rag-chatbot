import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind 클래스를 안전하게 병합하는 유틸리티.
 * - clsx: 조건부 클래스 조합
 * - twMerge: 충돌하는 Tailwind 클래스 자동 해결 (예: px-2 + px-4 → px-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
