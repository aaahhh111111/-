import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Undo, Redo } from 'lucide-react'

interface RichEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichEditor({ content, onChange, placeholder = '开始创作...' }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void
    active?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        p-2 border-2 border-black font-bold transition-all
        ${active
          ? 'bg-[#FFD93D] text-black'
          : 'bg-white text-black hover:bg-[#C4B5FD]'
        }
      `}
    >
      {children}
    </button>
  )

  return (
    <div className="border-4 border-black bg-white overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b-4 border-black bg-white flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="粗体"
        >
          <Bold className="w-5 h-5" strokeWidth={3} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="斜体"
        >
          <Italic className="w-5 h-5" strokeWidth={3} />
        </ToolbarButton>

        <div className="w-1 h-8 bg-black mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="标题"
        >
          <Heading2 className="w-5 h-5" strokeWidth={3} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="无序列表"
        >
          <List className="w-5 h-5" strokeWidth={3} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="有序列表"
        >
          <ListOrdered className="w-5 h-5" strokeWidth={3} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="引用"
        >
          <Quote className="w-5 h-5" strokeWidth={3} />
        </ToolbarButton>

        <div className="w-1 h-8 bg-black mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="撤销"
        >
          <Undo className="w-5 h-5" strokeWidth={3} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="重做"
        >
          <Redo className="w-5 h-5" strokeWidth={3} />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className="max-w-none p-6 min-h-[400px] text-black
          [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]
          [&_.ProseMirror_p]:text-lg [&_.ProseMirror_p]:mb-4 [&_.ProseMirror_p]:leading-relaxed
          [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-black [&_.ProseMirror_h1]:uppercase [&_.ProseMirror_h1]:tracking-tight [&_.ProseMirror_h1]:mb-4
          [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-black [&_.ProseMirror_h2]:uppercase [&_.ProseMirror_h2]:mb-3
          [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-black [&_.ProseMirror_h3]:mb-2
          [&_.ProseMirror_strong]:font-black
          [&_.ProseMirror_em]:italic
          [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-black [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:my-4
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-8 [&_.ProseMirror_ul]:space-y-2
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-8 [&_.ProseMirror_ol]:space-y-2
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-black/30
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:font-bold
        "
      />
    </div>
  )
}
