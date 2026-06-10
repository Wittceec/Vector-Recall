"use client"
import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { SlashCommand } from "./editor/SlashCommand"
import { Wikilink, setWikilinkTitles } from "./editor/extensions/Wikilink"
import { Hashtag, setHashtags } from "./editor/extensions/Hashtag"
import { Icon } from "./Icons"

import { WikilinkDecorator } from "./editor/extensions/WikilinkDecorator"

// Configure lowlight for syntax highlighting
const lowlight = createLowlight(common);

interface EditorProps {
  initialContent: string;
  onUpdate?: (content: string) => void;
  className?: string;
  noteTitles?: string[];
  tags?: string[];
  editable?: boolean;
  onLinkClick?: (title: string) => void;
}

export function Editor({ initialContent, onUpdate, className = "", noteTitles = [], tags = [], editable = true, onLinkClick }: EditorProps) {
  // Use a ref to store the latest onUpdate to avoid dependency cycle in useEditor
  const onUpdateRef = React.useRef(onUpdate);
  
  React.useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  React.useEffect(() => {
    setWikilinkTitles(noteTitles);
  }, [noteTitles]);

  React.useEffect(() => {
    setHashtags(tags);
  }, [tags]);

  const editor = useEditor({
    extensions: [
      SlashCommand,
      Wikilink,
      WikilinkDecorator,
      Hashtag,
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false, // Disable default code block to use lowlight
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: "Start typing, or type '/' for commands...",
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class: `prose-vc focus:outline-none min-h-[500px] w-full max-w-none pb-[40vh] ${className}`,
      },
    },
    onUpdate: ({ editor }) => {
      // get markdown
      const markdown = (editor.storage as any).markdown.getMarkdown();
      if (onUpdateRef.current) {
        onUpdateRef.current(markdown);
      }
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.pill-link') as HTMLElement;
    if (target) {
      // Use data-id if available, otherwise fallback to text content
      let title = target.getAttribute('data-id');
      if (!title) {
        title = target.textContent?.replace(/[\[\]]/g, '') || '';
      }
      if (title && onLinkClick) {
        onLinkClick(title.trim());
      }
    }
  };

  // Update editor content when initialContent changes significantly (like switching notes)
  // We use a separate useEffect to prevent jumping cursor on every keystroke
  React.useEffect(() => {
    if (editor && initialContent !== (editor.storage as any).markdown.getMarkdown()) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [initialContent, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative w-full h-full" onClick={handleClick}>
      <div className="absolute top-2 right-4 flex gap-1.5 z-10 bg-[var(--bg-1)] p-1 rounded-md border border-[var(--bg-3)] shadow-sm">
        <button 
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-[var(--bg-3)] disabled:opacity-30 text-[var(--fg-2)]"
          title="Undo (Cmd+Z)"
        >
          <Icon name="undo" size={14} />
        </button>
        <button 
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-[var(--bg-3)] disabled:opacity-30 text-[var(--fg-2)]"
          title="Redo (Cmd+Shift+Z)"
        >
          <Icon name="redo" size={14} />
        </button>
      </div>
      <EditorContent editor={editor} className="w-full h-full" />
    </div>
  );
}
