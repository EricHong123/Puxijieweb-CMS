import { useState, useCallback, useRef } from 'react';
import { sendChatMessage, type ChatMessage, type ChatContext } from '@/api/chat';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '你好！我是 CMS AI 助手。我可以帮你解答 CMS 使用问题、指导内容编辑、或帮你撰写产品描述和文章文案。请问有什么需要？',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, context?: ChatContext) => {
      const userMessage: ChatMessage = { role: 'user', content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setLoading(true);
      setError(null);

      try {
        const recentMessages = updatedMessages.slice(-20);
        const response = await sendChatMessage(recentMessages, context);

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.content },
        ]);
      } catch (err: any) {
        const msg = err.response?.data?.error || err.message || 'AI 请求失败';
        setError(msg);
        setMessages(updatedMessages.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: '你好！我是 CMS AI 助手。请问有什么需要？',
      },
    ]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearChat };
}
