import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface Board {
  _id: Id<"boards">;
  name: string;
  userId: Id<"users">;
  createdAt: number;
}

interface BoardListProps {
  onSelectBoard: (boardId: Id<"boards">) => void;
}

export function BoardList({ onSelectBoard }: BoardListProps) {
  const boards = useQuery(api.boards.list);
  const createBoard = useMutation(api.boards.create);
  const deleteBoard = useMutation(api.boards.remove);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    const boardId = await createBoard({ name: newBoardName.trim() });
    setNewBoardName("");
    setIsCreating(false);
    onSelectBoard(boardId);
  };

  const handleDelete = async (e: React.MouseEvent, boardId: Id<"boards">) => {
    e.stopPropagation();
    if (confirm("DELETE THIS BOARD? ALL TASKS WILL BE DESTROYED.")) {
      await deleteBoard({ id: boardId });
    }
  };

  if (boards === undefined) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="font-mono text-2xl md:text-3xl font-black animate-pulse">LOADING BOARDS...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="font-mono text-3xl md:text-5xl font-black uppercase">
          YOUR BOARDS
          <span className="text-[#FF3333]">_</span>
        </h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-black text-[#F5F5DC] font-mono text-sm uppercase px-4 md:px-6 py-3 border-4 border-black hover:bg-[#FF3333] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            + NEW BOARD
          </button>
        )}
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="mb-8 bg-white border-8 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1"
        >
          <label className="font-mono text-xs font-bold uppercase tracking-wider block mb-2">
            BOARD NAME
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="flex-1 border-4 border-black p-3 font-mono text-lg focus:outline-none focus:bg-[#FFFF00] transition-colors"
              placeholder="PROJECT ALPHA"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none bg-black text-[#F5F5DC] font-mono uppercase px-6 py-3 border-4 border-black hover:bg-[#FF3333] transition-colors"
              >
                CREATE
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 sm:flex-none font-mono uppercase px-6 py-3 border-4 border-black hover:bg-[#FF3333] hover:text-white transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </form>
      )}

      {boards.length === 0 ? (
        <div className="text-center py-16 md:py-24">
          <div className="inline-block bg-white border-8 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-2">
            <p className="font-mono text-xl md:text-2xl font-black uppercase mb-4">NO BOARDS YET</p>
            <p className="font-mono text-sm text-gray-600 uppercase">
              CREATE YOUR FIRST BOARD TO GET STARTED
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board: Board, index: number) => (
            <div
              key={board._id}
              onClick={() => onSelectBoard(board._id)}
              className="group cursor-pointer bg-white border-8 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,51,51,1)] hover:border-[#FF3333] transition-all duration-150 active:translate-x-1 active:translate-y-1 active:shadow-none"
              style={{ transform: `rotate(${(index % 3 - 1) * 1}deg)` }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-mono text-xl md:text-2xl font-black uppercase leading-tight break-all pr-2">
                  {board.name}
                </h3>
                <button
                  onClick={(e) => handleDelete(e, board._id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-lg hover:text-[#FF3333] flex-shrink-0"
                >
                  [X]
                </button>
              </div>
              <div className="h-1 bg-black group-hover:bg-[#FF3333] transition-colors w-full"></div>
              <p className="font-mono text-xs text-gray-500 mt-4 uppercase">
                CREATED {new Date(board.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
