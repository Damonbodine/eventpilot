import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, assertRole } from "./auth.helpers";

const SPONSORSHIP_LEVEL = v.union(
  v.literal("Presenting"),
  v.literal("Gold"),
  v.literal("Silver"),
  v.literal("Bronze"),
  v.literal("InKind"),
  v.literal("MediaPartner")
);

const SPONSOR_STATUS = v.union(
  v.literal("Pledged"),
  v.literal("Confirmed"),
  v.literal("Paid"),
  v.literal("Cancelled")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("sponsors").order("desc").take(200);
  },
});

export const getById = query({
  args: { id: v.id("sponsors") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const sponsor = await ctx.db.get(args.id);
    if (!sponsor) return null;

    // Event history: find all EventSponsor records for this sponsor
    const eventSponsors = await ctx.db
      .query("eventSponsors")
      .withIndex("by_sponsorId", (q) => q.eq("sponsorId", args.id))
      .take(100);

    const eventHistory = await Promise.all(
      eventSponsors.map(async (es) => {
        const event = await ctx.db.get(es.eventId);
        return {
          eventSponsorId: es._id,
          eventId: es.eventId,
          eventName: event?.name ?? "Unknown Event",
          eventStartDate: event?.startDate ?? "",
          sponsorshipLevel: es.sponsorshipLevel,
          amount: es.amount,
          notes: es.notes,
        };
      })
    );

    return { ...sponsor, eventHistory };
  },
});

export const create = mutation({
  args: {
    organizationName: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    sponsorshipLevel: SPONSORSHIP_LEVEL,
    amount: v.number(),
    benefits: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin", "EventCoordinator", "Coordinator"]);
    return await ctx.db.insert("sponsors", {
      ...args,
      status: "Pledged",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("sponsors"),
    organizationName: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    sponsorshipLevel: v.optional(SPONSORSHIP_LEVEL),
    amount: v.optional(v.number()),
    benefits: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    status: v.optional(SPONSOR_STATUS),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin", "EventCoordinator", "Coordinator"]);
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Sponsor not found");
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("sponsors") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Sponsor not found");
    await ctx.db.delete(args.id);
  },
});
