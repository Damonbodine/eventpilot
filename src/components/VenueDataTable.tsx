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
import { BuildingIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Venue {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  capacity: number;
  status: string;
  amenities: string[];
}

interface VenueDataTableProps {
  venues: Venue[];
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function VenueDataTable({ venues, onEdit, onRemove }: VenueDataTableProps) {
  if (venues.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <BuildingIcon className="h-8 w-8" />
          <span>No venues found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Venue</TableHead>
            <TableHead className="text-muted-foreground">Location</TableHead>
            <TableHead className="text-muted-foreground">Capacity</TableHead>
            <TableHead className="text-muted-foreground">Amenities</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.map((venue) => (
            <TableRow key={venue._id} className="border-border hover:bg-muted/30">
              <TableCell className="font-medium text-foreground">{venue.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {venue.city}, {venue.state}
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {venue.capacity.toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {venue.amenities.slice(0, 3).map((a) => (
                    <Badge key={a} variant="outline" className="text-xs text-muted-foreground">
                      {a}
                    </Badge>
                  ))}
                  {venue.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{venue.amenities.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    venue.status === "Active"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {venue.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(venue._id)}>Edit</Button>
                  )}
                  {onRemove && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onRemove(venue._id)}>Remove</Button>
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