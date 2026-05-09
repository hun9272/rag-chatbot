// ─────────────────────────────────────────────
//  openai.service.ts
//  OpenAI Chat Completion & Embedding API 호출
// ─────────────────────────────────────────────

import OpenAI from 'openai'
import type { ChatCompletionRequest } from '@/types/chat.types'
import type { EmbeddingResponse, OpenAIConfig, StreamChunk } from '@/types/openai.types'

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다.')
    _client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  }
  return _client
}

export const defaultConfig: OpenAIConfig = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  model: 'gpt-4o-mini',
  embeddingModel: 'text-embedding-3-small',
  temperature: 0.2,
  maxTokens: 1024,
  stream: true,
}

// ── Chat Completion (스트리밍) ──────────────────

/**
 * 스트리밍 방식으로 Chat Completion을 요청합니다.
 * @param request  메시지 배열 + system prompt
 * @param onChunk  토큰 청크가 도착할 때마다 호출되는 콜백
 */
export async function streamChatCompletion(
  request: ChatCompletionRequest,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const client = getClient()

  const stream = await client.chat.completions.create({
    model: defaultConfig.model,
    temperature: request.temperature ?? defaultConfig.temperature,
    max_tokens: request.maxTokens ?? defaultConfig.maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: request.systemPrompt },
      ...request.messages,
    ],
  })

  for await (const chunk of stream) {
    const delta = (chunk as unknown as StreamChunk).choices[0]?.delta?.content
    if (delta) onChunk(delta)
  }
}

/**
 * 스트리밍 없이 단일 응답을 받습니다.
 */
export async function chatCompletion(request: ChatCompletionRequest): Promise<string> {
  const client = getClient()

  const response = await client.chat.completions.create({
    model: defaultConfig.model,
    temperature: request.temperature ?? defaultConfig.temperature,
    max_tokens: request.maxTokens ?? defaultConfig.maxTokens,
    stream: false,
    messages: [
      { role: 'system', content: request.systemPrompt },
      ...request.messages,
    ],
  })

  return response.choices[0]?.message?.content ?? ''
}

// ── Embeddings ─────────────────────────────────

/**
 * 텍스트 배열을 벡터로 임베딩합니다.
 * @param texts  임베딩할 텍스트 목록
 * @returns      각 텍스트에 대한 float32 벡터 배열
 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getClient()

  const response = (await client.embeddings.create({
    model: defaultConfig.embeddingModel,
    input: texts,
  })) as unknown as EmbeddingResponse

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding)
}
