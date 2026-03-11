import { streamText } from 'ai'
import { getAIInstance } from '@/lib/ai-instances'

export async function POST(request: Request) {
  // 接收 messages含系统提示+历史）
  const body = await request.json()
  const { messages } = body
  console.log('received messages:', JSON.stringify(messages))

  if (!messages || messages.length === 0) {
    return new Response('messages required', { status: 400 })
  }

  // 获取 AI 实例 
  const instance = getAIInstance()
  if (instance == null) {
    return new Response('No AI instance available', { status: 503 })
  }

  console.log(`[ai-instances] using: ${instance.key.slice(0, 20)}***`)

  try {
    // 向大模型发起流式请求
    const result = streamText({
      model: instance.provider(instance.model),
      messages,
      maxOutputTokens: 600,
      // onFinish 获取 token 用量
      onFinish({ usage }) {
        console.log('[onFinish] usage:', usage)
      },
      // 流内错误时标记实例故障，确保后续请求切换实例
      onError({ error }) {
        instance.isError = true
        console.error(`[ai-instances] stream error on ${instance.key.slice(0, 20)}***:`, error)
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (err: any) {
    // 故障转移，标记当前实例异常
    instance.isError = true
    console.error(`[ai-instances] error on ${instance.key.slice(0, 20)}***:`, err.message)
    return new Response(err.message, { status: 500 })
  }
}
