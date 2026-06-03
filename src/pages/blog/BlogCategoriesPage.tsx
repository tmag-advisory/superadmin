import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, FolderTree, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
    useAdminBlogCategories,
    useAdminCreateBlogCategory,
    useAdminDeleteBlogCategory,
    useAdminUpdateBlogCategory,
} from "../../api/hooks";
import type { BlogCategory } from "../../api/types";

const INPUT = "w-full px-4 py-3 bg-background-primary border border-border-light rounded-xl text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-colors";

interface CategoryForm {
    name: string;
    slug: string;
    description: string;
}

const emptyForm: CategoryForm = { name: "", slug: "", description: "" };

export default function BlogCategoriesPage() {
    const { data: categories, isLoading, isError } = useAdminBlogCategories();
    const { mutate: createCategory, isPending: isCreating } = useAdminCreateBlogCategory();
    const { mutate: updateCategory, isPending: isUpdating } = useAdminUpdateBlogCategory();
    const { mutate: deleteCategory, isPending: isDeleting } = useAdminDeleteBlogCategory();

    const [editing, setEditing] = useState<BlogCategory | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CategoryForm>(emptyForm);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const isSaving = isCreating || isUpdating;

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (category: BlogCategory) => {
        setEditing(category);
        setForm({
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        const name = form.name.trim();
        if (!name) {
            toast.error("Name is required");
            return;
        }
        const payload = {
            name,
            slug: form.slug.trim() || undefined,
            description: form.description.trim() || undefined,
        };
        if (editing) {
            updateCategory(
                { id: editing.id, data: payload },
                {
                    onSuccess: () => {
                        toast.success("Category updated");
                        closeForm();
                    },
                    onError: () => toast.error("Failed to update category"),
                },
            );
        } else {
            createCategory(payload, {
                onSuccess: () => {
                    toast.success("Category created");
                    closeForm();
                },
                onError: () => toast.error("Failed to create category"),
            });
        }
    };

    const handleDelete = (id: number) => {
        deleteCategory(id, {
            onSuccess: () => {
                toast.success("Category deleted");
                setDeleteConfirm(null);
            },
            onError: () => toast.error("Failed to delete category"),
        });
    };

    const list = categories ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/blog" className="p-2 text-muted hover:text-heading hover:bg-gray-50 rounded-lg transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif text-heading">Blog categories</h1>
                        <p className="text-sm text-muted mt-0.5">Organize public blog posts into categories</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-dark text-white text-sm font-medium rounded-xl hover:bg-darkest transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New category
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-light p-6 space-y-5">
                    <h2 className="font-semibold text-heading">{editing ? "Edit category" : "New category"}</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-heading">Name *</span>
                            <input required type="text" value={form.name} onChange={(event) => setForm((c) => ({ ...c, name: event.target.value }))} className={INPUT} placeholder="Travel Health" />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-heading">Slug</span>
                            <input type="text" value={form.slug} onChange={(event) => setForm((c) => ({ ...c, slug: event.target.value }))} className={INPUT} placeholder="auto-generated if blank" />
                        </label>
                    </div>
                    <label className="block space-y-2">
                        <span className="text-sm font-medium text-heading">Description</span>
                        <textarea rows={3} value={form.description} onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))} className={INPUT} placeholder="Optional summary" />
                    </label>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest disabled:opacity-60 transition-colors">
                            {isSaving ? "Saving..." : editing ? "Save changes" : "Create category"}
                        </button>
                    </div>
                </form>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-muted" />
                </div>
            ) : isError ? (
                <div className="bg-white rounded-2xl border border-border-light p-8 text-center">
                    <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
                    <p className="font-medium text-heading">Unable to load categories</p>
                    <p className="text-sm text-muted mt-1">Check your permissions and try again.</p>
                </div>
            ) : list.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
                    <FolderTree className="w-10 h-10 text-muted mx-auto mb-3" />
                    <p className="text-heading font-medium">No categories yet</p>
                    <p className="text-sm text-muted mt-1">Create the first category to organize blog posts.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {list.map((category) => (
                        <article key={category.id} className="bg-white rounded-2xl border border-border-light p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <h2 className="font-semibold text-heading truncate">{category.name}</h2>
                                    <p className="text-xs text-muted mt-0.5">/{category.slug}</p>
                                    {category.description && (
                                        <p className="text-sm text-muted mt-2 line-clamp-2">{category.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(category)}
                                        className="p-2 text-muted hover:text-heading hover:bg-gray-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm(category.id)}
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
                            <p className="font-medium text-heading">Delete this category?</p>
                        </div>
                        <p className="text-sm text-muted">Posts in this category will become uncategorized.</p>
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
