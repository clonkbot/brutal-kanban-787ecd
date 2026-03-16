import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { BoardList } from "./components/BoardList";
import { KanbanBoard } from "./components/KanbanBoard";
import { Id } from "../convex/_generated/dataModel";

function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError("Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brutalist title block */}
        <div className="bg-black text-[#F5F5DC] p-6 md:p-8 border-8 border-black mb-0 transform -rotate-1">
          <h1 className="font-mono text-4xl md:text-6xl font-black tracking-tighter leading-none">
            KANBAN
          </h1>
          <div className="h-1 bg-[#FF3333] w-24 mt-2"></div>
          <p className="font-mono text-xs md:text-sm mt-4 uppercase tracking-widest opacity-80">
            BRUTAL PRODUCTIVITY
          </p>
        </div>

        {/* Auth form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-8 border-black p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1"
        >
          <h2 className="font-mono text-2xl md:text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2">
            {flow === "signIn" ? "ENTER" : "REGISTER"}
          </h2>

          {error && (
            <div className="bg-[#FF3333] text-white font-mono text-sm p-3 mb-4 border-4 border-black">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="font-mono text-xs font-bold uppercase tracking-wider block mb-2">
                EMAIL
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:bg-[#FFFF00] transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="font-mono text-xs font-bold uppercase tracking-wider block mb-2">
                PASSWORD
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:bg-[#FFFF00] transition-colors"
                placeholder="********"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-black text-[#F5F5DC] font-mono text-lg md:text-xl font-black uppercase py-4 border-4 border-black hover:bg-[#FF3333] hover:text-white transition-colors disabled:opacity-50 active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {loading ? "PROCESSING..." : flow === "signIn" ? "SIGN IN" : "SIGN UP"}
          </button>

          <button
            type="button"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="w-full mt-3 font-mono text-sm uppercase underline hover:text-[#FF3333] transition-colors"
          >
            {flow === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </form>

        {/* Anonymous option */}
        <button
          onClick={() => signIn("anonymous")}
          className="w-full mt-4 bg-[#F5F5DC] font-mono text-sm uppercase py-3 border-4 border-black hover:bg-[#FFFF00] transition-colors transform -rotate-1"
        >
          CONTINUE AS GUEST
        </button>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [selectedBoardId, setSelectedBoardId] = useState<Id<"boards"> | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="font-mono text-4xl md:text-6xl font-black tracking-tighter">
            LOADING<span className="animate-bounce inline-block">.</span>
            <span className="animate-bounce inline-block" style={{ animationDelay: "0.1s" }}>.</span>
            <span className="animate-bounce inline-block" style={{ animationDelay: "0.2s" }}>.</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex flex-col">
      {/* Header */}
      <header className="bg-black text-[#F5F5DC] border-b-8 border-[#FF3333] sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6">
            {selectedBoardId && (
              <button
                onClick={() => setSelectedBoardId(null)}
                className="font-mono text-sm uppercase hover:text-[#FF3333] transition-colors flex items-center gap-2"
              >
                <span className="text-xl">&larr;</span>
                <span className="hidden sm:inline">BOARDS</span>
              </button>
            )}
            <h1 className="font-mono text-xl md:text-3xl font-black tracking-tighter">
              KANBAN<span className="text-[#FF3333]">.</span>
            </h1>
          </div>
          <button
            onClick={() => signOut()}
            className="font-mono text-xs md:text-sm uppercase px-3 md:px-4 py-2 border-2 border-[#F5F5DC] hover:bg-[#FF3333] hover:border-[#FF3333] transition-colors"
          >
            EXIT
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {selectedBoardId ? (
          <KanbanBoard boardId={selectedBoardId} />
        ) : (
          <BoardList onSelectBoard={setSelectedBoardId} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-[#F5F5DC]/50 border-t-4 border-black py-3">
        <p className="text-center font-mono text-xs">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

export default App;
