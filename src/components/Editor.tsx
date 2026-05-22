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

// Configure lowlight for syntax highlighting
const lowlight = createLowlight(common);

interface EditorProps {
  initialContent: string;
  onUpdate?: (content: string) => void;
  className?: string;
  noteTitles?: string[];
  tags?: string[];
  editable?: boolean;
}

export function Editor({ initialContent, onUpdate, className = "", noteTitles = [], tags = [], editable = true }: EditorProps) {
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
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class: `prose-vc focus:outline-none min-h-[500px] w-full max-w-none ${className}`,
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

  // Update editor content when initialContent changes significantly (like switching notes)
  // We use a separate useEffect to prevent jumping cursor on every keystroke
  React.useEffect(() => {
    if (editor && initialContent !== (editor.storage as any).markdown.getMarkdown()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return null;
  }

  return (
    <EditorContent editor={editor} className="w-full h-full" />
  );
}
