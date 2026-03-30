import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const SESSION_TYPE = v.union(
  v.literal("Keynote"),
  v.literal("Breakout"),
  v.literal("Workshop"),
  v.literal("Panel"),
  v.literal("Networking"),
  v.literal("Meal")
);

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Join speaker names
    const results = await Promise.all(
      sessions.map(async (session) => {
        const speakers = await Promise.all(
          (session.speakerIds ?? []).map(async (speakerId) => {
            const speaker = await ctx.db.get(speakerId);
            return speaker
              ? { _id: speaker._id, firstName: speaker.firstName, lastName: speaker.lastName }
              : null;
          })
        );
        return {
          ...session,
          speakers: speakers.filter(Boolean),
        };
      })
    );

    // Sort by startTime string
    return results.sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    room: v.optional(v.string()),
    sessionType: SESSION_TYPE,
    capacity: v.optional(v.number()),
    speakerIds: v.array(v.id("speakers")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    return await ctx.db.insert("sessions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("sessions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    room: v.optional(v.string()),
    sessionType: v.optional(SESSION_TYPE),
    capacity: v.optional(v.number()),
    speakerIds: v.optional(v.array(v.id("speakers"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Session not found");
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Session not found");
    await ctx.db.delete(args.id);
  },
});
