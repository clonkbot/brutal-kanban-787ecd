import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByBoard = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const board = await ctx.db.get(args.boardId);
    if (!board || board.userId !== userId) return [];

    const columns = await ctx.db
      .query("columns")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();

    return columns.sort((a, b) => a.order - b.order);
  },
});

export const create = mutation({
  args: { boardId: v.id("boards"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const board = await ctx.db.get(args.boardId);
    if (!board || board.userId !== userId) throw new Error("Not authorized");

    const columns = await ctx.db
      .query("columns")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();

    return await ctx.db.insert("columns", {
      name: args.name,
      boardId: args.boardId,
      order: columns.length,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { id: v.id("columns"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const column = await ctx.db.get(args.id);
    if (!column) throw new Error("Not found");

    const board = await ctx.db.get(column.boardId);
    if (!board || board.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, { name: args.name });
  },
});

export const remove = mutation({
  args: { id: v.id("columns") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const column = await ctx.db.get(args.id);
    if (!column) throw new Error("Not found");

    const board = await ctx.db.get(column.boardId);
    if (!board || board.userId !== userId) throw new Error("Not authorized");

    // Delete all tasks in this column
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_column", (q) => q.eq("columnId", args.id))
      .collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    await ctx.db.delete(args.id);
  },
});
