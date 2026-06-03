import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import type { BlogPost, BlogPostRequest, ManagedUser } from "../../api/types";
import { useAdminBlogCategories, useUploadBlogImage, useUsers } from "../../api/hooks";
import RichTextEditor from "../../components/blog/RichTextEditor";

const INPUT = "w-full px-4 py-3 bg-background-primary border border-border-light rounded-xl text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-colors";

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function toLocalDateTime(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromLocalDateTime(value: string) {
    return value ? (value.length === 16 ? `${value}:00` : value) : null;
}

function isEmptyContent(html: string) {
    const trimmed = html.trim();
    return trimmed === "" || trimmed === "<p></p>";
}

function defaultForm(post?: BlogPost): BlogPostRequest {
    return {
        title: post?.title ?? "",
        slug: post?.slug ?? "",
        excerpt: post?.excerpt ?? "",
        content: post?.content ?? "",
        categoryId: post?.category?.id ?? null,
        tags: post?.tags?.map((tag) => tag.name) ?? [],
        publishedAt: post?.publishedAt ?? null,
        isPublished: post?.isPublished ?? false,
        userId: post?.userId ?? null,
        featuredImageId: post?.featuredImageId ?? null,
    };
}

export default function BlogPostForm({
    post,
    submitLabel,
    isSubmitting,
    onSubmit,
}: {
    post?: BlogPost;
    submitLabel: string;
    isSubmitting: boolean;
    onSubmit: (data: BlogPostRequest) => void;
}) {
    const [form, setForm] = useState<BlogPostRequest>(() => defaultForm(post));
    const [slugEdited, setSlugEdited] = useState(Boolean(post?.slug));
    const [publishedAt, setPublishedAt] = useState(() => toLocalDateTime(post?.publishedAt));
    const [tagDraft, setTagDraft] = useState("");
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(post?.featuredImageUrl ?? null);

    const { data: categories } = useAdminBlogCategories();
    const { data: users } = useUsers();
    const { mutateAsync: uploadImage } = useUploadBlogImage();
    const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
    const featuredInputRef = useRef<HTMLInputElement | null>(null);

    const wordCount = useMemo(
        () => form.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length,
        [form.content],
    );

    const update = <K extends keyof BlogPostRequest>(key: K, value: BlogPostRequest[K]) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const updateTitle = (title: string) => {
        setForm((current) => ({ ...current, title, slug: slugEdited ? current.slug : slugify(title) }));
    };

    const uploadBlogImage = (file: File) => uploadImage(file);

    const addTag = (raw: string) => {
        const tag = raw.trim();
        if (!tag) return;
        setForm((current) => {
            if (current.tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
                return current;
            }
            return { ...current, tags: [...current.tags, tag] };
        });
        setTagDraft("");
    };

    const removeTag = (index: number) => {
        setForm((current) => ({ ...current, tags: current.tags.filter((_, i) => i !== index) }));
    };

    const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag(tagDraft);
        } else if (event.key === "Backspace" && tagDraft === "" && form.tags.length > 0) {
            event.preventDefault();
            removeTag(form.tags.length - 1);
        }
    };

    const handleFeaturedFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        setIsUploadingFeatured(true);
        try {
            const result = await uploadBlogImage(file);
            update("featuredImageId", result.id);
            setFeaturedImagePreview(result.url);
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setIsUploadingFeatured(false);
        }
    };

    const removeFeaturedImage = () => {
        update("featuredImageId", null);
        setFeaturedImagePreview(null);
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (isEmptyContent(form.content)) {
            toast.error("Content cannot be empty");
            return;
        }
        onSubmit({
            ...form,
            title: form.title.trim(),
            slug: form.slug.trim(),
            excerpt: form.excerpt.trim(),
            content: form.content.trim(),
            publishedAt: form.isPublished ? fromLocalDateTime(publishedAt) : null,
            userId: form.userId || null,
            featuredImageId: form.featuredImageId || null,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
            <section className="bg-white border border-border-light rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light">
                    <h2 className="font-semibold text-heading">Article details</h2>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                        <Field label="Title *">
                            <input required type="text" value={form.title} onChange={(event) => updateTitle(event.target.value)} className={INPUT} placeholder="Travel health guidance for..." />
                        </Field>
                        <Field label="Slug *">
                            <input required type="text" value={form.slug} onChange={(event) => { setSlugEdited(true); update("slug", event.target.value); }} className={INPUT} placeholder="travel-health-guidance" />
                        </Field>
                    </div>
                    <Field label="Category">
                        <select
                            value={form.categoryId ?? ""}
                            onChange={(event) => update("categoryId", event.target.value ? Number(event.target.value) : null)}
                            className={INPUT}
                        >
                            <option value="">— None —</option>
                            {categories?.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        {categories && categories.length === 0 && (
                            <span className="text-xs text-muted">
                                No categories yet.{" "}
                                <Link to="/admin/blog/categories" className="text-accent hover:underline">Create one</Link>.
                            </span>
                        )}
                    </Field>
                    <Field label="Tags">
                        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-background-primary border border-border-light rounded-xl focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent/40 transition-colors">
                            {form.tags.map((tag, index) => (
                                <span key={tag} className="flex items-center gap-1 bg-button-secondary text-heading rounded-full px-2.5 py-1 text-xs">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(index)} className="text-muted hover:text-heading" aria-label={`Remove ${tag}`}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagDraft}
                                onChange={(event) => setTagDraft(event.target.value)}
                                onKeyDown={handleTagKeyDown}
                                onBlur={() => addTag(tagDraft)}
                                className="flex-1 min-w-[120px] bg-transparent text-sm text-heading placeholder:text-muted focus:outline-none"
                                placeholder="Add a tag and press Enter"
                            />
                        </div>
                    </Field>
                    <Field label="Excerpt *">
                        <textarea required rows={3} value={form.excerpt} onChange={(event) => update("excerpt", event.target.value)} className={INPUT} placeholder="Short summary shown on blog cards" />
                    </Field>
                    <Field label={`Content * (${wordCount.toLocaleString()} words)`}>
                        <RichTextEditor
                            value={form.content}
                            onChange={(html) => update("content", html)}
                            onUploadImage={(file) => uploadBlogImage(file)}
                            placeholder="Write the article…"
                        />
                    </Field>
                    {post && (
                        <p className="text-xs text-muted">Estimated read time: {post.readTime} min (auto-computed)</p>
                    )}
                </div>
            </section>

            <section className="bg-white border border-border-light rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light">
                    <h2 className="font-semibold text-heading">Featured image</h2>
                </div>
                <div className="p-6 space-y-4">
                    {featuredImagePreview ? (
                        <div className="space-y-3">
                            <img src={featuredImagePreview} alt="Featured" className="max-h-56 rounded-xl border border-border-light object-cover" />
                            <button type="button" onClick={removeFeaturedImage} className="px-4 py-2 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors">
                                Remove image
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => featuredInputRef.current?.click()}
                            disabled={isUploadingFeatured}
                            className="flex items-center gap-2 px-4 py-3 text-sm text-heading border border-dashed border-border-light rounded-xl hover:bg-background-primary disabled:opacity-60 transition-colors"
                        >
                            {isUploadingFeatured ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                            {isUploadingFeatured ? "Uploading…" : "Upload featured image"}
                        </button>
                    )}
                    <input ref={featuredInputRef} type="file" accept="image/*" className="hidden" onChange={handleFeaturedFile} />
                </div>
            </section>

            <section className="bg-white border border-border-light rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light">
                    <h2 className="font-semibold text-heading">Publishing</h2>
                </div>
                <div className="p-6 space-y-5">
                    <label className="flex items-center gap-3 text-sm text-body cursor-pointer">
                        <input type="checkbox" checked={form.isPublished} onChange={(event) => update("isPublished", event.target.checked)} className="w-4 h-4 accent-accent" />
                        Publish this post
                    </label>
                    <Field label="Published date">
                        <input type="datetime-local" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} disabled={!form.isPublished} className={INPUT} />
                    </Field>
                    <Field label="Author">
                        <AuthorPicker users={users} value={form.userId ?? null} onChange={(userId) => update("userId", userId)} />
                    </Field>
                </div>
            </section>

            <div className="flex justify-end gap-3">
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest disabled:opacity-60 transition-colors">
                    {isSubmitting ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );
}

function AuthorPicker({
    users,
    value,
    onChange,
}: {
    users: ManagedUser[] | undefined;
    value: number | null;
    onChange: (userId: number | null) => void;
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const selected = useMemo(
        () => users?.find((user) => Number(user.id) === value) ?? null,
        [users, value],
    );

    const filtered = useMemo(() => {
        const list = users ?? [];
        const q = query.trim().toLowerCase();
        const matches = q
            ? list.filter((user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q))
            : list;
        return matches.slice(0, 50);
    }, [users, query]);

    useEffect(() => {
        if (!open) return;
        const handler = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    if (value !== null) {
        return (
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-background-primary border border-border-light rounded-xl">
                <div className="min-w-0">
                    <p className="text-sm text-heading truncate">{selected ? selected.name : `User #${value}`}</p>
                    {selected ? (
                        <p className="text-xs text-muted truncate">{selected.email}</p>
                    ) : (
                        <p className="text-xs text-muted truncate">Not in current user list</p>
                    )}
                </div>
                <button type="button" onClick={() => onChange(null)} className="text-muted hover:text-heading shrink-0" aria-label="Clear author">
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative">
            <input
                type="text"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                className={INPUT}
                placeholder="Search author by name or email"
            />
            {open && (
                <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-border-light rounded-xl shadow-lg py-1">
                    {filtered.length === 0 ? (
                        <li className="px-4 py-2 text-sm text-muted">No users found</li>
                    ) : (
                        filtered.map((user) => (
                            <li key={user.id}>
                                <button
                                    type="button"
                                    onClick={() => { onChange(Number(user.id)); setOpen(false); setQuery(""); }}
                                    className="w-full text-left px-4 py-2 hover:bg-background-primary transition-colors"
                                >
                                    <span className="block text-sm text-heading truncate">{user.name}</span>
                                    <span className="block text-xs text-muted truncate">{user.email}</span>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-medium text-heading">{label}</span>
            {children}
        </label>
    );
}
