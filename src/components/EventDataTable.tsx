"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Event {
  _id: string;
  name: string;
  eventType: string;
  status: string;
  startDate: string | number;
  startTime: string;
  isVirtual: boolean;
  _creationTime: number;
}

interface EventDataTableProps {
  events: Event[];
}

const STATUS_VARIANT: Record<string, string> = {
  Draft: "secondary",
  Published: "default",
  Cancelled: "destructive",
  Completed: "outline",
};

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

export function EventDataTable({ events }: EventDataTableProps) {
  if (events.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
        No events found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Type</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Date</TableHead>
            <TableHead className="text-muted-foreground">Format</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event._id} className="border-border hover:bg-muted/30">
              <TableCell className="font-medium text-foreground">{event.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    TYPE_COLORS[event.eventType] ?? TYPE_COLORS.Other
                  )}
                >
                  {event.eventType}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={(STATUS_VARIANT[event.status] as "default" | "secondary" | "destructive" | "outline") ?? "secondary"}>
                  {event.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {event.startDate} {event.startTime}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {event.isVirtual ? "Virtual" : "In-Person"}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/events/${event._id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>View</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}