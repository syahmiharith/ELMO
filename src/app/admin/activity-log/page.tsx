
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { listActivityLog } from '@/lib/api';
import type { ActivityLogEntry } from '@/types/domain';
import { useToast } from '@/hooks/use-toast';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import {
  FileDown,
  Filter,
  User,
  CheckCircle2,
  XCircle,
  Archive,
  Edit,
  ArrowRight,
  Loader2,
  List,
} from 'lucide-react';
import Link from 'next/link';

function ActionIcon({ action }: { action: ActivityLogEntry['action'] }) {
  switch (action) {
    case 'APPROVED_MEMBERSHIP':
      return <CheckCircle2 className="size-4 text-green-500" />;
    case 'REJECTED_MEMBERSHIP':
      return <XCircle className="size-4 text-destructive" />;
    case 'ARCHIVED_CLUB':
      return <Archive className="size-4 text-muted-foreground" />;
    case 'UPDATED_POLICY':
      return <Edit className="size-4 text-blue-500" />;
    default:
      return <ArrowRight className="size-4 text-muted-foreground" />;
  }
}

function getActionText(action: ActivityLogEntry['action']) {
    switch (action) {
        case 'APPROVED_MEMBERSHIP': return 'Approved Membership';
        case 'REJECTED_MEMBERSHIP': return 'Rejected Membership';
        case 'ARCHIVED_CLUB': return 'Archived Club';
        case 'UPDATED_POLICY': return 'Updated Policy';
        default: return 'Unknown Action';
    }
}


export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const data = await listActivityLog();
        setLogs(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load activity log.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [toast]);

  const getStatusVariant = (status: 'SUCCESS' | 'FAILED') => {
      return status === 'SUCCESS' ? 'success' : 'destructive';
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">An audit trail of all administrative actions.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <Filter className="mr-2" />
                Filter
            </Button>
            <Button variant="outline">
                <FileDown className="mr-2" />
                Export
            </Button>
        </div>
      </header>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <ClientFormattedDate date={log.timestamp} options={{ dateStyle: 'medium', timeStyle: 'long' }} />
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{log.actor.name}</p>
                                <Badge variant="secondary" className="text-xs">{log.actor.role}</Badge>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <ActionIcon action={log.action} />
                            <span>{getActionText(log.action)}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Link href={log.target.url} className="hover:underline hover:text-primary">
                            {log.target.name}
                        </Link>
                    </TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <List className="mx-auto size-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No activity log entries found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
