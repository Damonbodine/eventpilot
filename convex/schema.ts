import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("Admin"), v.literal("EventCoordinator"), v.literal("Coordinator"), v.literal("Volunteer"), v.literal("Registrant")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    skills: v.optional(v.array(v.string())),
    availabilityNotes: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    department: v.optional(v.string()),
    location: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  events: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    eventType: v.union(
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
    ),
    status: v.union(
      v.literal("Draft"),
      v.literal("Published"),
      v.literal("Cancelled"),
      v.literal("Completed")
    ),
    startDate: v.union(v.string(), v.number()),
    startDateMs: v.optional(v.number()),
    startTime: v.string(),
    endDate: v.union(v.string(), v.number()),
    endDateMs: v.optional(v.number()),
    endTime: v.string(),
    timezone: v.string(),
    venueId: v.optional(v.id("venues")),
    isVirtual: v.boolean(),
    virtualLink: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    registrationDeadline: v.optional(v.union(v.string(), v.number())),
    registrationDeadlineMs: v.optional(v.number()),
    isPublic: v.boolean(),
    coverImageUrl: v.optional(v.string()),
    createdById: v.id("users"),
    coordinatorId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_eventType", ["eventType"])
    .index("by_createdById", ["createdById"])
    .index("by_coordinatorId", ["coordinatorId"])
    .index("by_venueId", ["venueId"])
    .index("by_isPublic", ["isPublic"])
    .index("by_startDate", ["startDate"]),

  venues: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    capacity: v.number(),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    amenities: v.array(
      v.union(
        v.literal("Projector"),
        v.literal("Microphone"),
        v.literal("Wifi"),
        v.literal("Parking"),
        v.literal("Catering"),
        v.literal("Wheelchair"),
        v.literal("Outdoor"),
        v.literal("Kitchen"),
        v.literal("Stage")
      )
    ),
    notes: v.optional(v.string()),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_city", ["city"]),

  ticketTypes: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    maxQuantity: v.optional(v.number()),
    salesStartDate: v.optional(v.union(v.string(), v.number())),
    salesStartDateMs: v.optional(v.number()),
    salesEndDate: v.optional(v.union(v.string(), v.number())),
    salesEndDateMs: v.optional(v.number()),
    status: v.union(
      v.literal("Active"),
      v.literal("SoldOut"),
      v.literal("Inactive")
    ),
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_status", ["status"]),

  registrations: defineTable({
    eventId: v.id("events"),
    ticketTypeId: v.id("ticketTypes"),
    attendeeName: v.string(),
    attendeeEmail: v.string(),
    attendeePhone: v.optional(v.string()),
    organizationName: v.optional(v.string()),
    quantity: v.number(),
    totalAmount: v.number(),
    paymentStatus: v.union(
      v.literal("Pending"),
      v.literal("Paid"),
      v.literal("Comped"),
      v.literal("Refunded")
    ),
    registrationDate: v.number(),
    specialRequests: v.optional(v.string()),
    status: v.union(
      v.literal("Confirmed"),
      v.literal("Cancelled"),
      v.literal("WaitListed")
    ),
    checkedIn: v.boolean(),
    checkedInAt: v.optional(v.number()),
    checkedInById: v.optional(v.id("users")),
    registeredById: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_ticketTypeId", ["ticketTypeId"])
    .index("by_attendeeEmail", ["attendeeEmail"])
    .index("by_status", ["status"])
    .index("by_paymentStatus", ["paymentStatus"])
    .index("by_eventId_status", ["eventId", "status"]),

  sessions: defineTable({
    eventId: v.id("events"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    room: v.optional(v.string()),
    sessionType: v.union(
      v.literal("Keynote"),
      v.literal("Breakout"),
      v.literal("Workshop"),
      v.literal("Panel"),
      v.literal("Networking"),
      v.literal("Meal")
    ),
    capacity: v.optional(v.number()),
    speakerIds: v.array(v.id("speakers")),
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"]),

  speakers: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    title: v.optional(v.string()),
    organization: v.optional(v.string()),
    bio: v.string(),
    headshotUrl: v.optional(v.string()),
    status: v.union(
      v.literal("Confirmed"),
      v.literal("Tentative"),
      v.literal("Declined")
    ),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  sponsors: defineTable({
    organizationName: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    sponsorshipLevel: v.union(
      v.literal("Presenting"),
      v.literal("Gold"),
      v.literal("Silver"),
      v.literal("Bronze"),
      v.literal("InKind"),
      v.literal("MediaPartner")
    ),
    amount: v.number(),
    benefits: v.optional(v.string()),
    status: v.union(
      v.literal("Pledged"),
      v.literal("Confirmed"),
      v.literal("Paid"),
      v.literal("Cancelled")
    ),
    logoUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_sponsorshipLevel", ["sponsorshipLevel"]),

  eventSponsors: defineTable({
    eventId: v.id("events"),
    sponsorId: v.id("sponsors"),
    sponsorshipLevel: v.union(
      v.literal("Presenting"),
      v.literal("Gold"),
      v.literal("Silver"),
      v.literal("Bronze"),
      v.literal("InKind"),
      v.literal("MediaPartner")
    ),
    amount: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_sponsorId", ["sponsorId"]),
});
