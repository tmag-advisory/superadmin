import { type ChangeEvent, type ReactNode, useCallback, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold,
    Code2,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    Link2,
    List,
    ListOrdered,
    Loader2,
    Minus,
    Quote,
    Redo2,
    Strikethrough,
    Underline,
    Undo2,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";

type EditorCanCommands = ReturnType<Editor['can']>;

function canRun(editor: Editor | null, run: (commands: EditorCanCommands) => boolean): boolean {
    if (!editor) return false;
    try {
        const commands = editor.can();
        return commands ? run(commands) : false;
    } catch {
        return false;
    }
}

export interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    onUploadImage: (file: File) => Promise<{ url: string }>;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, onUploadImage, placeholder }: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                link: {
                    openOnClick: false,
                    autolink: true,
                    HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
                },
            }),
            Image.configure({ inline: false, HTMLAttributes: { class: "rounded-xl" } }),
            Placeholder.configure({ placeholder: placeholder ?? "Write the article…" }),
        ],
        content: value || "",
        editorProps: {
            attributes: { class: "blog-editor-content min-h-[340px] focus:outline-none px-4 py-4" },
        },
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    const state = useEditorState({
        editor,
        selector: ({ editor }) =>
            editor
                ? {
                      bold: editor.isActive("bold"),
                      italic: editor.isActive("italic"),
                      underline: editor.isActive("underline"),
                      strike: editor.isActive("strike"),
                      h2: editor.isActive("heading", { level: 2 }),
                      h3: editor.isActive("heading", { level: 3 }),
                      bulletList: editor.isActive("bulletList"),
                      orderedList: editor.isActive("orderedList"),
                      blockquote: editor.isActive("blockquote"),
                      codeBlock: editor.isActive("codeBlock"),
                      link: editor.isActive("link"),
                      canUndo: canRun(editor, (commands) => commands.undo()),
                      canRedo: canRun(editor, (commands) => commands.redo()),
                  }
                : null,
    });

    const handleFile = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file || !editor) return;
            setUploading(true);
            try {
                const { url } = await onUploadImage(file);
                editor.chain().focus().setImage({ src: url, alt: file.name }).run();
            } catch {
                toast.error("Image upload failed");
            } finally {
                setUploading(false);
            }
        },
        [editor, onUploadImage],
    );

    const toggleLink = useCallback(() => {
        if (!editor) return;
        if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
        }
        const url = window.prompt("Link URL");
        if (!url || !url.trim()) return;
        editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }, [editor]);

    if (!editor) {
        return <div className="border border-border-light rounded-xl bg-background-primary min-h-[380px]" />;
    }

    return (
        <div className="border border-border-light rounded-xl bg-background-primary overflow-hidden focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent/40 transition-colors">
            <div className="flex flex-wrap items-center gap-0.5 border-b border-border-light bg-white px-2 py-1.5">
                <Btn active={state?.bold} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
                    <Bold className="w-4 h-4" />
                </Btn>
                <Btn active={state?.italic} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
                    <Italic className="w-4 h-4" />
                </Btn>
                <Btn active={state?.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
                    <Underline className="w-4 h-4" />
                </Btn>
                <Btn active={state?.strike} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
                    <Strikethrough className="w-4 h-4" />
                </Btn>
                <Divider />
                <Btn active={state?.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
                    <Heading2 className="w-4 h-4" />
                </Btn>
                <Btn active={state?.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
                    <Heading3 className="w-4 h-4" />
                </Btn>
                <Divider />
                <Btn active={state?.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
                    <List className="w-4 h-4" />
                </Btn>
                <Btn active={state?.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
                    <ListOrdered className="w-4 h-4" />
                </Btn>
                <Btn active={state?.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
                    <Quote className="w-4 h-4" />
                </Btn>
                <Btn active={state?.codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
                    <Code2 className="w-4 h-4" />
                </Btn>
                <Divider />
                <Btn active={state?.link} onClick={toggleLink} title="Link">
                    <Link2 className="w-4 h-4" />
                </Btn>
                <Btn onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Insert image">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                </Btn>
                <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
                    <Minus className="w-4 h-4" />
                </Btn>
                <Divider />
                <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!state?.canUndo} title="Undo">
                    <Undo2 className="w-4 h-4" />
                </Btn>
                <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!state?.canRedo} title="Redo">
                    <Redo2 className="w-4 h-4" />
                </Btn>
            </div>
            <EditorContent editor={editor} />
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFile} />
        </div>
    );
}

function Btn({
    children,
    onClick,
    active,
    disabled,
    title,
}: {
    children: ReactNode;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "p-2 rounded-lg text-muted hover:bg-background-primary hover:text-heading transition-colors disabled:opacity-40 disabled:hover:bg-transparent",
                active && "bg-accent/10 text-accent hover:bg-accent/10 hover:text-accent",
            )}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <span className="w-px h-5 bg-border-light mx-1" />;
}
