import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { useChat } from '@/lib/useChat';
import ChatButton from './ChatButton';
import { cn } from '@/lib/utils';

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, loading, error, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  const getContext = useCallback(() => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    const routeMap: Record<string, string> = {
      products: 'product',
      news: 'news',
      pages: 'page',
      faq: 'faq',
      legal: 'legal',
      media: 'media',
      settings: 'site_setting',
      deploy: 'deploy',
      audit: 'audit_log',
    };
    return {
      page: path || '/',
      entityType: parts.length >= 1 ? (routeMap[parts[0]] || parts[0]) : undefined,
      entityId: parts.length >= 2 && parts[1] !== 'new' ? parts[1] : undefined,
    };
  }, [location.pathname]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput('');
    await sendMessage(trimmed, getContext());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return <ChatButton isOpen={false} onClick={() => setIsOpen(true)} />;

  return (
    <>
      <div
        className="fixed inset-0 z-[9996] bg-warm-charcoal/10 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed bottom-20 right-6 z-[9997] w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-7rem)] bg-[hsl(var(--card))] rounded-2xl shadow-paper-lg border border-[hsl(var(--border))] flex flex-col overflow-hidden animate-paper-in">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-pastel-blue/10 flex items-center justify-center ring-1 ring-pastel-blue/15">
              <Sparkles className="h-3.5 w-3.5 text-pastel-blue" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-sm font-semibold text-warm-charcoal">AI 助手</div>
              <div className="font-handwriting text-sm text-warm-charcoal-muted">Powered by DeepSeek</div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-xs text-warm-charcoal-muted hover:text-warm-charcoal px-2 py-1 rounded-md hover:bg-[hsl(var(--accent))] transition-colors"
          >
            清空
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-2.5 text-sm leading-relaxed max-w-[88%]',
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold mt-0.5',
                  msg.role === 'user'
                    ? 'bg-pastel-blue/10 text-pastel-blue ring-1 ring-pastel-blue/15'
                    : 'bg-[hsl(var(--accent))] text-warm-charcoal-muted'
                )}
              >
                {msg.role === 'user' ? '我' : 'AI'}
              </div>

              <div
                className={cn(
                  'rounded-2xl px-3.5 py-2.5',
                  msg.role === 'user'
                    ? 'bg-pastel-blue text-white rounded-tr-md'
                    : 'bg-[hsl(var(--secondary))] text-warm-charcoal rounded-tl-md'
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center">
              <div className="h-6 w-6 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center">
                <span className="text-[10px] font-semibold text-warm-charcoal-muted">AI</span>
              </div>
              <div className="bg-[hsl(var(--secondary))] rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-1.5 w-1.5 bg-warm-charcoal-muted/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-warm-charcoal-muted/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-warm-charcoal-muted/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-pastel-rose/8 border border-pastel-rose/20 rounded-lg text-xs text-pastel-rose">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input — paper field */}
        <div className="shrink-0 border-t border-[hsl(var(--border))] p-3">
          <div className="flex items-end gap-2 bg-[hsl(var(--secondary))] rounded-xl px-3 py-2 border border-[hsl(var(--border))] focus-within:ring-2 focus-within:ring-pastel-blue/20 focus-within:border-pastel-blue/40 transition-all duration-paper shadow-paper-xs">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="问 CMS 相关问题..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-warm-charcoal-muted/60 text-warm-charcoal max-h-32"
              style={{ minHeight: '24px' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="shrink-0 h-8 w-8 rounded-lg bg-pastel-blue text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pastel-blue/90 transition-colors shadow-paper-xs"
            >
              <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className="text-[10px] text-warm-charcoal-muted/60">Cmd+J 切换</span>
            <span className="text-[10px] text-warm-charcoal-muted/60">Enter 发送，Shift+Enter 换行</span>
          </div>
        </div>
      </div>
    </>
  );
}
