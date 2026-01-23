'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, RefreshCw, Trash2, Settings2, ChevronDown, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Model {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

// 常用模型列表（当 API 不可用时使用）
const DEFAULT_MODELS: Model[] = [
  { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 (Free)' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free)' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-r1-0528:free');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [temperature, setTemperature] = useState(0.7);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载模型列表
  const loadModels = async () => {
    setIsLoadingModels(true);
    setError(null);
    try {
      const response = await fetch('/api/openrouter/models');
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setModels(data.data);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load models');
      }
    } catch (error: any) {
      console.error('Failed to load models:', error);
      setError('Failed to load models: ' + error.message);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  // 生成消息 ID
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // 停止生成
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 创建助手消息占位
    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // 创建 AbortController
    abortControllerRef.current = new AbortController();

    try {
      // 构建消息历史
      const chatMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userMessage.content },
      ];

      const response = await fetch('/api/openrouter/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: chatMessages,
          stream: true,
          temperature,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              if (!data) continue;

              try {
                const parsed = JSON.parse(data);

                // 检查是否有错误
                if (parsed.error) {
                  throw new Error(parsed.error.message || parsed.error);
                }

                // 获取内容 - SDK 返回的结构
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullContent += content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: fullContent }
                        : m
                    )
                  );
                }
              } catch (parseError: any) {
                // 如果是 JSON 解析错误，忽略
                if (parseError.message?.includes('JSON')) {
                  continue;
                }
                throw parseError;
              }
            }
          }
        }
      }

      // 如果没有收到任何内容，更新消息显示提示
      if (!fullContent) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: '(No response received)' }
              : m
          )
        );
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: m.content + '\n\n(Generation stopped)' }
              : m
          )
        );
      } else {
        console.error('Chat error:', error);
        setError(error.message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: `Error: ${error.message}` }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 清空对话
  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  // 格式化模型名称
  const formatModelName = (model: Model) => {
    if (model.name) return model.name;
    const parts = model.id.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-base-100 rounded-xl border border-base-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">AI Chat</h2>
            <p className="text-xs text-base-content/60">Powered by OpenRouter</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-sm btn-ghost gap-2 font-normal"
            >
              <span className="max-w-[150px] truncate text-xs">
                {formatModelName(models.find((m) => m.id === selectedModel) || { id: selectedModel, name: selectedModel })}
              </span>
              <ChevronDown className="w-4 h-4" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-xl w-72 max-h-96 overflow-y-auto border border-base-300"
            >
              <li className="menu-title text-xs">选择模型</li>
              {isLoadingModels ? (
                <li className="p-4 text-center">
                  <span className="loading loading-spinner loading-sm"></span>
                </li>
              ) : (
                models.slice(0, 50).map((model) => (
                  <li key={model.id}>
                    <button
                      onClick={() => setSelectedModel(model.id)}
                      className={`text-sm ${selectedModel === model.id ? 'active' : ''}`}
                    >
                      <span className="truncate">{formatModelName(model)}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`btn btn-sm btn-ghost btn-square ${showSettings ? 'btn-active' : ''}`}
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Refresh Models */}
          <button
            onClick={loadModels}
            className="btn btn-sm btn-ghost btn-square"
            disabled={isLoadingModels}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingModels ? 'animate-spin' : ''}`} />
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClear}
            className="btn btn-sm btn-ghost btn-square text-error"
            disabled={messages.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4 py-2 bg-error/10 border-b border-error/30">
          <div className="flex items-center gap-2 text-error text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto btn btn-ghost btn-xs">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 border-b border-base-300 bg-base-200/30 space-y-3">
          <div>
            <label className="label py-1">
              <span className="label-text text-xs">System Prompt</span>
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="textarea textarea-bordered textarea-sm w-full h-20 text-sm"
              placeholder="Enter system prompt..."
            />
          </div>
          <div>
            <label className="label py-1">
              <span className="label-text text-xs">Temperature: {temperature}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="range range-xs range-primary"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-base-content/40">
            <Bot className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">开始对话</p>
            <p className="text-sm">选择一个模型，输入消息开始聊天</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-300 text-base-content'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Content */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-content rounded-br-md'
                    : 'bg-base-200 text-base-content rounded-bl-md'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {message.content || (
                    <span className="loading loading-dots loading-sm"></span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-base-300 bg-base-200/30">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Shift+Enter 换行)"
            className="textarea textarea-bordered flex-1 min-h-[44px] max-h-32 resize-none text-sm"
            rows={1}
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              onClick={handleStop}
              className="btn btn-error btn-square"
            >
              <span className="w-4 h-4 border-2 border-current"></span>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="btn btn-primary btn-square"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-base-content/50 mt-2">
          当前模型: {selectedModel}
        </p>
      </div>
    </div>
  );
}
