import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, assertRole } from "./auth.helpers";

const SPEAKER_STATUS = v.union(
  v.literal("Confirmed"),
  v.literal("Tentative"),
  v.literal("Declined")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("speakers").order("desc").take(200);
  },
});

export const getById = query({
  args: { id: v.id("speakers") },
  handler: async (ctx, args) => {
    const speaker = await ctx.db.get(args.id);
    if (!speaker) return null;

    // Event history: find all sessions this speaker is assigned to
    const sessions = await ctx.db.query("sessions").take(500);
    const speakerSessions = sessions.filter((s) =>
      (s.speakerIds ?? []).some((sid) => sid === args.id)
    );

    const eventHistory = await Promise.all(
      speakerSessions.map(async (session) => {
        const event = await ctx.db.get(session.eventId);
        return {
          sessionId: session._id,
          sessionTitle: session.title,
          sessionType: session.sessionType,
          eventId: session.eventId,
          eventName: event?.name ?? "Unknown Event",
          eventStartDate: event?.startDate ?? "",
        };
      })
    );

    return { ...speaker, eventHistory };
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    title: v.optional(v.string()),
    organization: v.optional(v.string()),
    bio: v.string(),
    headshotUrl: v.optional(v.string()),
    status: SPEAKER_STATUS,
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin", "EventCoordinator", "Coordinator"]);
    return await ctx.db.insert("speakers", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("speakers"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    title: v.optional(v.string()),
    organization: v.optional(v.string()),
    bio: v.optional(v.string()),
    headshotUrl: v.optional(v.string()),
    status: v.optional(SPEAKER_STATUS),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin", "EventCoordinator", "Coordinator"]);
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Speaker not found");
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("speakers") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Speaker not found");
    await ctx.db.delete(args.id);
  },
});
