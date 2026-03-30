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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Speaker {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  organization?: string;
  status: string;
}

interface SpeakerDataTableProps {
  speakers: Speaker[];
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  Confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  Tentative: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Declined: "bg-destructive/20 text-destructive border-destructive/30",
};

export function SpeakerDataTable({ speakers, onEdit, onRemove }: SpeakerDataTableProps) {
  if (speakers.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
        No speakers found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Speaker</TableHead>
            <TableHead className="text-muted-foreground">Title / Org</TableHead>
            <TableHead className="text-muted-foreground">Email</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {speakers.map((speaker) => (
            <TableRow key={speaker._id} className="border-border hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {speaker.firstName[0]}{speaker.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    {speaker.firstName} {speaker.lastName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {[speaker.title, speaker.organization].filter(Boolean).join(" · ") || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{speaker.email}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("text-xs", STATUS_STYLES[speaker.status] ?? "")}
                >
                  {speaker.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(speaker._id)}>
                      Edit
                    </Button>
                  )}
                  {onRemove && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onRemove(speaker._id)}>
                      Remove
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}