"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import EditPost from "@/components/posts/editPost";
import DeletePost from "@/components/posts/deletePost";

export default function PostActionsMenu({ post, onUpdated, onDeleted }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition focus:outline-none"
            aria-label="Post actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 text-sm text-red-600 focus:text-red-600 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit dialog – controlled */}
      <EditPost
        post={post}
        onUpdated={onUpdated}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Delete dialog – controlled */}
      <DeletePost
        postId={post._id}
        onDeleted={onDeleted}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
