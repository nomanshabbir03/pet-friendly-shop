'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

// Minimal rich text editor for the product Description field: Bold, Italic, Bullet List,
// Numbered List, and paragraph/line-break handling (Enter for a new paragraph, Shift+Enter for
// a line break within one) — nothing else. Every other StarterKit extra (headings, blockquote,
// code, links, underline, strike, horizontal rule) is explicitly disabled below, not just left
// off the toolbar, so none of them can sneak in via markdown-style shortcuts either.
//
// Output is HTML (editor.getHTML()) rather than TipTap's JSON format — simpler to sanitize and
// render safely on the frontend with a plain dangerouslySetInnerHTML, and plain-text
// descriptions saved before this editor existed load into it (and redisplay) unchanged, since
// plain text is already valid HTML.
//
// This is the first sanitization pass; app/api/admin/products/route.ts and [id]/route.ts run
// the same allowlist again server-side before saving (see lib/sanitize-html.ts) since a
// client-side editor's output can never be trusted as the sole line of defense.
export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        strike: false,
        link: false,
        underline: false,
      }),
    ],
    content: value,
    // Required for Next.js — TipTap otherwise renders once during SSR and again on the client,
    // which can mismatch. The editor mounts client-side only regardless (this component is
    // itself under ProductForm's 'use client'), so there's no content loss from this.
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'product-description min-h-[120px] focus:outline-none',
      },
    },
  });

  if (!editor) {
    return (
      <div className="w-full rounded-2xl border border-divider px-3 py-2 text-sm text-secondary">
        Loading editor...
      </div>
    );
  }

  const toolbarButtonClass = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg border transition ${
      active
        ? 'border-brand-500 bg-brand-500 text-surface'
        : 'border-divider bg-surface text-secondary hover:border-brand-500/30'
    }`;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-divider focus-within:ring-2 focus-within:ring-brand-500/20">
      <div className="flex items-center gap-1.5 border-b border-divider bg-brand-50/60 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
          aria-pressed={editor.isActive('bold')}
          className={toolbarButtonClass(editor.isActive('bold'))}
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
          aria-pressed={editor.isActive('italic')}
          className={toolbarButtonClass(editor.isActive('italic'))}
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
          aria-pressed={editor.isActive('bulletList')}
          className={toolbarButtonClass(editor.isActive('bulletList'))}
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Numbered list"
          aria-pressed={editor.isActive('orderedList')}
          className={toolbarButtonClass(editor.isActive('orderedList'))}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>

      <EditorContent editor={editor} className="bg-surface px-3 py-2" />
    </div>
  );
}
