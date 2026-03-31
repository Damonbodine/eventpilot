import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createTestUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal("Admin"), v.literal("EventCoordinator"), v.literal("Volunteer"), v.literal("Registrant")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role,
      createdAt: Date.now(),
    });
  },
});

export const seedDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Idempotency check — skip if users already seeded
    const existingUsers = await ctx.db.query("users").first();
    if (existingUsers !== null) {
      console.log("Database already seeded, skipping.");
      return { skipped: true };
    }

    const now = Date.now();

    // ─── USERS ────────────────────────────────────────────────────
    const adminId = await ctx.db.insert("users", {
      clerkId: "user_seed_admin_001",
      name: "Sarah Chen",
      email: "sarah@eventpilot.org",
      role: "Admin",
      createdAt: now,
    });

    const coord1Id = await ctx.db.insert("users", {
      clerkId: "user_seed_coord_001",
      name: "Marcus Johnson",
      email: "marcus@eventpilot.org",
      role: "EventCoordinator",
      createdAt: now,
    });

    const coord2Id = await ctx.db.insert("users", {
      clerkId: "user_seed_coord_002",
      name: "Priya Patel",
      email: "priya@eventpilot.org",
      role: "EventCoordinator",
      createdAt: now,
    });

    const volunteerIdVal = await ctx.db.insert("users", {
      clerkId: "user_seed_vol_001",
      name: "Jake Rivera",
      email: "jake@eventpilot.org",
      role: "Volunteer",
      createdAt: now,
    });

    // ─── VENUES ───────────────────────────────────────────────────
    const venue1Id = await ctx.db.insert("venues", {
      name: "Austin Convention Center",
      address: "500 E Cesar Chavez St",
      city: "Austin",
      state: "TX",
      zip: "78701",
      capacity: 500,
      contactName: "Linda Torres",
      contactEmail: "linda@acc.org",
      contactPhone: "512-555-0100",
      amenities: ["Projector", "Microphone", "Wifi", "Parking", "Catering", "Wheelchair", "Stage"],
      notes: "Full AV package included with rental. Accessible entrances on all sides.",
      status: "Active",
      createdAt: now,
    });

    const venue2Id = await ctx.db.insert("venues", {
      name: "Community Room at Central Library",
      address: "710 W Cesar Chavez St",
      city: "Austin",
      state: "TX",
      zip: "78701",
      capacity: 80,
      contactName: "Tom Walsh",
      contactEmail: "tom@apl.org",
      contactPhone: "512-555-0101",
      amenities: ["Projector", "Wifi", "Wheelchair"],
      status: "Active",
      createdAt: now,
    });

    const venue3Id = await ctx.db.insert("venues", {
      name: "Riverside Park Pavilion",
      address: "1600 Barton Springs Rd",
      city: "Austin",
      state: "TX",
      zip: "78704",
      capacity: 200,
      amenities: ["Parking", "Outdoor"],
      notes: "Open-air pavilion. Bring tents for weather coverage. No power outlets.",
      status: "Active",
      createdAt: now,
    });

    // ─── EVENTS ───────────────────────────────────────────────────
    // Apr 15 2026 18:00 CT = 1744754400000 roughly; use stable values
    const galaDate = new Date("2026-04-15T00:00:00.000Z").getTime();
    const boardDate = new Date("2026-04-03T00:00:00.000Z").getTime();
    const orientationDate = new Date("2026-04-08T00:00:00.000Z").getTime();
    const workshopDate = new Date("2026-04-22T00:00:00.000Z").getTime();

    const event1Id = await ctx.db.insert("events", {
      name: "Annual Fundraising Gala 2026",
      description:
        "Our signature black-tie fundraising event featuring live music, a silent auction, and a keynote address. All proceeds benefit local nonprofit programs.",
      eventType: "Gala",
      status: "Published",
      startDate: galaDate,
      startTime: "18:00",
      endDate: galaDate,
      endTime: "23:00",
      timezone: "America/Chicago",
      venueId: venue1Id,
      isVirtual: false,
      maxCapacity: 300,
      registrationDeadline: new Date("2026-04-12T00:00:00.000Z").getTime(),
      isPublic: true,
      createdById: adminId,
      coordinatorId: coord1Id,
      createdAt: now,
    });

    const event2Id = await ctx.db.insert("events", {
      name: "Board Meeting Q1 2026",
      description: "Quarterly board meeting to review financials and approve the Q2 strategic plan.",
      eventType: "BoardMeeting",
      status: "Draft",
      startDate: boardDate,
      startTime: "09:00",
      endDate: boardDate,
      endTime: "12:00",
      timezone: "America/Chicago",
      isVirtual: true,
      virtualLink: "https://zoom.us/j/12345678901",
      isPublic: false,
      createdById: adminId,
      coordinatorId: coord2Id,
      createdAt: now,
    });

    const event3Id = await ctx.db.insert("events", {
      name: "Community Volunteer Orientation",
      description:
        "Welcome orientation for new volunteers. Includes training overview, team assignments, and Q&A with program leads.",
      eventType: "VolunteerOrientation",
      status: "Published",
      startDate: orientationDate,
      startTime: "10:00",
      endDate: orientationDate,
      endTime: "14:00",
      timezone: "America/Chicago",
      venueId: venue2Id,
      isVirtual: false,
      maxCapacity: 50,
      isPublic: true,
      createdById: adminId,
      coordinatorId: coord2Id,
      createdAt: now,
    });

    const event4Id = await ctx.db.insert("events", {
      name: "Tech for Good Workshop",
      description:
        "Hands-on workshop teaching nonprofits how to leverage modern technology tools for greater community impact.",
      eventType: "Workshop",
      status: "Published",
      startDate: workshopDate,
      startTime: "13:00",
      endDate: workshopDate,
      endTime: "17:00",
      timezone: "America/Chicago",
      venueId: venue2Id,
      isVirtual: false,
      maxCapacity: 40,
      registrationDeadline: new Date("2026-04-19T00:00:00.000Z").getTime(),
      isPublic: true,
      createdById: coord1Id,
      coordinatorId: coord1Id,
      createdAt: now,
    });

    // ─── SPEAKERS ─────────────────────────────────────────────────
    const speaker1Id = await ctx.db.insert("speakers", {
      firstName: "Maria",
      lastName: "Gonzalez",
      email: "maria.gonzalez@university.edu",
      title: "Professor of Nonprofit Management",
      organization: "UT Austin",
      bio: "Dr. Gonzalez is a leading researcher in nonprofit sustainability and community impact metrics with over 20 years of field experience.",
      status: "Confirmed",
      createdAt: now,
    });

    const speaker2Id = await ctx.db.insert("speakers", {
      firstName: "David",
      lastName: "Kim",
      email: "david.kim@techforgood.org",
      title: "Chief Technology Officer",
      organization: "Tech for Good Foundation",
      bio: "David has spent 15 years helping nonprofits adopt modern technology tools to streamline operations and amplify their community impact.",
      status: "Confirmed",
      createdAt: now,
    });

    const speaker3Id = await ctx.db.insert("speakers", {
      firstName: "Angela",
      lastName: "Washington",
      email: "angela@communityfirst.org",
      title: "Executive Director",
      organization: "Community First Alliance",
      bio: "Angela is a passionate community organizer and advocate for equitable access to resources in underserved communities.",
      status: "Tentative",
      createdAt: now,
    });

    // ─── SPONSORS ─────────────────────────────────────────────────
    const sponsor1Id = await ctx.db.insert("sponsors", {
      organizationName: "Austin Tech Alliance",
      contactName: "Robert Lee",
      contactEmail: "robert@ata.org",
      contactPhone: "512-555-0200",
      sponsorshipLevel: "Presenting",
      amount: 25000,
      benefits:
        "Logo on all printed and digital materials, exclusive keynote introduction, VIP table for 10, stage banner, social media spotlight campaign.",
      status: "Confirmed",
      createdAt: now,
    });

    const sponsor2Id = await ctx.db.insert("sponsors", {
      organizationName: "Hill Country Bank",
      contactName: "Nancy Ford",
      contactEmail: "nancy@hcb.com",
      contactPhone: "512-555-0300",
      sponsorshipLevel: "Gold",
      amount: 10000,
      benefits:
        "Logo on event website and printed program, reserved table for 8, three social media mentions, verbal acknowledgment during event.",
      status: "Paid",
      createdAt: now,
    });

    const sponsor3Id = await ctx.db.insert("sponsors", {
      organizationName: "Local Print Shop",
      contactName: "Carlos Mendez",
      contactEmail: "carlos@localprint.com",
      contactPhone: "512-555-0400",
      sponsorshipLevel: "InKind",
      amount: 2000,
      benefits: "In-kind: printed event programs (500 copies) and stage banners (4 units).",
      status: "Pledged",
      createdAt: now,
    });

    // ─── TICKET TYPES ─────────────────────────────────────────────
    const ticket1Id = await ctx.db.insert("ticketTypes", {
      eventId: event1Id,
      name: "General Admission",
      description: "Standard entry to the Annual Fundraising Gala including dinner.",
      price: 75,
      maxQuantity: 200,
      salesStartDate: new Date("2026-03-01T00:00:00.000Z").getTime(),
      salesEndDate: new Date("2026-04-12T00:00:00.000Z").getTime(),
      status: "Active",
      createdAt: now,
    });

    const ticket2Id = await ctx.db.insert("ticketTypes", {
      eventId: event1Id,
      name: "VIP Table of 10",
      description: "Reserved VIP table seating for 10 guests with premium service.",
      price: 1000,
      maxQuantity: 10,
      salesStartDate: new Date("2026-03-01T00:00:00.000Z").getTime(),
      salesEndDate: new Date("2026-04-12T00:00:00.000Z").getTime(),
      status: "Active",
      createdAt: now,
    });

    const ticket3Id = await ctx.db.insert("ticketTypes", {
      eventId: event1Id,
      name: "Student",
      description: "Discounted entry for current students with valid ID.",
      price: 25,
      maxQuantity: 50,
      status: "Active",
      createdAt: now,
    });

    const ticket4Id = await ctx.db.insert("ticketTypes", {
      eventId: event3Id,
      name: "Free Entry",
      description: "Free admission for all volunteer orientation attendees.",
      price: 0,
      maxQuantity: 50,
      status: "Active",
      createdAt: now,
    });

    const ticket5Id = await ctx.db.insert("ticketTypes", {
      eventId: event4Id,
      name: "Workshop Seat",
      description: "Includes all materials and lunch for the full-day workshop.",
      price: 15,
      maxQuantity: 40,
      salesEndDate: new Date("2026-04-19T00:00:00.000Z").getTime(),
      status: "Active",
      createdAt: now,
    });

    // ─── REGISTRATIONS ────────────────────────────────────────────
    const regDate = new Date("2026-03-20T00:00:00.000Z").getTime();

    await ctx.db.insert("registrations", {
      eventId: event1Id,
      ticketTypeId: ticket1Id,
      attendeeName: "Emily Watson",
      attendeeEmail: "emily@example.com",
      attendeePhone: "512-555-1001",
      quantity: 2,
      totalAmount: 150,
      paymentStatus: "Paid",
      registrationDate: regDate,
      specialRequests: "Vegetarian meal preference.",
      status: "Confirmed",
      checkedIn: false,
      createdAt: now,
    });

    await ctx.db.insert("registrations", {
      eventId: event1Id,
      ticketTypeId: ticket2Id,
      attendeeName: "James Turner",
      attendeeEmail: "james@turner-industries.com",
      organizationName: "Turner Industries",
      quantity: 1,
      totalAmount: 1000,
      paymentStatus: "Pending",
      registrationDate: regDate,
      status: "Confirmed",
      checkedIn: false,
      registeredById: coord1Id,
      createdAt: now,
    });

    await ctx.db.insert("registrations", {
      eventId: event1Id,
      ticketTypeId: ticket3Id,
      attendeeName: "Rosa Martinez",
      attendeeEmail: "rosa@example.com",
      quantity: 1,
      totalAmount: 25,
      paymentStatus: "Paid",
      registrationDate: regDate,
      status: "Confirmed",
      checkedIn: true,
      checkedInAt: new Date("2026-04-15T18:45:00.000Z").getTime(),
      checkedInById: volunteerIdVal,
      createdAt: now,
    });

    await ctx.db.insert("registrations", {
      eventId: event3Id,
      ticketTypeId: ticket4Id,
      attendeeName: "Alex Chen",
      attendeeEmail: "alex@example.com",
      quantity: 1,
      totalAmount: 0,
      paymentStatus: "Comped",
      registrationDate: regDate,
      status: "Confirmed",
      checkedIn: false,
      createdAt: now,
    });

    await ctx.db.insert("registrations", {
      eventId: event4Id,
      ticketTypeId: ticket5Id,
      attendeeName: "Pat Nguyen",
      attendeeEmail: "pat@example.com",
      quantity: 1,
      totalAmount: 15,
      paymentStatus: "Refunded",
      registrationDate: regDate,
      specialRequests: "Cancelled due to scheduling conflict.",
      status: "Cancelled",
      checkedIn: false,
      createdAt: now,
    });

    // ─── SESSIONS ─────────────────────────────────────────────────
    await ctx.db.insert("sessions", {
      eventId: event1Id,
      title: "Welcome and Keynote Address",
      description: "Opening remarks followed by keynote address on nonprofit impact in 2026.",
      startTime: "18:30",
      endTime: "19:30",
      room: "Grand Ballroom",
      sessionType: "Keynote",
      capacity: 300,
      speakerIds: [speaker1Id],
      createdAt: now,
    });

    await ctx.db.insert("sessions", {
      eventId: event1Id,
      title: "Donor Impact Panel",
      description: "Panel discussion with major donors exploring community impact stories.",
      startTime: "19:45",
      endTime: "20:30",
      room: "Grand Ballroom",
      sessionType: "Panel",
      speakerIds: [speaker1Id, speaker3Id],
      createdAt: now,
    });

    await ctx.db.insert("sessions", {
      eventId: event1Id,
      title: "Networking Dinner",
      startTime: "20:30",
      endTime: "22:00",
      room: "Dining Hall",
      sessionType: "Meal",
      speakerIds: [],
      createdAt: now,
    });

    await ctx.db.insert("sessions", {
      eventId: event4Id,
      title: "Intro to CRM Tools for Nonprofits",
      description: "Hands-on session exploring modern CRM platforms tailored for nonprofit operations.",
      startTime: "13:00",
      endTime: "14:30",
      room: "Lab A",
      sessionType: "Workshop",
      capacity: 20,
      speakerIds: [speaker2Id],
      createdAt: now,
    });

    await ctx.db.insert("sessions", {
      eventId: event4Id,
      title: "Data-Driven Fundraising",
      description: "Using analytics dashboards and donor data to improve fundraising outcomes.",
      startTime: "15:00",
      endTime: "16:30",
      room: "Lab A",
      sessionType: "Workshop",
      capacity: 20,
      speakerIds: [speaker2Id],
      createdAt: now,
    });

    // ─── EVENT SPONSORS ───────────────────────────────────────────
    await ctx.db.insert("eventSponsors", {
      eventId: event1Id,
      sponsorId: sponsor1Id,
      sponsorshipLevel: "Presenting",
      amount: 25000,
      notes: "Keynote introduction rights and VIP table confirmed.",
      createdAt: now,
    });

    await ctx.db.insert("eventSponsors", {
      eventId: event1Id,
      sponsorId: sponsor2Id,
      sponsorshipLevel: "Gold",
      amount: 10000,
      createdAt: now,
    });

    await ctx.db.insert("eventSponsors", {
      eventId: event1Id,
      sponsorId: sponsor3Id,
      sponsorshipLevel: "InKind",
      amount: 2000,
      notes: "Providing printed programs and stage banners for the event.",
      createdAt: now,
    });

    console.log("Seed complete: users, venues, events, speakers, sponsors, ticketTypes, registrations, sessions, eventSponsors.");
    return { skipped: false, seeded: true };
  },
});

