import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const EVENT_STATUS = v.union(
  v.literal("Draft"),
  v.literal("Published"),
  v.literal("Cancelled"),
  v.literal("Completed")
);

const EVENT_TYPE = v.union(
  v.literal("Fundraiser"),
  v.literal("Gala"),
  v.literal("Workshop"),
  v.literal("Conference"),
  v.literal("Webinar"),
  v.literal("BoardMeeting"),
  v.literal("CommunityEvent"),
  v.literal("VolunteerOrientation"),
  v.literal("AnnualMeeting"),
  v.literal("Other")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("events").order("desc").take(100);
  },
});

export const listPublic = query({
  args: {
    eventType: v.optional(
      v.union(
        v.literal("Fundraiser"),
        v.literal("Gala"),
        v.literal("Workshop"),
        v.literal("Conference"),
        v.literal("Webinar"),
        v.literal("BoardMeeting"),
        v.literal("CommunityEvent"),
        v.literal("VolunteerOrientation"),
        v.literal("AnnualMeeting"),
        v.literal("Other")
      )
    ),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "Published"))
      .collect();
    return events.filter(
      (e) =>
        e.isPublic &&
        (!args.eventType || e.eventType === args.eventType)
    );
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const cutoff = now + thirtyDaysMs;
    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "Published"))
      .collect();
    return events.filter((e) => (e.startDateMs ?? 0) >= now && (e.startDateMs ?? 0) <= cutoff);
  },
});

export const getAttentionNeeded = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const drafts = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "Draft"))
      .collect();

    // Events with upcoming deadline but still in Draft, or approaching start with low registrations
    const results = [];
    for (const event of drafts) {
      const deadlineMs = event.registrationDeadlineMs;
      const deadlineClose =
        deadlineMs !== undefined &&
        deadlineMs - now < sevenDaysMs &&
        deadlineMs > now;
      const startMs = event.startDateMs;
      const startClose = startMs !== undefined && startMs - now < sevenDaysMs && startMs > now;
      if (deadlineClose || startClose) {
        results.push(event);
      }
    }
    return results;
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { totalRegistrationsThisMonth: 0, totalRegistrationsLastMonth: 0, totalRevenue: 0, upcomingCount: 0 };

    const now = Date.now();
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);
    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const allRegistrations = await ctx.db.query("registrations").collect();
    const thisMonthRegs = allRegistrations.filter(
      (r) => r.registrationDate >= startOfThisMonth.getTime() && r.status !== "Cancelled"
    );
    const lastMonthRegs = allRegistrations.filter(
      (r) =>
        r.registrationDate >= startOfLastMonth.getTime() &&
        r.registrationDate < startOfThisMonth.getTime() &&
        r.status !== "Cancelled"
    );

    const totalRevenue = thisMonthRegs
      .filter((r) => r.paymentStatus === "Paid")
      .reduce((sum, r) => sum + r.totalAmount, 0);

    const upcomingEvents = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "Published"))
      .collect();
    const upcomingCount = upcomingEvents.filter((e) => (e.startDateMs ?? 0) >= now).length;

    // Sponsorship revenue for upcoming events
    const upcomingEventIds = new Set(upcomingEvents.filter((e) => (e.startDateMs ?? 0) >= now).map((e) => e._id));
    const eventSponsors = await ctx.db.query("eventSponsors").collect();
    const sponsorRevenue = eventSponsors
      .filter((es) => upcomingEventIds.has(es.eventId))
      .reduce((sum, es) => sum + es.amount, 0);

    return {
      totalRegistrationsThisMonth: thisMonthRegs.length,
      totalRegistrationsLastMonth: lastMonthRegs.length,
      totalRevenue: totalRevenue + sponsorRevenue,
      upcomingCount,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    eventType: EVENT_TYPE,
    startDate: v.string(),
    startDateMs: v.number(),
    startTime: v.string(),
    endDate: v.string(),
    endDateMs: v.number(),
    endTime: v.string(),
    timezone: v.string(),
    venueId: v.optional(v.id("venues")),
    isVirtual: v.boolean(),
    virtualLink: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    registrationDeadline: v.optional(v.string()),
    registrationDeadlineMs: v.optional(v.number()),
    isPublic: v.boolean(),
    coverImageUrl: v.optional(v.string()),
    coordinatorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("events", {
      ...args,
      status: "Draft",
      createdById: user._id,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    eventType: v.optional(EVENT_TYPE),
    startDate: v.optional(v.string()),
    startDateMs: v.optional(v.number()),
    startTime: v.optional(v.string()),
    endDate: v.optional(v.string()),
    endDateMs: v.optional(v.number()),
    endTime: v.optional(v.string()),
    timezone: v.optional(v.string()),
    venueId: v.optional(v.id("venues")),
    isVirtual: v.optional(v.boolean()),
    virtualLink: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    registrationDeadline: v.optional(v.string()),
    registrationDeadlineMs: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    coverImageUrl: v.optional(v.string()),
    coordinatorId: v.optional(v.id("users")),
    status: v.optional(EVENT_STATUS),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Event not found");
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Event not found");
    await ctx.db.delete(args.id);
  },
});

