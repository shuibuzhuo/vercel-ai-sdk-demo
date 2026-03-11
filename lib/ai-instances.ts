import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

interface AIInstance {
  provider: ReturnType<typeof createOpenAICompatible>
  model: string
  key: string
  isError: boolean
}

// AI 实例列表
const instanceList: AIInstance[] = [
  {
    provider: createOpenAICompatible({
      name: 'deepseek',
      apiKey: process.env.DEEP_SEEK_API_KEY || '',
      baseURL: 'https://api.deepseek.com',
    }),
    model: 'deepseek-chat',
    key: process.env.DEEP_SEEK_API_KEY || '',
    isError: false,
  },
  {
    provider: createOpenAICompatible({
      name: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseURL: 'https://openrouter.ai/api/v1',
    }),
    model: 'z-ai/glm-4-32b',
    key: process.env.OPENROUTER_API_KEY || '',
    isError: false,
  },
]

let index = 0

// 轮询获取可用实例，跳过报错实例
export function getAIInstance(): AIInstance | null {
  const total = instanceList.length
  for (let i = 0; i < total; i++) {
    const candidate = instanceList[index % total]
    index++
    if (!candidate.isError) return candidate
  }
  // 全部报错时重置，避免永久不可用
  instanceList.forEach((ins) => (ins.isError = false))
  index = 0
  return instanceList[0] ?? null
}
