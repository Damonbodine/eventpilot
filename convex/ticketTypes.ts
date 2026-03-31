import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, assertCanManageEvent } from "./auth.helpers";

const TICKET_STATUS = v.union(
  v.literal("Active"),
  v.literal("SoldOut"),
  v.literal("Inactive")
);

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ticketTypes")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .take(100);
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    maxQuantity: v.optional(v.number()),
    salesStartDate: v.optional(v.string()),
    salesStartDateMs: v.optional(v.number()),
    salesEndDate: v.optional(v.string()),
    salesEndDateMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await assertCanManageEvent(ctx, user, args.eventId);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    return await ctx.db.insert("ticketTypes", {
      ...args,
      status: "Active",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("ticketTypes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    maxQuantity: v.optional(v.number()),
    salesStartDate: v.optional(v.string()),
    salesStartDateMs: v.optional(v.number()),
    salesEndDate: v.optional(v.string()),
    salesEndDateMs: v.optional(v.number()),
    status: v.optional(TICKET_STATUS),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Ticket type not found");
    await assertCanManageEvent(ctx, user, existing.eventId);
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("ticketTypes") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Ticket type not found");
    await assertCanManageEvent(ctx, user, existing.eventId);
    await ctx.db.delete(args.id);
  },
});
