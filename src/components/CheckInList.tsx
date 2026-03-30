"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchIcon, CheckCircle2Icon, CircleIcon, UserCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckInListProps {
  eventId: string;
}

interface Registration {
  _id: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketTypeName?: string;
  quantity: number;
  status: string;
  checkedIn: boolean;
  specialRequests?: string;
}

export function CheckInList({ eventId }: CheckInListProps) {
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const registrations = useQuery(api.registrations.listByEvent, {
    eventId: eventId as Id<"events">,
  });
  const checkInStats = useQuery(api.registrations.getCheckInStats, {
    eventId: eventId as Id<"events">,
  });
  const checkIn = useMutation(api.registrations.checkIn);

  const filtered = (registrations ?? []).filter(
    (r: Registration) =>
      r.status === "Confirmed" &&
      (r.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.attendeeEmail.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCheckIn = async (id: string) => {
    setCheckingIn(id);
    try {
      await checkIn({ id: id as Id<"registrations"> });
    } finally {
      setCheckingIn(null);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheckIcon className="h-4 w-4 text-primary" />
          Check-In
          {checkInStats && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {checkInStats.checkedIn} / {checkInStats.total} checked in
            </span>
          )}
        </CardTitle>
        <div className="relative mt-2">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
        {!registrations ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {search ? "No attendees match your search." : "No confirmed registrations yet."}
          </p>
        ) : (
          filtered.map((reg: Registration) => (
            <div
              key={reg._id}
              className={cn(
                "flex items-start justify-between rounded-lg border p-3 transition-colors",
                reg.checkedIn
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-border bg-background hover:bg-muted/20"
              )}
            >
              <div className="flex items-start gap-3">
                {reg.checkedIn ? (
                  <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                ) : (
                  <CircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">{reg.attendeeName}</p>
                  <p className="text-xs text-muted-foreground">{reg.attendeeEmail}</p>
                  {reg.ticketTypeName && (
                    <Badge variant="outline" className="mt-1 w-fit text-xs">
                      {reg.ticketTypeName} × {reg.quantity}
                    </Badge>
                  )}
                  {reg.specialRequests && (
                    <p className="mt-1 text-xs text-amber-400">⚠ {reg.specialRequests}</p>
                  )}
                </div>
              </div>
              {!reg.checkedIn && (
                <Button
                  size="sm"
                  onClick={() => handleCheckIn(reg._id)}
                  disabled={checkingIn === reg._id}
                  className="ml-2 shrink-0"
                >
                  {checkingIn === reg._id ? "..." : "Check In"}
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}