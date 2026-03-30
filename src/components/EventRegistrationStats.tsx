"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TicketIcon } from "lucide-react";

interface EventRegistrationStatsProps {
  eventId: string;
}

export function EventRegistrationStats({ eventId }: EventRegistrationStatsProps) {
  const ticketTypes = useQuery(api.ticketTypes.listByEvent, {
    eventId: eventId as Id<"events">,
  });
  const registrations = useQuery(api.registrations.listByEvent, {
    eventId: eventId as Id<"events">,
  });

  if (!ticketTypes || !registrations) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TicketIcon className="h-4 w-4 text-primary" />
            Registration Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const regsByType = registrations.reduce(
    (acc: Record<string, number>, reg: { ticketTypeId: string; quantity: number; status: string }) => {
      if (reg.status !== "Cancelled") {
        acc[reg.ticketTypeId] = (acc[reg.ticketTypeId] ?? 0) + reg.quantity;
      }
      return acc;
    },
    {}
  );

  const totalRegistered = (Object.values(regsByType) as number[]).reduce((a: number, b: number) => a + b, 0);
  const totalCapacity = ticketTypes.reduce(
    (sum: number, tt: { maxQuantity?: number }) => sum + (tt.maxQuantity ?? 0),
    0
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TicketIcon className="h-4 w-4 text-primary" />
          Registration Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {totalCapacity > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall</span>
              <span className="font-medium text-foreground">
                {totalRegistered} / {totalCapacity}
              </span>
            </div>
            <Progress
              value={(totalRegistered / totalCapacity) * 100}
              className="h-2 bg-muted"
            />
          </div>
        )}
        {ticketTypes.map(
          (tt: { _id: string; name: string; price: number; maxQuantity?: number; status: string }) => {
            const sold = regsByType[tt._id] ?? 0;
            const cap = tt.maxQuantity;
            const pct = cap && cap > 0 ? (sold / cap) * 100 : 0;
            return (
              <div key={tt._id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">{tt.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs"
                    >
                      {tt.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {sold}{cap != null ? ` / ${cap}` : ""}
                    </span>
                  </div>
                </div>
                {cap != null && cap > 0 && (
                  <Progress value={pct} className="h-1.5 bg-muted" />
                )}
                <p className="text-xs text-muted-foreground">
                  {tt.price === 0 ? "Free" : `$${(tt.price / 100).toFixed(2)}`}
                </p>
              </div>
            );
          }
        )}
      </CardContent>
    </Card>
  );
}