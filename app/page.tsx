'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'

export default function Page() {
  const [input, setInput] = useState('')

  // 使用 useChat hook 接收流式数据
  const { messages, sendMessage, stop, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      // 通过 prepareSendMessagesRequest 完全控制请求体
      // 只传 promptMessages（ModelMessage[] 格式），不让 transport 自动注入 messages（UIMessage[] 格式）
      prepareSendMessagesRequest(request) {
        const messages = [
          { role: 'system', content: '你是一个简洁的助手，回复不超过100字。' },
          ...request.messages.flatMap((m) =>
            m.parts
              .filter((p) => p.type === 'text')
              .map((p) => ({ role: m.role, content: (p as any).text as string }))
          ),
        ]
        return {
          body: { messages }, // ModelMessage[] 格式（{ role, content }）
        }
      },
    }),
    onFinish(event) {
      console.log('[useChat onFinish]', event)
    },
  })

  function handleSend() {
    if (!input.trim()) return
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] })
    setInput('')
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'monospace' }}>
      <h2>Vercel AI SDK Demo</h2>

      {/* 消息列表 */}
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: 16,
          minHeight: 200,
          marginBottom: 16,
          whiteSpace: 'pre-wrap',
        }}
      >
        {messages.length === 0 && <span style={{ color: '#999' }}>发送消息开始对话...</span>}
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 12 }}>
            <strong>{m.role === 'user' ? '你' : 'AI'}：</strong>
            {m.parts
              .filter((p) => p.type === 'text')
              .map((p, i) => (
                <span key={i}>{(p as any).text}</span>
              ))}
          </div>
        ))}
      </div>

      {/* 输入区 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button
          onClick={handleSend}
          disabled={status === 'streaming'}
          style={{ padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
        >
          发送
        </button>
        <button
          onClick={stop}
          disabled={status !== 'streaming'}
          style={{ padding: '8px 16px', borderRadius: 6, cursor: 'pointer', color: 'red' }}
        >
          中止
        </button>
      </div>

      {/* 状态显示 */}
      <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        <span>状态：{status}</span>
        <span style={{ marginLeft: 16, color: '#999' }}>
          usage 在后端 console 查看 [onFinish] usage
        </span>
      </div>
    </div>
  )
}
