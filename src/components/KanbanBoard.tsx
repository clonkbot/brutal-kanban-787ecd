import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { AddTaskForm } from "./AddTaskForm";

interface Column {
  _id: Id<"columns">;
  name: string;
  boardId: Id<"boards">;
  order: number;
  createdAt: number;
}

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  columnId: Id<"columns">;
  boardId: Id<"boards">;
  userId: Id<"users">;
  order: number;
  priority?: "low" | "medium" | "high";
  createdAt: number;
}

interface KanbanBoardProps {
  boardId: Id<"boards">;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const board = useQuery(api.boards.get, { id: boardId });
  const columns = useQuery(api.columns.listByBoard, { boardId });
  const tasks = useQuery(api.tasks.listByBoard, { boardId });
  const moveTask = useMutation(api.tasks.moveToColumn);
  const createColumn = useMutation(api.columns.create);

  const [draggingTaskId, setDraggingTaskId] = useState<Id<"tasks"> | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  if (board === undefined || columns === undefined || tasks === undefined) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="font-mono text-2xl md:text-3xl font-black animate-pulse">LOADING BOARD...</div>
      </div>
    );
  }

  if (board === null) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#FF3333] text-white font-mono text-xl md:text-2xl font-black p-6 md:p-8 border-8 border-black">
          BOARD NOT FOUND
        </div>
      </div>
    );
  }

  const getTasksForColumn = (columnId: Id<"columns">): Task[] => {
    return tasks.filter((task: Task) => task.columnId === columnId);
  };

  const handleDragStart = (taskId: Id<"tasks">) => {
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  const handleDrop = async (columnId: Id<"columns">) => {
    if (!draggingTaskId) return;

    const tasksInColumn = getTasksForColumn(columnId);
    await moveTask({
      id: draggingTaskId,
      columnId,
      order: tasksInColumn.length,
    });
    setDraggingTaskId(null);
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    await createColumn({ boardId, name: newColumnName.trim().toUpperCase() });
    setNewColumnName("");
    setIsAddingColumn(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Board title */}
      <div className="px-4 md:px-6 py-4 border-b-4 border-black bg-[#FFFF00]">
        <h2 className="font-mono text-2xl md:text-4xl font-black uppercase tracking-tight">
          {board.name}
        </h2>
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 md:gap-6 p-4 md:p-6 min-h-full items-start">
          {columns.map((column: Column, index: number) => (
            <div
              key={column._id}
              className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] bg-white border-4 md:border-6 border-black flex flex-col max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-240px)]"
              style={{ transform: `rotate(${(index % 2 === 0 ? 0.5 : -0.5)}deg)` }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(column._id)}
            >
              {/* Column header */}
              <div className="bg-black text-[#F5F5DC] p-3 md:p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-sm md:text-base font-black uppercase tracking-wider truncate pr-2">
                    {column.name}
                  </h3>
                  <span className="font-mono text-xs bg-[#FF3333] text-white px-2 py-1 flex-shrink-0">
                    {getTasksForColumn(column._id).length}
                  </span>
                </div>
              </div>

              {/* Tasks container */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-[#F5F5DC]/30">
                {getTasksForColumn(column._id).map((task: Task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onDragStart={() => handleDragStart(task._id)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggingTaskId === task._id}
                  />
                ))}

                {/* Drop zone indicator */}
                {draggingTaskId && getTasksForColumn(column._id).length === 0 && (
                  <div className="border-4 border-dashed border-black/30 h-24 flex items-center justify-center font-mono text-sm uppercase text-black/40">
                    DROP HERE
                  </div>
                )}
              </div>

              {/* Add task */}
              <div className="border-t-4 border-black flex-shrink-0">
                <AddTaskForm boardId={boardId} columnId={column._id} />
              </div>
            </div>
          ))}

          {/* Add column */}
          <div className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]">
            {isAddingColumn ? (
              <form
                onSubmit={handleAddColumn}
                className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="w-full border-4 border-black p-3 font-mono uppercase focus:outline-none focus:bg-[#FFFF00]"
                  placeholder="COLUMN NAME"
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-[#F5F5DC] font-mono text-sm uppercase py-2 border-4 border-black hover:bg-[#FF3333]"
                  >
                    ADD
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingColumn(false)}
                    className="flex-1 font-mono text-sm uppercase py-2 border-4 border-black hover:bg-[#FF3333] hover:text-white"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-full bg-white/50 border-4 border-dashed border-black/50 p-4 md:p-6 font-mono text-sm md:text-base uppercase hover:bg-white hover:border-solid hover:border-black transition-all"
              >
                + ADD COLUMN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
