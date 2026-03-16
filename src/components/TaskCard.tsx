import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  createdAt: number;
}

interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const priorityColors = {
  low: "bg-[#00FF00]",
  medium: "bg-[#FFFF00]",
  high: "bg-[#FF3333]",
};

const priorityLabels = {
  low: "LOW",
  medium: "MED",
  high: "HIGH",
};

export function TaskCard({ task, onDragStart, onDragEnd, isDragging }: TaskCardProps) {
  const deleteTask = useMutation(api.tasks.remove);
  const updateTask = useMutation(api.tasks.update);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editPriority, setEditPriority] = useState(task.priority || "medium");

  const handleSave = async () => {
    await updateTask({
      id: task._id,
      title: editTitle,
      description: editDescription || undefined,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("DELETE THIS TASK?")) {
      await deleteTask({ id: task._id });
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full border-2 border-black p-2 font-mono text-sm mb-2 focus:outline-none focus:bg-[#FFFF00]"
          placeholder="TASK TITLE"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full border-2 border-black p-2 font-mono text-xs mb-2 resize-none focus:outline-none focus:bg-[#FFFF00]"
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="flex gap-1 mb-3">
          {(["low", "medium", "high"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setEditPriority(p)}
              className={`flex-1 font-mono text-xs py-1 border-2 border-black transition-colors ${
                editPriority === p ? priorityColors[p] : "bg-white"
              }`}
            >
              {priorityLabels[p]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-black text-[#F5F5DC] font-mono text-xs uppercase py-2 border-2 border-black hover:bg-[#FF3333]"
          >
            SAVE
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 font-mono text-xs uppercase py-2 border-2 border-black hover:bg-gray-200"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group cursor-grab active:cursor-grabbing bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,51,51,1)] hover:border-[#FF3333] transition-all ${
        isDragging ? "opacity-50 rotate-3" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-mono text-sm font-bold uppercase leading-tight flex-1 break-words">
          {task.title}
        </h4>
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 flex-shrink-0 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="font-mono text-xs hover:text-[#FF3333]"
          >
            [E]
          </button>
          <button
            onClick={handleDelete}
            className="font-mono text-xs hover:text-[#FF3333]"
          >
            [X]
          </button>
        </div>
      </div>

      {task.description && (
        <p className="font-mono text-xs text-gray-600 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        {task.priority && (
          <span
            className={`font-mono text-[10px] px-2 py-0.5 border-2 border-black ${priorityColors[task.priority]}`}
          >
            {priorityLabels[task.priority]}
          </span>
        )}
        <span className="font-mono text-[10px] text-gray-400 ml-auto">
          #{task._id.slice(-4).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
