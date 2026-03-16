import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  boards: defineTable({
    name: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  columns: defineTable({
    name: v.string(),
    boardId: v.id("boards"),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_board", ["boardId"]),
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    columnId: v.id("columns"),
    boardId: v.id("boards"),
    userId: v.id("users"),
    order: v.number(),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    createdAt: v.number(),
  })
    .index("by_column", ["columnId"])
    .index("by_board", ["boardId"])
    .index("by_user", ["userId"]),
});
