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
import { cn } from "@/lib/utils";

interface Sponsor {
  _id: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  sponsorshipLevel: string;
  amount: number;
  status: string;
}

interface SponsorDataTableProps {
  sponsors: Sponsor[];
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const LEVEL_STYLES: Record<string, string> = {
  Presenting: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  Gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Silver: "bg-gray-400/20 text-gray-300 border-gray-400/30",
  Bronze: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  InKind: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  MediaPartner: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const STATUS_STYLES: Record<string, string> = {
  Pledged: "bg-muted text-muted-foreground",
  Confirmed: "bg-primary/20 text-primary border-primary/30",
  Paid: "bg-green-500/20 text-green-400 border-green-500/30",
  Cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export function SponsorDataTable({ sponsors, onEdit, onRemove }: SponsorDataTableProps) {
  if (sponsors.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
        No sponsors found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Organization</TableHead>
            <TableHead className="text-muted-foreground">Contact</TableHead>
            <TableHead className="text-muted-foreground">Level</TableHead>
            <TableHead className="text-muted-foreground">Amount</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sponsors.map((sponsor) => (
            <TableRow key={sponsor._id} className="border-border hover:bg-muted/30">
              <TableCell className="font-medium text-foreground">{sponsor.organizationName}</TableCell>
              <TableCell className="text-sm">
                <div>
                  <p className="text-foreground">{sponsor.contactName}</p>
                  <p className="text-muted-foreground text-xs">{sponsor.contactEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("text-xs", LEVEL_STYLES[sponsor.sponsorshipLevel] ?? "")}
                >
                  {sponsor.sponsorshipLevel}
                </Badge>
              </TableCell>
              <TableCell className="text-sm font-medium text-foreground">
                ${(sponsor.amount / 100).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("text-xs", STATUS_STYLES[sponsor.status] ?? "")}
                >
                  {sponsor.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(sponsor._id)}>Edit</Button>
                  )}
                  {onRemove && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onRemove(sponsor._id)}>Remove</Button>
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