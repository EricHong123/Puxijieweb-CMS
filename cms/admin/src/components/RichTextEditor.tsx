import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Heading1, Heading2, Heading3, Link, Undo2, Redo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface RichTextEditorProps {
  content: string | object;
  onChange: (json: string) => void;
  placeholder?: string;
}

function parseContent(content: string | object): any {
  if (typeof content === 'object') return content;
  if (!content || !content.trim()) return { type: 'doc', content: [] };
  try {
    return JSON.parse(content);
  } catch {
    // Plain text or HTML — treat as a single paragraph
    return { type: 'doc', content: [{ type: 'paragraph', content: content ? [{ type: 'text', text: content }] : [] }] };
  }
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      UnderlineExtension,
    ],
    content: parseContent(content),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  // Sync external content changes (e.g., locale tab switch)
  const updateContent = useCallback(() => {
    if (!editor) return;
    const currentJson = JSON.stringify(editor.getJSON());
    const newContent = typeof content === 'string' ? content : JSON.stringify(content);
    // Only reset if content actually changed externally
    if (newContent && newContent !== currentJson) {
      const isEmpty = editor.isEmpty;
      const parsed = parseContent(content);
      const newJson = JSON.stringify(parsed);
      if (newJson !== currentJson) {
        editor.commands.setContent(parsed);
      }
    }
  }, [editor, content]);

  // Listen for external content changes (when locale tab switches)
  if (editor) {
    const currentJson = JSON.stringify(editor.getJSON());
    const targetJson = typeof content === 'string'
      ? (() => { try { return JSON.stringify(JSON.parse(content)); } catch { return content; } })()
      : JSON.stringify(content);
    if (targetJson && targetJson !== currentJson) {
      const parsed = parseContent(content);
      editor.commands.setContent(parsed);
    }
  }

  if (!editor) {
    return (
      <div className="w-full rounded-lg border bg-[hsl(var(--muted))]/20 min-h-[200px] flex items-center justify-center">
        <span className="text-sm text-warm-charcoal-muted">加载编辑器中...</span>
      </div>
    );
  }

  const ToolbarButton = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors',
        active && 'bg-pastel-blue/10 text-pastel-blue',
      )}
    >
      {children}
    </button>
  );

  const addLink = () => {
    const url = window.prompt('输入链接 URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
    }
  };

  return (
    <div className="w-full rounded-lg border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-[hsl(var(--muted))]/30 flex-wrap">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="加粗">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="下划线">
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="删除线">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[hsl(var(--border))] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="标题 1">
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="标题 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="标题 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[hsl(var(--border))] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="无序列表">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="有序列表">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[hsl(var(--border))] mx-1" />

        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="插入链接">
          <Link className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[hsl(var(--border))] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="撤销">
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="重做">
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
