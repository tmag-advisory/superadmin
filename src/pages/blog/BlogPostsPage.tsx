import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, BookOpenText, CalendarDays, Clock, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminBlogPosts, useAdminDeleteBlogPost } from "../../api/hooks";
import { cn } from "../../lib/utils";

function formatDate(value: string | null | undefined) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default function BlogPostsPage() {
    const { data, isLoading, isError } = useAdminBlogPosts({ page: 1, per_page: 50, sort: "createdAt", order: "desc" });
    const { mutate: deletePost, isPending: isDeleting } = useAdminDeleteBlogPost();
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const posts = data?.data ?? [];

    const handleDelete = (id: number) => {
        deletePost(id, {
            onSuccess: () => {
                toast.success("Blog post deleted");
                setDeleteConfirm(null);
            },
            onError: () => toast.error("Failed to delete blog post"),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif text-heading">Blog posts</h1>
                    <p className="text-sm text-muted mt-0.5">Create, publish, and manage public TMAG articles</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        to="/admin/blog/categories"
                        className="flex items-center gap-2 px-4 py-2 text-muted border border-border-light text-sm font-medium rounded-xl hover:bg-background-primary transition-colors"
                    >
                        Categories
                    </Link>
                    <Link
                        to="/admin/blog/create"
                        className="flex items-center gap-2 px-4 py-2 bg-dark text-white text-sm font-medium rounded-xl hover:bg-darkest transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New post
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-muted" />
                </div>
            ) : isError ? (
                <div className="bg-white rounded-2xl border border-border-light p-8 text-center">
                    <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
                    <p className="font-medium text-heading">Unable to load blog posts</p>
                    <p className="text-sm text-muted mt-1">Check your permissions and try again.</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
                    <BookOpenText className="w-10 h-10 text-muted mx-auto mb-3" />
                    <p className="text-heading font-medium">No blog posts yet</p>
                    <p className="text-sm text-muted mt-1">Create the first public article for the client blog.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <article key={post.id} className="bg-white rounded-2xl border border-border-light p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
                                            post.isPublished ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600",
                                        )}>
                                            {post.isPublished ? "Published" : "Draft"}
                                        </span>
                                        <span className="text-xs text-muted">{post.category?.name ?? "Uncategorized"}</span>
                                    </div>
                                    <h2 className="font-semibold text-heading truncate">{post.title}</h2>
                                    <p className="text-sm text-muted mt-1 line-clamp-2">{post.excerpt}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-3">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime} min read</span>
                                        <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Published {formatDate(post.publishedAt)}</span>
                                        <span>/{post.slug}</span>
                                    </div>
                                    {post.tags.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            {post.tags.map((tag) => (
                                                <span key={tag.id} className="bg-button-secondary text-heading rounded-full px-2 py-0.5 text-[10px]">{tag.name}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link
                                        to={`/admin/blog/${post.id}/edit`}
                                        className="p-2 text-muted hover:text-heading hover:bg-gray-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm(post.id)}
                                        className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {deleteConfirm !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                            <p className="font-medium text-heading">Delete this blog post?</p>
                        </div>
                        <p className="text-sm text-muted">This removes it from admin and public blog listings.</p>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors">
                                Cancel
                            </button>
                            <button type="button" disabled={isDeleting} onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
