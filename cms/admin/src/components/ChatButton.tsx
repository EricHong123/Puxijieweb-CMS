import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function ChatButton({ isOpen, onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-[9998] w-12 h-12 rounded-full shadow-elevation-3',
        'flex items-center justify-center transition-all duration-fluent',
        'hover:scale-105 active:scale-95',
        isOpen
          ? 'bg-slate-700 text-white rotate-90'
          : 'bg-primary text-primary-foreground'
      )}
      title={isOpen ? '关闭 AI 助手' : '打开 AI 助手 (Cmd+J)'}
    >
      {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
    </button>
  );
}