export const publish = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    // Business rule: must have name + at least one ticket type + venue or virtualLink
    if (!event.name || event.name.trim() === "") {
      throw new Error("Event must have a name before publishing");
    }
    const ticketTypes = await ctx.db
      .query("ticketTypes")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
      .collect();
    if (ticketTypes.length === 0) {
      throw new Error("Event must have at least one ticket type before publishing");
    }
    if (!event.venueId && !event.virtualLink) {
      throw new Error("Event must have a venue or a virtual link before publishing");
    }

    await ctx.db.patch(args.id, { status: "Published" });
  },
});

export const cancel = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    await ctx.db.patch(args.id, { status: "Cancelled" });

    // Business rule: update all active registrations to Cancelled
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
      .collect();

    for (const reg of registrations) {
      if (reg.status !== "Cancelled") {
        await ctx.db.patch(reg._id, { status: "Cancelled" });
      }
    }
  },
});

export const duplicate = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const source = await ctx.db.get(args.id);
    if (!source) throw new Error("Event not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Business rule: new Draft, no registrations, copy all settings
    const newEventId = await ctx.db.insert("events", {
      name: `${source.name} (Copy)`,
      description: source.description,
      eventType: source.eventType,
      startDate: source.startDate,
      startDateMs: source.startDateMs,
      startTime: source.startTime,
      endDate: source.endDate,
      endDateMs: source.endDateMs,
      endTime: source.endTime,
      timezone: source.timezone,
      venueId: source.venueId,
      isVirtual: source.isVirtual,
      virtualLink: source.virtualLink,
      maxCapacity: source.maxCapacity,
      registrationDeadline: source.registrationDeadline,
      registrationDeadlineMs: source.registrationDeadlineMs,
      isPublic: source.isPublic,
      coverImageUrl: source.coverImageUrl,
      coordinatorId: source.coordinatorId,
      status: "Draft",
      createdById: user._id,
      createdAt: Date.now(),
    });

    // Duplicate ticket types
    const ticketTypes = await ctx.db
      .query("ticketTypes")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
      .collect();
    for (const tt of ticketTypes) {
      await ctx.db.insert("ticketTypes", {
        eventId: newEventId,
        name: tt.name,
        description: tt.description,
        price: tt.price,
        maxQuantity: tt.maxQuantity,
        salesStartDate: tt.salesStartDate,
        salesStartDateMs: tt.salesStartDateMs,
        salesEndDate: tt.salesEndDate,
        salesEndDateMs: tt.salesEndDateMs,
        status: "Active",
        createdAt: Date.now(),
      });
    }

    return newEventId;
  },
});
