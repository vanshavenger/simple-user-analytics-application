import { Suspense, use, useState } from 'react';
import type { SessionsResponse } from '../types';
import { fetchData } from '../fetchData';
import SessionDetail from './SessionDetail';
import { SessionDetailSkeleton } from './Skeletons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, Clock, ChevronRight, Hash, Activity, Download } from 'lucide-react';
import type { DateRange } from './DateRangeFilter';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : '';

function buildSessionsUrl(dateRange: DateRange): string {
  const params = new URLSearchParams();
  if (dateRange.from) params.set('from', dateRange.from);
  if (dateRange.to) params.set('to', dateRange.to);
  const qs = params.toString();
  return `/api/events/sessions${qs ? `?${qs}` : ''}`;
}

function SessionsList({ onSelect, dateRange }: { onSelect: (id: string) => void; dateRange: DateRange }) {
  const data = use(fetchData<SessionsResponse>(buildSessionsUrl(dateRange)));
  const sessions = data.sessions;

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No sessions recorded yet.</p>
          <p className="text-muted-foreground text-xs mt-1">Open the demo page to generate events.</p>
        </CardContent>
      </Card>
    );
  }

  const totalEvents = sessions.reduce((sum, s) => sum + s.event_count, 0);
  const avgEvents = Math.round(totalEvents / sessions.length * 10) / 10;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Hash className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgEvents}</p>
              <p className="text-xs text-muted-foreground">Avg / Session</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">All Sessions</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams();
                if (dateRange.from) params.set('from', dateRange.from);
                if (dateRange.to) params.set('to', dateRange.to);
                const qs = params.toString();
                window.open(`${API_BASE}/api/events/export/sessions${qs ? `?${qs}` : ''}`, '_blank');
              }}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {sessions.map(session => (
              <div
                key={session.session_id}
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => onSelect(session.session_id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium text-foreground truncate">
                      {session.session_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(session.first_event).toLocaleString()}</span>
                    <span className="mx-1">→</span>
                    <span>{new Date(session.last_event).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-semibold">
                    {session.event_count} events
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionsView({ dateRange }: { dateRange: DateRange }) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  if (selectedSession) {
    return (
      <Suspense fallback={<SessionDetailSkeleton />}>
        <SessionDetail
          sessionId={selectedSession}
          onBack={() => setSelectedSession(null)}
        />
      </Suspense>
    );
  }

  return <SessionsList onSelect={setSelectedSession} dateRange={dateRange} />;
}

export default SessionsView;
