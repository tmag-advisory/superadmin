import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminBlogPost, useAdminUpdateBlogPost } from "../../api/hooks";
import type { BlogPostRequest } from "../../api/types";
import BlogPostForm from "./BlogPostForm";

export default function BlogPostEditPage() {
    const navigate = useNavigate();
    const params = useParams();
    const postId = Number(params.id ?? 0);
    const { data: post, isLoading, isError } = useAdminBlogPost(postId);
    const { mutate: updatePost, isPending } = useAdminUpdateBlogPost();

    const handleSubmit = (data: BlogPostRequest) => {
        updatePost({ id: postId, data }, {
            onSuccess: () => {
                toast.success("Blog post updated");
                navigate("/admin/blog");
            },
            onError: () => toast.error("Failed to update blog post"),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/blog" className="p-2 text-muted hover:text-heading hover:bg-gray-50 rounded-lg transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif text-heading">Edit blog post</h1>
                    <p className="text-sm text-muted mt-0.5">Update article content and publishing state</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-muted" />
                </div>
            ) : isError || !post ? (
                <div className="bg-white rounded-2xl border border-border-light p-8 text-center max-w-xl">
                    <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
                    <p className="font-medium text-heading">Blog post not found</p>
                    <p className="text-sm text-muted mt-1">It may have been deleted or your account may not have access.</p>
                </div>
            ) : (
                <BlogPostForm key={post.id} post={post} submitLabel="Save changes" isSubmitting={isPending} onSubmit={handleSubmit} />
            )}
        </div>
    );
}
