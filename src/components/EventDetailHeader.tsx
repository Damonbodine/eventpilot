"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  MapPinIcon,
  GlobeIcon,
  PencilIcon,
  BanIcon,
  CopyIcon,
  SendIcon,
} from "lucide-react";
import { cn, formatDate, formatEnumLabel } from "@/lib/utils";

interface EventDetailHeaderProps {
  event: {
    _id: string;
    name: string;
    status: string;
    eventType: string;
    startDate: string | number;
    startTime: string;
    endDate: string | number;
    endTime: string;
    timezone: string;
    isVirtual: boolean;
    virtualLink?: string;
    venueName?: string;
    venueCity?: string;
    isPublic: boolean;
  };
  onEdit?: () => void;
  onPublish?: () => void;
  onCancel?: () => void;
  onDuplicate?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  Published: "bg-primary/20 text-primary border-primary/30",
  Cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  Completed: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function EventDetailHeader({
  event,
  onEdit,
  onPublish,
  onCancel,
  onDuplicate,
}: EventDetailHeaderProps) {
  const canPublish = event.status === "Draft";
  const canCancel = event.status !== "Cancelled" && event.status !== "Completed";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  STATUS_STYLES[event.status] ?? STATUS_STYLES.Draft
                )}
              >
                {event.status}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {formatEnumLabel(event.eventType)}
              </Badge>
              {event.isPublic && (
                <Badge variant="outline" className="text-xs text-green-400 border-green-500/30 bg-green-500/10">
                  Public
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground">{event.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {canPublish && onPublish && (
              <Button size="sm" onClick={onPublish} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <SendIcon className="h-4 w-4 mr-1" />
                Publish
              </Button>
            )}
            {onDuplicate && (
              <Button variant="outline" size="sm" onClick={onDuplicate}>
                <CopyIcon className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
            )}
            {canCancel && onCancel && (
              <Button variant="destructive" size="sm" onClick={onCancel}>
                <BanIcon className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-border" />
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>
              {formatDate(event.startDate)} {event.startTime} — {formatDate(event.endDate)} {event.endTime}
            </span>
            <span className="text-xs">({event.timezone})</span>
          </div>
          <div className="flex items-center gap-2">
            {event.isVirtual ? (
              <>
                <GlobeIcon className="h-4 w-4 text-primary" />
                {event.virtualLink ? (
                  <a
                    href={event.virtualLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Join Online
                  </a>
                ) : (
                  <span>Virtual Event</span>
                )}
              </>
            ) : (
              <>
                <MapPinIcon className="h-4 w-4 text-primary" />
                <span>
                  {event.venueName}
                  {event.venueCity ? `, ${event.venueCity}` : ""}
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}