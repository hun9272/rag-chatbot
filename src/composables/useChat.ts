// ─────────────────────────────────────────────
//  useChat.ts
//  채팅 입력 → RAG 검색 → OpenAI 스트리밍 응답
//  전체 파이프라인을 담당하는 Composable
// ─────────────────────────────────────────────

import { useChatStore } from '@/stores/chat.store'
import { useDocumentStore } from '@/stores/document.store'
import { retrieveRelevantChunks, buildSystemPrompt } from '@/services/rag.service'
import { streamChatCompletion } from '@/services/openai.service'
import type { RetrievedSource } from '@/types/chat.types'

export function useChat() {
  const chatStore = useChatStore()
  const docStore = useDocumentStore()

  /**
   * 사용자 메시지를 받아 RAG 검색 → 스트리밍 답변까지 처리합니다.
   * @param userInput  사용자가 입력한 질문 텍스트
   */
  async function sendMessage(userInput: string): Promise<void> {
    if (!userInput.trim()) return

    chatStore.setError(null)
    chatStore.setLoading(true)

    // 1. 세션이 없으면 자동 생성
    if (!chatStore.activeSession) {
      chatStore.createSession()
    }

    // 2. 사용자 메시지 추가
    chatStore.addMessage({ role: 'user', content: userInput })

    // 3. RAG 검색 (문서가 있을 때만)
    let sources: RetrievedSource[] = []
    if (docStore.hasDocuments) {
      sources = await retrieveRelevantChunks(userInput)
    }

    // 4. 시스템 프롬프트 조립
    const systemPrompt = buildSystemPrompt(sources)

    // 5. assistant 메시지 플레이스홀더 추가 (스트리밍용)
    const assistantMsg = chatStore.addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
      sources,
    })

    try {
      // 6. OpenAI 스트리밍 호출
      await streamChatCompletion(
        {
          systemPrompt,
          messages: chatStore.activeMessages
            .filter((m) => m.id !== assistantMsg.id)
            .map((m) => ({ role: m.role, content: m.content })),
        },
        (chunk) => {
          chatStore.appendToLastMessage(chunk)
        },
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      chatStore.setError(`응답 생성 실패: ${message}`)
      chatStore.appendToLastMessage('\n\n[오류가 발생했습니다]')
    } finally {
      chatStore.finalizeLastMessage()
      chatStore.setLoading(false)
    }
  }

  return {
    sendMessage,
    isLoading: chatStore.isLoading,
    error: chatStore.error,
  }
}
