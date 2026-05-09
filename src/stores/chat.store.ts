// ─────────────────────────────────────────────
//  chat.store.ts  (Pinia)
//  채팅 세션 및 메시지 전역 상태 관리
// ─────────────────────────────────────────────

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { ChatMessage, ChatSession } from '@/types/chat.types'

export const useChatStore = defineStore('chat', () => {
  // ── State ──────────────────────────────────
  const sessions = ref<ChatSession[]>([])
  const activeSessionId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ── Getters ────────────────────────────────
  const activeSession = computed<ChatSession | undefined>(() =>
    sessions.value.find((s) => s.id === activeSessionId.value),
  )

  const activeMessages = computed<ChatMessage[]>(
    () => activeSession.value?.messages ?? [],
  )

  // ── Actions ────────────────────────────────

  /** 새 세션 생성 후 활성화 */
  function createSession(title = '새 대화'): ChatSession {
    const session: ChatSession = {
      id: uuidv4(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    sessions.value.unshift(session)
    activeSessionId.value = session.id
    return session
  }

  /** 세션 전환 */
  function switchSession(sessionId: string): void {
    activeSessionId.value = sessionId
  }

  /** 세션 삭제 */
  function deleteSession(sessionId: string): void {
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
    if (activeSessionId.value === sessionId) {
      activeSessionId.value = sessions.value[0]?.id ?? null
    }
  }

  /** 메시지 추가 */
  function addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    if (!activeSession.value) createSession()

    const newMsg: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    }

    activeSession.value!.messages.push(newMsg)
    activeSession.value!.updatedAt = new Date()

    // 첫 user 메시지로 세션 제목 자동 설정
    if (
      message.role === 'user' &&
      activeSession.value!.messages.length === 1
    ) {
      activeSession.value!.title =
        message.content.slice(0, 40) + (message.content.length > 40 ? '…' : '')
    }

    return newMsg
  }

  /** 스트리밍 중 마지막 assistant 메시지 내용 갱신 */
  function appendToLastMessage(delta: string): void {
    const messages = activeSession.value?.messages
    if (!messages) return
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant') {
      last.content += delta
    }
  }

  /** 스트리밍 완료 후 isStreaming 플래그 해제 */
  function finalizeLastMessage(): void {
    const messages = activeSession.value?.messages
    if (!messages) return
    const last = messages[messages.length - 1]
    if (last) last.isStreaming = false
  }

  function setLoading(val: boolean): void {
    isLoading.value = val
  }

  function setError(msg: string | null): void {
    error.value = msg
  }

  return {
    sessions,
    activeSessionId,
    isLoading,
    error,
    activeSession,
    activeMessages,
    createSession,
    switchSession,
    deleteSession,
    addMessage,
    appendToLastMessage,
    finalizeLastMessage,
    setLoading,
    setError,
  }
})
