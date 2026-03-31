import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, assertRole } from "./auth.helpers";

const VENUE_STATUS = v.union(v.literal("Active"), v.literal("Inactive"));

const AMENITY = v.union(
  v.literal("Projector"),
  v.literal("Microphone"),
  v.literal("Wifi"),
  v.literal("Parking"),
  v.literal("Catering"),
  v.literal("Wheelchair"),
  v.literal("Outdoor"),
  v.literal("Kitchen"),
  v.literal("Stage")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("venues").order("desc").take(200);
  },
});

export const getById = query({
  args: { id: v.id("venues") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    capacity: v.number(),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    amenities: v.array(AMENITY),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin", "EventCoordinator", "Coordinator"]);
    return await ctx.db.insert("venues", {
      ...args,
      status: "Active",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("venues"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    capacity: v.optional(v.number()),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    amenities: v.optional(v.array(AMENITY)),
    notes: v.optional(v.string()),
    status: v.optional(VENUE_STATUS),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin", "EventCoordinator", "Coordinator"]);
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Venue not found");
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("venues") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Venue not found");
    await ctx.db.delete(args.id);
  },
});
