"use client"

import React, { useEffect, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
} from "lucide-react"
import { cn } from "@/lib/utils"

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded hover:bg-[#EEEFF2] dark:hover:bg-[#2A2A2A] transition-colors",
        active && "bg-[#E3E3E3] dark:bg-[#404040] text-[#6917AF] dark:text-[#D7B5F5]"
      )}
    >
      {children}
    </button>
  )
}

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = "What's the event about?",
  error,
  disabled,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] px-3 py-2 text-sm outline-none prose prose-sm dark:prose-invert max-w-none",
      },
      handleDOMEvents: {
        blur: () => onBlur?.(),
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [value, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)
    if (url !== null) {
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run()
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
      }
    }
  }, [editor])

  if (!editor) return null

  return (
    <div
      className={cn(
        "rounded-lg border border-[#E3E3E3] dark:border-[#2A2A2A] overflow-hidden",
        "focus-within:border-[#6917AF] focus-within:ring-[#6917AF]/20 focus-within:ring-[3px]",
        error && "border-destructive",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#E3E3E3] dark:border-[#2A2A2A] bg-[#F9FAFB] dark:bg-[#1C1C1C] p-1">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code">
          <Code className="size-4" />
        </ToolbarButton>
        <span className="w-px h-5 bg-[#E3E3E3] dark:bg-[#2A2A2A] mx-0.5" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
          <AlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
          <AlignJustify className="size-4" />
        </ToolbarButton>
        <span className="w-px h-5 bg-[#E3E3E3] dark:bg-[#2A2A2A] mx-0.5" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Link">
          <LinkIcon className="size-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      {error && <p className="px-3 pb-2 text-xs text-destructive">{error}</p>}
    </div>
  )
}
