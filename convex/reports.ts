import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAttendanceReport = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let events;
    if (args.eventId) {
      const event = await ctx.db.get(args.eventId);
      events = event ? [event] : [];
    } else {
      events = await ctx.db.query("events").order("desc").take(100);
    }

    const report = await Promise.all(
      events.map(async (event) => {
        const registrations = await ctx.db
          .query("registrations")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .take(500);

        const confirmed = registrations.filter((r) => r.status === "Confirmed");
        const totalRegistered = confirmed.reduce((sum, r) => sum + r.quantity, 0);
        const totalCheckedIn = confirmed
          .filter((r) => r.checkedIn)
          .reduce((sum, r) => sum + r.quantity, 0);
        const waitlisted = registrations
          .filter((r) => r.status === "WaitListed")
          .reduce((sum, r) => sum + r.quantity, 0);
        const cancelled = registrations
          .filter((r) => r.status === "Cancelled")
          .reduce((sum, r) => sum + r.quantity, 0);
        const noShowRate =
          totalRegistered > 0
            ? Math.round(((totalRegistered - totalCheckedIn) / totalRegistered) * 100)
            : 0;

        return {
          eventId: event._id,
          eventName: event.name,
          eventStartDate: event.startDate,
          eventType: event.eventType,
          status: event.status,
          totalRegistered,
          totalCheckedIn,
          waitlisted,
          cancelled,
          noShowRate,
          capacity: event.maxCapacity ?? null,
        };
      })
    );

    return report;
  },
});

export const getRevenueReport = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let events;
    if (args.eventId) {
      const event = await ctx.db.get(args.eventId);
      events = event ? [event] : [];
    } else {
      events = await ctx.db.query("events").order("desc").take(100);
    }

    const report = await Promise.all(
      events.map(async (event) => {
        const registrations = await ctx.db
          .query("registrations")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .take(500);

        const paidRegistrations = registrations.filter(
          (r) => r.status !== "Cancelled" && r.paymentStatus === "Paid"
        );
        const ticketRevenue = paidRegistrations.reduce((sum, r) => sum + r.totalAmount, 0);
        const pendingRevenue = registrations
          .filter((r) => r.status !== "Cancelled" && r.paymentStatus === "Pending")
          .reduce((sum, r) => sum + r.totalAmount, 0);
        const refundedAmount = registrations
          .filter((r) => r.paymentStatus === "Refunded")
          .reduce((sum, r) => sum + r.totalAmount, 0);

        const eventSponsors = await ctx.db
          .query("eventSponsors")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .take(100);
        const sponsorRevenue = eventSponsors.reduce((sum, es) => sum + es.amount, 0);

        return {
          eventId: event._id,
          eventName: event.name,
          eventStartDate: event.startDate,
          eventType: event.eventType,
          status: event.status,
          ticketRevenue,
          pendingRevenue,
          refundedAmount,
          sponsorRevenue,
          totalRevenue: ticketRevenue + sponsorRevenue,
          registrationCount: registrations.filter((r) => r.status !== "Cancelled").length,
        };
      })
    );

    return report;
  },
});

export const getSponsorTotals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const eventSponsors = await ctx.db.query("eventSponsors").take(500);
    const sponsors = await ctx.db.query("sponsors").take(200);

    // Aggregate by sponsorship level
    const byLevel: Record<string, { count: number; totalAmount: number; sponsors: Set<string> }> = {};
    for (const es of eventSponsors) {
      if (!byLevel[es.sponsorshipLevel]) {
        byLevel[es.sponsorshipLevel] = { count: 0, totalAmount: 0, sponsors: new Set() };
      }
      byLevel[es.sponsorshipLevel].count += 1;
      byLevel[es.sponsorshipLevel].totalAmount += es.amount;
      byLevel[es.sponsorshipLevel].sponsors.add(es.sponsorId);
    }

    // Per-sponsor totals
    const sponsorTotals = sponsors.map((sponsor) => {
      const links = eventSponsors.filter((es) => es.sponsorId === sponsor._id);
      const totalContributed = links.reduce((sum, es) => sum + es.amount, 0);
      const eventCount = links.length;
      return {
        sponsorId: sponsor._id,
        organizationName: sponsor.organizationName,
        sponsorshipLevel: sponsor.sponsorshipLevel,
        status: sponsor.status,
        totalContributed,
        eventCount,
      };
    });

    const levelSummary = Object.entries(byLevel).map(([level, data]) => ({
      level,
      sponsorCount: data.sponsors.size,
      totalEventLinks: data.count,
      totalAmount: data.totalAmount,
    }));

    return {
      byLevel: levelSummary,
      byOrganization: sponsorTotals.sort((a, b) => b.totalContributed - a.totalContributed),
    };
  },
});
