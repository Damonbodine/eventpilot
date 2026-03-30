"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, GlobeIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PublicEventCardProps {
  event: {
    _id: string;
    name: string;
    eventType: string;
    startDate: string;
    startTime: string;
    endDate: string;
    isVirtual: boolean;
    venueName?: string;
    venueCity?: string;
    registrationCount?: number;
    maxCapacity?: number;
    coverImageUrl?: string;
    description?: string;
  };
}

const TYPE_COLORS: Record<string, string> = {
  Fundraiser: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Gala: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Workshop: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Conference: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Webinar: "bg-green-500/20 text-green-300 border-green-500/30",
  BoardMeeting: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  CommunityEvent: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  VolunteerOrientation: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  AnnualMeeting: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Other: "bg-muted text-muted-foreground border-border",
};

export function PublicEventCard({ event }: PublicEventCardProps) {
  const isFull =
    event.maxCapacity != null &&
    event.registrationCount != null &&
    event.registrationCount >= event.maxCapacity;

  return (
    <Card className="flex flex-col overflow-hidden bg-card border-border hover:border-primary/40 transition-colors">
      {event.coverImageUrl ? (
        <div className="h-40 w-full overflow-hidden bg-muted">
          <img
            src={event.coverImageUrl}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
          <Badge
            variant="outline"
            className={cn("text-sm px-3 py-1", TYPE_COLORS[event.eventType] ?? TYPE_COLORS.Other)}
          >
            {event.eventType}
          </Badge>
        </div>
      )}
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2">{event.name}</h3>
          {event.coverImageUrl && (
            <Badge
              variant="outline"
              className={cn("shrink-0 text-xs", TYPE_COLORS[event.eventType] ?? TYPE_COLORS.Other)}
            >
              {event.eventType}
            </Badge>
          )}
        </div>
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        )}
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{event.startDate} · {event.startTime}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.isVirtual ? (
              <><GlobeIcon className="h-3.5 w-3.5 text-primary shrink-0" /><span>Virtual Event</span></>
            ) : (
              <><MapPinIcon className="h-3.5 w-3.5 text-primary shrink-0" /><span>{event.venueName}{event.venueCity ? `, ${event.venueCity}` : ""}</span></>
            )}
          </div>
          {event.registrationCount != null && (
            <div className="flex items-center gap-2">
              <UsersIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                {event.registrationCount} registered
                {event.maxCapacity ? ` / ${event.maxCapacity} capacity` : ""}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {isFull ? (
          <span className={cn(buttonVariants(), "w-full bg-muted text-muted-foreground cursor-not-allowed pointer-events-none")}>
            Sold Out
          </span>
        ) : (
          <Link href={`/events/${event._id}`} className={cn(buttonVariants(), "w-full")}>
            Register Now
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}