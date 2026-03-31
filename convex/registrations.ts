import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, assertRole, assertCanManageEvent, assertCanCheckIn } from "./auth.helpers";

const PAYMENT_STATUS = v.union(
  v.literal("Pending"),
  v.literal("Paid"),
  v.literal("Comped"),
  v.literal("Refunded")
);

const REG_STATUS = v.union(
  v.literal("Confirmed"),
  v.literal("Cancelled"),
  v.literal("WaitListed")
);

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .take(500);

    // Join ticketType name
    const results = await Promise.all(
      registrations.map(async (reg) => {
        const ticketType = await ctx.db.get(reg.ticketTypeId);
        return {
          ...reg,
          ticketTypeName: ticketType?.name ?? "Unknown",
        };
      })
    );
    return results;
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    ticketTypeId: v.id("ticketTypes"),
    attendeeName: v.string(),
    attendeeEmail: v.string(),
    attendeePhone: v.optional(v.string()),
    organizationName: v.optional(v.string()),
    quantity: v.number(),
    specialRequests: v.optional(v.string()),
    registeredById: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Registration is allowed for any authenticated user (including Registrants)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (event.status === "Cancelled") throw new Error("Cannot register for a cancelled event");

    // Business rule: registration deadline enforcement
    if (event.registrationDeadlineMs && Date.now() > event.registrationDeadlineMs) {
      throw new Error("Registration deadline has passed");
    }

    const ticketType = await ctx.db.get(args.ticketTypeId);
    if (!ticketType) throw new Error("Ticket type not found");
    if (ticketType.status === "Inactive") throw new Error("This ticket type is no longer available");

    // Enforce ticket sales dates
    if (ticketType.salesStartDateMs && Date.now() < ticketType.salesStartDateMs) {
      throw new Error("Ticket sales have not started yet");
    }
    if (ticketType.salesEndDateMs && Date.now() > ticketType.salesEndDateMs) {
      throw new Error("Ticket sales have ended");
    }

    // Business rule: capacity check
    let registrationStatus: "Confirmed" | "WaitListed" = "Confirmed";
    if (ticketType.maxQuantity !== undefined && ticketType.maxQuantity !== null) {
      const existingRegs = await ctx.db
        .query("registrations")
        .withIndex("by_ticketTypeId", (q) => q.eq("ticketTypeId", args.ticketTypeId))
        .take(500);
      const soldCount = existingRegs
        .filter((r) => r.status !== "Cancelled")
        .reduce((sum, r) => sum + r.quantity, 0);
      if (soldCount + args.quantity > ticketType.maxQuantity) {
        // Business rule: waitlist if sold out
        registrationStatus = "WaitListed";
        // Mark ticket type as SoldOut if exactly at capacity
        if (soldCount >= ticketType.maxQuantity) {
          await ctx.db.patch(args.ticketTypeId, { status: "SoldOut" });
        }
      }
    }

    // Also check event-level maxCapacity
    if (event.maxCapacity !== undefined && event.maxCapacity !== null && registrationStatus === "Confirmed") {
      const allEventRegs = await ctx.db
        .query("registrations")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .take(500);
      const totalConfirmed = allEventRegs
        .filter((r) => r.status !== "Cancelled")
        .reduce((sum, r) => sum + r.quantity, 0);
      if (totalConfirmed + args.quantity > event.maxCapacity) {
        registrationStatus = "WaitListed";
      }
    }

    const totalAmount = ticketType.price * args.quantity;
    return await ctx.db.insert("registrations", {
      eventId: args.eventId,
      ticketTypeId: args.ticketTypeId,
      attendeeName: args.attendeeName,
      attendeeEmail: args.attendeeEmail,
      attendeePhone: args.attendeePhone,
      organizationName: args.organizationName,
      quantity: args.quantity,
      totalAmount,
      paymentStatus: totalAmount === 0 ? "Paid" : "Pending",
      registrationDate: Date.now(),
      specialRequests: args.specialRequests,
      status: registrationStatus,
      checkedIn: false,
      registeredById: args.registeredById,
      createdAt: Date.now(),
    });
  },
});

export const checkIn = mutation({
  args: { id: v.id("registrations") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const registration = await ctx.db.get(args.id);
    if (!registration) throw new Error("Registration not found");

    // Role check: Admin, EventCoordinator, Coordinator, or Volunteer can check in
    await assertCanCheckIn(ctx, user, registration.eventId);

    // Business rule: only Confirmed registrations can be checked in
    if (registration.status !== "Confirmed") {
      throw new Error("Only confirmed registrations can be checked in");
    }
    if (registration.checkedIn) {
      throw new Error("Attendee is already checked in");
    }

    await ctx.db.patch(args.id, {
      checkedIn: true,
      checkedInAt: Date.now(),
      checkedInById: user._id,
    });
  },
});

export const updatePaymentStatus = mutation({
  args: {
    id: v.id("registrations"),
    paymentStatus: PAYMENT_STATUS,
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin", "EventCoordinator", "Coordinator"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Registration not found");
    await ctx.db.patch(args.id, { paymentStatus: args.paymentStatus });
  },
});

export const cancel = mutation({
  args: { id: v.id("registrations") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    assertRole(user, ["Admin", "EventCoordinator", "Coordinator"]);
    const registration = await ctx.db.get(args.id);
    if (!registration) throw new Error("Registration not found");
    if (registration.status === "Cancelled") throw new Error("Registration is already cancelled");
    await ctx.db.patch(args.id, { status: "Cancelled" });

    // If a confirmed slot opens up, check for waitlisted registrations for same ticket type
    if (registration.status === "Confirmed") {
      const waitlisted = await ctx.db
        .query("registrations")
        .withIndex("by_ticketTypeId", (q) => q.eq("ticketTypeId", registration.ticketTypeId))
        .take(500);
      const firstWaitlisted = waitlisted.find((r) => r.status === "WaitListed");
      if (firstWaitlisted) {
        await ctx.db.patch(firstWaitlisted._id, { status: "Confirmed" });
      }
      // Re-check if ticket type should be Active again
      const ticketType = await ctx.db.get(registration.ticketTypeId);
      if (ticketType && ticketType.status === "SoldOut" && ticketType.maxQuantity) {
        const remaining = await ctx.db
          .query("registrations")
          .withIndex("by_ticketTypeId", (q) => q.eq("ticketTypeId", registration.ticketTypeId))
          .take(500);
        const soldCount = remaining
          .filter((r) => r.status !== "Cancelled" && r._id !== args.id)
          .reduce((sum, r) => sum + r.quantity, 0);
        if (soldCount < ticketType.maxQuantity) {
          await ctx.db.patch(ticketType._id, { status: "Active" });
        }
      }
    }
  },
});

export const getCheckInStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { total: 0, checkedIn: 0, notCheckedIn: 0 };
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .take(500);
    const confirmed = registrations.filter((r) => r.status === "Confirmed");
    const checkedIn = confirmed.filter((r) => r.checkedIn);
    return {
      total: confirmed.reduce((sum, r) => sum + r.quantity, 0),
      checkedIn: checkedIn.reduce((sum, r) => sum + r.quantity, 0),
      notCheckedIn: confirmed.filter((r) => !r.checkedIn).reduce((sum, r) => sum + r.quantity, 0),
    };
  },
});
