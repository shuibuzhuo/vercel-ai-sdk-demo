# Vercel AI SDK Demo

基于 [Vercel AI SDK](https://sdk.vercel.ai) 的流式对话 Demo，使用 Next.js App Router + `useChat` + 多模型实例轮询与故障转移。

## 功能特性

- **流式对话**：使用 `streamText` + `toUIMessageStreamResponse()` 实现流式输出
- **useChat 集成**：`@ai-sdk/react` 的 `useChat` + `DefaultChatTransport`，支持自定义请求体
- **多模型实例**：DeepSeek / OpenRouter 轮询，单实例报错时自动切换
- **请求体定制**：通过 `prepareSendMessagesRequest` 将 UIMessage 转为 ModelMessage 格式

## 技术栈

- Next.js 16 (App Router)
- React 19
- Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`)

## 项目结构

```
vercel-ai-sdk-demo/
├── app/
│   ├── page.tsx          # 聊天界面，useChat + 消息列表
│   └── api/chat/route.ts  # 流式对话 API
├── lib/
│   └── ai-instances.ts    # 多实例轮询与故障转移
└── .env.local.example     # 环境变量模板
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
# 或 npm install / yarn
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，并填入 API Key：

```bash
cp .env.local.example .env.local
```

| 变量 | 说明 |
|------|------|
| `DEEP_SEEK_API_KEY` | DeepSeek API Key（主实例） |
| `OPENROUTER_API_KEY` | OpenRouter API Key（备用实例） |

### 3. 启动开发服务

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始对话。

## 核心实现

### 多实例轮询 (`lib/ai-instances.ts`)

- 维护 DeepSeek、OpenRouter 等实例列表
- 轮询选择可用实例，跳过 `isError` 为 true 的实例
- 流式请求出错时标记当前实例故障，下次请求自动切换
- 全部故障时重置状态，避免永久不可用

### 自定义请求体 (`app/page.tsx`)

通过 `prepareSendMessagesRequest` 将前端 `UIMessage`（含 `parts`）转为后端期望的 `ModelMessage[]`（`{ role, content }`），并注入系统提示词。

### Token 用量

`onFinish` 回调中的 `usage` 会在服务端 console 输出，便于监控 token 消耗。

## 相关链接

- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [部署到 Vercel](https://vercel.com/new)
