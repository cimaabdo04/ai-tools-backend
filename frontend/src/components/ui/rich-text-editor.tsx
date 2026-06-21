"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon, TextQuote, List, ListOrdered,
  Heading1, Heading2, Heading3, Heading4, Undo2, Redo2, Link2,
  AlignRight, AlignCenter, AlignLeft, Smile, ImageIcon, Upload, Loader2, Video,
} from "lucide-react";
import { uploadFile } from "@lib/api";

const EMOJIS = [
  "😀", "😂", "🤣", "😊", "😍", "🤩", "😎", "🤔",
  "👍", "👎", "👏", "🙌", "🔥", "⭐", "💡", "✅",
  "❌", "📌", "💎", "🚀", "🎯", "💪", "🤝", "🎉",
  "❤️", "💙", "💚", "💛", "💜", "🖤", "🔍", "📢",
  "⚠️", "🔗", "📝", "🎥", "📷", "🖼️", "💬", "📊",
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function ToolbarButton({
  onClick, active, children, title,
}: {
  onClick: () => void; active: boolean; children: React.ReactNode; title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 300 }: RichTextEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emojiPos, setEmojiPos] = useState({ top: 0, left: 0 });
  const emojiBtnRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["right", "center", "left"],
        defaultAlignment: "right",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-cyan-400 underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full h-auto rounded-lg" },
      }),
      Placeholder.configure({
        placeholder: placeholder || "اكتب المحتوى هنا...",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-right",
        dir: "rtl",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("رابط URL:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const setYoutubeVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("رابط فيديو يوتيوب:", "https://www.youtube.com/watch?v=");
    if (!url) return;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!match) {
      alert("رابط يوتيوب غير صالح");
      return;
    }
    const videoId = match[1];
    editor.chain().focus().setNodeSelection(editor.state.selection.from).insertContentAt(
      editor.state.selection.from,
      `<div class="youtube-embed-wrapper" style="position:relative;width:100%;padding-bottom:56.25%;margin:1rem 0;border-radius:12px;overflow:hidden;background:#000">
        <iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%"></iframe>
      </div>`
    ).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className="border border-input rounded-lg overflow-hidden bg-background"
      style={{ minHeight }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-input bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="عريض"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="مائل"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="تسطير"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="عنوان 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="عنوان 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          active={editor.isActive("heading", { level: 4 })}
          title="عنوان 4"
        >
          <Heading4 className="h-4 w-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="قائمة نقطية"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="قائمة مرقمة"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="اقتباس"
        >
          <TextQuote className="h-4 w-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="محاذاة لليمين"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="محاذاة للوسط"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="محاذاة لليسار"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="إدراج رابط"
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>

        {/* Image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
            setUploadingImage(true);
            try {
              const url = await uploadFile(file);
              editor.chain().focus().setImage({ src: url }).run();
            } catch {
              /* ignore */
            } finally {
              setUploadingImage(false);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }
          }}
        />
        <ToolbarButton
          onClick={() => !uploadingImage && fileInputRef.current?.click()}
          active={false}
          title="رفع صورة"
        >
          {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        {/* Emoji picker */}
        <div ref={emojiBtnRef} className="relative">
          <ToolbarButton
            onClick={() => {
              if (!showEmojiPicker && emojiBtnRef.current) {
                const rect = emojiBtnRef.current.getBoundingClientRect();
                setEmojiPos({ top: rect.bottom + 4, left: rect.left });
              }
              setShowEmojiPicker(!showEmojiPicker);
            }}
            active={false}
            title="إدراج إيموجي"
          >
            <Smile className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {showEmojiPicker && typeof document !== "undefined" && createPortal(
          <div
            ref={emojiRef}
            className="fixed z-50 p-2 bg-popover border border-border rounded-lg shadow-lg grid grid-cols-8 gap-1"
            style={{ top: emojiPos.top, left: emojiPos.left, minWidth: "192px" }}
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="w-7 h-7 flex items-center justify-center text-lg hover:bg-accent rounded transition-colors"
                onClick={() => {
                  editor.chain().focus().insertContent(emoji).run();
                  setShowEmojiPicker(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>,
          document.body
        )}

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={setYoutubeVideo}
          active={false}
          title="إدراج فيديو يوتيوب"
        >
          <Video className="h-4 w-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="تراجع"
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="إعادة"
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
