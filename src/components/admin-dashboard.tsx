'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarPlus, Megaphone, Users, BarChart3, Settings, Eye } from 'lucide-react';
import Link from 'next/link';
import { AdminOnly, ClubAdminOnly, UniversityAdminOnly } from '@/components/role-guard';

export function AdminDashboard() {
  return (
    <AdminOnly fallback={null}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Admin Tools</h2>
            <p className="text-muted-foreground">
              Manage your club activities and announcements
            </p>
          </div>
          <Badge variant="secondary">Admin Access</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Event Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Event Management</CardTitle>
              <CalendarPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Create and manage club events
                </p>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href="/events/create">Create Event</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/events">View All</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Share updates with club members
                </p>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href="/announcements/create">Create</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/announcements">Manage</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Management */}
          <ClubAdminOnly>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Manage club memberships
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" asChild>
                      <Link href="/clubs/members">View Members</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ClubAdminOnly>

          {/* Analytics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  View club performance metrics
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* University Admin Tools */}
          <UniversityAdminOnly>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">System Admin</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    University-wide administration
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Admin Panel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </UniversityAdminOnly>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Common admin tasks
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/events?filter=pending">Review Pending Events</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/announcements?filter=draft">Draft Announcements</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminOnly>
  );
}
