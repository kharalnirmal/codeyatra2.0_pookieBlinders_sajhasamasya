"use client";

import { useState } from "react";
import { Pencil, Loader2, Save, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DISTRICTS } from "@/lib/constants";

const CATEGORY_OPTIONS = [
  { value: "road", label: "Road / Infrastructure", emoji: "🛣️" },
  { value: "water", label: "Water Supply", emoji: "💧" },
  { value: "electricity", label: "Electricity", emoji: "⚡" },
  { value: "garbage", label: "Garbage / Waste", emoji: "🗑️" },
  { value: "safety", label: "Public Safety", emoji: "🛡️" },
  { value: "other", label: "Other", emoji: "📌" },
];

const TARGET_GROUPS = [
  {
    value: "authority",
    label: "Authority",
    desc: "Official channels",
    icon: "🏛️",
  },
  {
    value: "volunteer",
    label: "Volunteers",
    desc: "Community help",
    icon: "🤝",
  },
  { value: "both", label: "Both", desc: "Maximum reach", icon: "📣" },
];

/* ─── Reusable field wrapper ─── */
function Field({ label, required, children }) {
  return (
    <div className="group/field space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        {label}
        {required && (
          <span className="text-rose-400 text-sm leading-none">*</span>
        )}
      </label>
      {children}
    </div>
  );
}

/* ─── Shared input class ─── */
const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70 hover:border-gray-300";

export default function EditPost({
  post,
  onUpdated,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(post.title || "");
  const [description, setDescription] = useState(post.description || "");
  const [category, setCategory] = useState(post.category || "");
  const [targetGroup, setTargetGroup] = useState(
    post.targetGroup || "authority",
  );
  const [district, setDistrict] = useState(post.district || "");

  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setTitle(post.title || "");
      setDescription(post.description || "");
      setCategory(post.category || "");
      setTargetGroup(post.targetGroup || "authority");
      setDistrict(post.district || "");
    }
    setOpen(isOpen);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Title, description and category are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          targetGroup,
          district,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Post updated successfully");
        setOpen(false);
        onUpdated?.(data.post);
      } else {
        toast.error(data.error || "Failed to update post");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <button
            title="Edit post"
            className="group relative flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700 px-3 py-2 rounded-xl overflow-hidden transition-all duration-200 hover:bg-blue-50/80 active:scale-95"
          >
            <span className="absolute inset-0 bg-blue-100/0 group-hover:bg-blue-100/60 rounded-xl transition-all duration-200" />
            <Pencil className="relative w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-6" />
            <span className="relative">Edit</span>
          </button>
        </DialogTrigger>
      )}

      <DialogContent className="p-0 gap-0 border-0 shadow-2xl shadow-slate-900/10 rounded-2xl max-w-lg w-[calc(100%-2rem)] sm:w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400 flex-shrink-0" />

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900 tracking-tight">
                  Edit Post
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                  Update your report details below.
                </DialogDescription>
              </div>
              {/* Small category badge */}
              {category && (
                <span className="mt-0.5 shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  {CATEGORY_OPTIONS.find((c) => c.value === category)?.emoji}
                  {CATEGORY_OPTIONS.find((c) => c.value === category)?.label}
                </span>
              )}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSave}
            id="edit-post-form"
            className="px-6 py-5 space-y-5 bg-white"
          >
            {/* Title */}
            <Field label="Title" required>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Pothole on Main Street near bus stop"
                className={inputCls}
              />
              <p className="text-[11px] text-gray-400 text-right">
                {title.length} chars
              </p>
            </Field>

            {/* Description */}
            <Field label="Description" required>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Describe the issue in detail — location, severity, how long it's been present…"
                className={`${inputCls} resize-none`}
              />
              <p className="text-[11px] text-gray-400 text-right">
                {description.length} chars
              </p>
            </Field>

            {/* Category */}
            <Field label="Category" required>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-semibold text-left transition-all duration-150 active:scale-95 ${
                      category === c.value
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-base leading-none">{c.emoji}</span>
                    <span className="leading-tight">{c.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            {/* District */}
            <Field label="District">
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                >
                  <option value="">Select a district</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            {/* Target Group */}
            <Field label="Target Group">
              <div className="grid grid-cols-3 gap-2">
                {TARGET_GROUPS.map((tg) => (
                  <button
                    key={tg.value}
                    type="button"
                    onClick={() => setTargetGroup(tg.value)}
                    className={`flex flex-col items-center text-center gap-1 px-2 py-3 rounded-xl border-2 transition-all duration-150 active:scale-95 ${
                      targetGroup === tg.value
                        ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl leading-none">{tg.icon}</span>
                    <span
                      className={`text-xs font-bold leading-tight ${targetGroup === tg.value ? "text-indigo-700" : "text-gray-700"}`}
                    >
                      {tg.label}
                    </span>
                    <span
                      className={`text-[10px] leading-tight ${targetGroup === tg.value ? "text-indigo-500" : "text-gray-400"}`}
                    >
                      {tg.desc}
                    </span>
                  </button>
                ))}
              </div>
            </Field>
          </form>
        </div>

        {/* Footer — sticky at bottom */}
        <DialogFooter className="flex flex-row gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex-shrink-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={saving}
            className="flex-1 sm:flex-none h-10 px-5 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-post-form"
            disabled={saving}
            className="flex-1 sm:flex-none h-10 px-6 flex items-center justify-center gap-2 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 disabled:opacity-60 active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
