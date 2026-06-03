import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminCreateBlogPost } from "../../api/hooks";
import type { BlogPostRequest } from "../../api/types";
import BlogPostForm from "./BlogPostForm";

export default function BlogPostCreatePage() {
    const navigate = useNavigate();
    const { mutate: createPost, isPending } = useAdminCreateBlogPost();

    const handleSubmit = (data: BlogPostRequest) => {
        createPost(data, {
            onSuccess: (post) => {
                toast.success("Blog post created");
                navigate(`/admin/blog/${post.id}/edit`);
            },
            onError: () => toast.error("Failed to create blog post"),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/blog" className="p-2 text-muted hover:text-heading hover:bg-gray-50 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif text-heading">Create blog post</h1>
                    <p className="text-sm text-muted mt-0.5">Draft or publish a new client-facing article</p>
                </div>
            </div>
            <BlogPostForm submitLabel="Create post" isSubmitting={isPending} onSubmit={handleSubmit} />
        </div>
    );
}
