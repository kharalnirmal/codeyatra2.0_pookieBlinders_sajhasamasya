"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeletePost({
  postId,
  onDeleted,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post deleted successfully");
        setOpen(false);
        onDeleted?.(postId);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete post");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <AlertDialogTrigger asChild>
          <button
            title="Delete post"
            className="group relative flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 px-3 py-2 rounded-xl overflow-hidden transition-all duration-200 hover:bg-red-50/80 active:scale-95"
          >
            <span className="absolute inset-0 bg-red-100/0 group-hover:bg-red-100/60 rounded-xl transition-all duration-200" />
            <Trash2 className="relative w-3.5 h-3.5 transition-transform duration-200 group-hover:-rotate-6" />
            <span className="relative">Delete</span>
          </button>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent className="p-0 overflow-hidden border-0 bg-white shadow-2xl shadow-red-900/10 rounded-2xl max-w-md w-[calc(100%-2rem)] sm:w-full animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-rose-500 to-red-400" />

        <div className="px-6 pt-6 pb-2">
          <AlertDialogHeader className="gap-3">
            {/* Icon badge */}
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 border border-red-100 mx-auto mb-1">
              <AlertTriangle className="w-6 h-6 text-red-500" strokeWidth={2} />
            </div>

            <AlertDialogTitle className="text-center text-lg font-bold text-gray-900 tracking-tight">
              Delete this post?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-center text-sm text-gray-500 leading-relaxed">
              This action{" "}
              <span className="font-semibold text-gray-700">cannot be undone.</span>{" "}
              The post and all associated data will be permanently removed from
              the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* Divider */}
        <div className="mx-6 my-4 h-px bg-gray-100" />

        <AlertDialogFooter className="flex flex-row gap-3 px-6 pb-6">
          <AlertDialogCancel
            disabled={deleting}
            className="flex-1 h-10 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
          >
            Keep it
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 h-10 rounded-xl bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold shadow-md shadow-red-200 hover:shadow-red-300 transition-all duration-200 disabled:opacity-60 active:scale-[0.98] border-0"
          >
            {deleting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting…</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, delete</span>
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}