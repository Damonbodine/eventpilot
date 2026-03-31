import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export type UserRole = "Admin" | "EventCoordinator" | "Coordinator" | "Volunteer" | "Registrant";

interface AuthenticatedUser {
  _id: Id<"users">;
  clerkId: string;
  role: UserRole;
  email: string;
}

/**
 * Get the authenticated user with role info.
 * Throws if not authenticated or user record not found.
 */
export async function getAuthenticatedUser(
  ctx: QueryCtx | MutationCtx
): Promise<AuthenticatedUser> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
    .unique();
  if (!user) throw new Error("User not found");

  return user as AuthenticatedUser;
}

/**
 * Assert the user has one of the allowed roles.
 */
export function assertRole(user: AuthenticatedUser, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Access denied: role "${user.role}" is not authorized for this action. Required: ${allowedRoles.join(", ")}`
    );
  }
}

/**
 * Assert the user can manage a specific event.
 * - Admin: always allowed
 * - EventCoordinator/Coordinator: only if they are the coordinator or creator
 * - Others: denied
 */
export async function assertCanManageEvent(
  ctx: QueryCtx | MutationCtx,
  user: AuthenticatedUser,
  eventId: Id<"events">
): Promise<void> {
  if (user.role === "Admin") return;

  if (user.role === "EventCoordinator" || user.role === "Coordinator") {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    if (event.coordinatorId === user._id || event.createdById === user._id) return;
    throw new Error("Access denied: you can only manage events assigned to you");
  }

  throw new Error(
    `Access denied: role "${user.role}" cannot manage events`
  );
}

/**
 * Assert the user can perform check-in on a specific event.
 * - Admin: always allowed
 * - EventCoordinator/Coordinator: if assigned to event
 * - Volunteer: if assigned to event (coordinatorId matches - simplified for now)
 * - Others: denied
 */
export async function assertCanCheckIn(
  ctx: QueryCtx | MutationCtx,
  user: AuthenticatedUser,
  eventId: Id<"events">
): Promise<void> {
  if (user.role === "Admin") return;

  const event = await ctx.db.get(eventId);
  if (!event) throw new Error("Event not found");

  if (user.role === "EventCoordinator" || user.role === "Coordinator") {
    if (event.coordinatorId === user._id || event.createdById === user._id) return;
    throw new Error("Access denied: you can only check in at events assigned to you");
  }

  if (user.role === "Volunteer") {
    // Volunteers can check in at any event for now (can be refined with an assignment table)
    return;
  }

  throw new Error(
    `Access denied: role "${user.role}" cannot perform check-in`
  );
}
