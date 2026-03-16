import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface AddTaskFormProps {
  boardId: Id<"boards">;
  columnId: Id<"columns">;
}

export function AddTaskForm({ boardId, columnId }: AddTaskFormProps) {
  const createTask = useMutation(api.tasks.create);
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      columnId,
      boardId,
      priority,
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full p-3 font-mono text-xs uppercase text-left hover:bg-[#FFFF00] transition-colors"
      >
        + ADD TASK
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-[#F5F5DC]">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-2 border-black p-2 font-mono text-sm mb-2 focus:outline-none focus:bg-[#FFFF00]"
        placeholder="TASK TITLE"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border-2 border-black p-2 font-mono text-xs mb-2 resize-none focus:outline-none focus:bg-[#FFFF00]"
        placeholder="Description (optional)"
        rows={2}
      />
      <div className="flex gap-1 mb-3">
        {(["low", "medium", "high"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(p)}
            className={`flex-1 font-mono text-xs py-1 border-2 border-black transition-colors ${
              priority === p
                ? p === "high"
                  ? "bg-[#FF3333] text-white"
                  : p === "medium"
                  ? "bg-[#FFFF00]"
                  : "bg-[#00FF00]"
                : "bg-white"
            }`}
          >
            {p === "low" ? "LOW" : p === "medium" ? "MED" : "HIGH"}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-black text-[#F5F5DC] font-mono text-xs uppercase py-2 border-2 border-black hover:bg-[#FF3333] transition-colors"
        >
          ADD
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="flex-1 font-mono text-xs uppercase py-2 border-2 border-black hover:bg-gray-200 transition-colors"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}
