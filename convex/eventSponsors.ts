import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, assertCanManageEvent } from "./auth.helpers";

const SPONSORSHIP_LEVEL = v.union(
  v.literal("Presenting"),
  v.literal("Gold"),
  v.literal("Silver"),
  v.literal("Bronze"),
  v.literal("InKind"),
  v.literal("MediaPartner")
);

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const eventSponsors = await ctx.db
      .query("eventSponsors")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .take(100);

    // Join sponsor name and details
    const results = await Promise.all(
      eventSponsors.map(async (es) => {
        const sponsor = await ctx.db.get(es.sponsorId);
        return {
          ...es,
          sponsorName: sponsor?.organizationName ?? "Unknown",
          sponsorLogoUrl: sponsor?.logoUrl,
          sponsorContactName: sponsor?.contactName,
          sponsorContactEmail: sponsor?.contactEmail,
        };
      })
    );
    return results;
  },
});

export const listBySponsor = query({
  args: { sponsorId: v.id("sponsors") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const eventSponsors = await ctx.db
      .query("eventSponsors")
      .withIndex("by_sponsorId", (q) => q.eq("sponsorId", args.sponsorId))
      .take(100);

    // Join event name and date
    const results = await Promise.all(
      eventSponsors.map(async (es) => {
        const event = await ctx.db.get(es.eventId);
        return {
          ...es,
          eventName: event?.name ?? "Unknown Event",
          eventStartDate: event?.startDate ?? "",
          eventStatus: event?.status ?? "Unknown",
        };
      })
    );
    return results;
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    sponsorId: v.id("sponsors"),
    sponsorshipLevel: SPONSORSHIP_LEVEL,
    amount: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await assertCanManageEvent(ctx, user, args.eventId);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    const sponsor = await ctx.db.get(args.sponsorId);
    if (!sponsor) throw new Error("Sponsor not found");

    // Prevent duplicate event-sponsor links
    const existing = await ctx.db
      .query("eventSponsors")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .take(100);
    const duplicate = existing.find((es) => es.sponsorId === args.sponsorId);
    if (duplicate) throw new Error("This sponsor is already linked to this event");

    return await ctx.db.insert("eventSponsors", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("eventSponsors") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Event sponsor link not found");
    await assertCanManageEvent(ctx, user, existing.eventId);
    await ctx.db.delete(args.id);
  },
});
