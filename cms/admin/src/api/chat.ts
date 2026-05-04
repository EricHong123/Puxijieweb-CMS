import api from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  page?: string;
  entityType?: string;
  entityId?: string;
}

export interface ChatResponse {
  role: 'assistant';
  content: string;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  context?: ChatContext
): Promise<ChatResponse> {
  const { data } = await api.post('/ai/chat', { messages, context });
  if (!data.success) throw new Error(data.error || 'AI chat failed');
  return data.data;
}
