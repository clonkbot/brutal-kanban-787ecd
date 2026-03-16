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

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();

    return tasks.sort((a, b) => a.order - b.order);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    columnId: v.id("columns"),
    boardId: v.id("boards"),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const board = await ctx.db.get(args.boardId);
    if (!board || board.userId !== userId) throw new Error("Not authorized");

    const tasksInColumn = await ctx.db
      .query("tasks")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect();

    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      columnId: args.columnId,
      boardId: args.boardId,
      userId,
      order: tasksInColumn.length,
      priority: args.priority,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    const updates: Record<string, string | undefined> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.priority !== undefined) updates.priority = args.priority;

    await ctx.db.patch(args.id, updates);
  },
});

export const moveToColumn = mutation({
  args: {
    id: v.id("tasks"),
    columnId: v.id("columns"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, {
      columnId: args.columnId,
      order: args.order,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
