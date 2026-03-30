/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as eventSponsors from "../eventSponsors.js";
import type * as events from "../events.js";
import type * as registrations from "../registrations.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as speakers from "../speakers.js";
import type * as sponsors from "../sponsors.js";
import type * as ticketTypes from "../ticketTypes.js";
import type * as users from "../users.js";
import type * as venues from "../venues.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  eventSponsors: typeof eventSponsors;
  events: typeof events;
  registrations: typeof registrations;
  reports: typeof reports;
  seed: typeof seed;
  sessions: typeof sessions;
  speakers: typeof speakers;
  sponsors: typeof sponsors;
  ticketTypes: typeof ticketTypes;
  users: typeof users;
  venues: typeof venues;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
