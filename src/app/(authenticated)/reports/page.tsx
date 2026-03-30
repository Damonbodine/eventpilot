'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReportsPage() {
  const user = useQuery(api.users.getCurrentUser);
  const attendanceReport = useQuery(api.reports.getAttendanceReport, user === undefined ? 'skip' : {});
  const revenueReport = useQuery(api.reports.getRevenueReport, user === undefined ? 'skip' : {});
  const sponsorTotals = useQuery(api.reports.getSponsorTotals, user === undefined ? 'skip' : {});

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Event</th>
                  <th className="p-3 text-left font-medium">Total Registrations</th>
                  <th className="p-3 text-left font-medium">Checked In</th>
                  <th className="p-3 text-left font-medium">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {(attendanceReport ?? []).map((row: any) => (
                  <tr key={row.eventId} className="border-b last:border-0">
                    <td className="p-3">{row.eventName}</td>
                    <td className="p-3">{row.totalRegistrations}</td>
                    <td className="p-3">{row.checkedIn}</td>
                    <td className="p-3">{row.capacity ?? '—'}</td>
                  </tr>
                ))}
                {!attendanceReport && (
                  <tr><td colSpan={4} className="p-3 text-center text-muted-foreground">Loading...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="revenue">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Event</th>
                  <th className="p-3 text-left font-medium">Gross Revenue</th>
                  <th className="p-3 text-left font-medium">Paid</th>
                  <th className="p-3 text-left font-medium">Pending</th>
                </tr>
              </thead>
              <tbody>
                {(revenueReport ?? []).map((row: any) => (
                  <tr key={row.eventId} className="border-b last:border-0">
                    <td className="p-3">{row.eventName}</td>
                    <td className="p-3">${row.grossRevenue}</td>
                    <td className="p-3">${row.paidAmount}</td>
                    <td className="p-3">${row.pendingAmount}</td>
                  </tr>
                ))}
                {!revenueReport && (
                  <tr><td colSpan={4} className="p-3 text-center text-muted-foreground">Loading...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="sponsors">
          <div className="rounded-md border p-4 space-y-4">
            {!sponsorTotals ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <>
                <div>
                  <h3 className="font-medium mb-2">By Sponsorship Level</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {sponsorTotals.byLevel.map((row) => (
                      <div key={row.level} className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">{row.level}</p>
                        <p className="text-lg font-semibold">${row.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{row.sponsorCount} sponsors</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">By Organization</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Organization</th>
                        <th className="p-3 text-left font-medium">Level</th>
                        <th className="p-3 text-left font-medium">Total Contributed</th>
                        <th className="p-3 text-left font-medium">Events</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sponsorTotals.byOrganization.map((row) => (
                        <tr key={row.sponsorId} className="border-b last:border-0">
                          <td className="p-3">{row.organizationName}</td>
                          <td className="p-3">{row.sponsorshipLevel}</td>
                          <td className="p-3">${row.totalContributed.toLocaleString()}</td>
                          <td className="p-3">{row.eventCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
