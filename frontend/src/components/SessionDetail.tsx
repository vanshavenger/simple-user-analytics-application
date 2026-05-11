import { use } from 'react';
import type { TrackingEvent } from '../types';
import { fetchData } from '../fetchData';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowLeft, Eye, MousePointerClick, Clock, BarChart3, Download, Monitor, Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : '';

interface Props {
  sessionId: string;
  onBack: () => void;
}

function SessionDetail({ sessionId, onBack }: Props) {
  const events = use(fetchData<TrackingEvent[]>(`/api/events/sessions/${sessionId}/events`));

  const pageViews = events.filter(e => e.event_type === 'page_view').length;
  const clicks = events.filter(e => e.event_type === 'click').length;

  const pieData = [
    { name: 'Page Views', value: pageViews, fill: '#3b82f6' },
    { name: 'Clicks', value: clicks, fill: '#ef4444' },
  ];

  const pageBreakdown: Record<string, { page: string; views: number; clicks: number }> = {};
  for (const e of events) {
    const short = e.page_url.replace(/^https?:\/\/[^/]+/, '') || '/';
    if (!pageBreakdown[short]) pageBreakdown[short] = { page: short, views: 0, clicks: 0 };
    if (e.event_type === 'page_view') pageBreakdown[short].views++;
    else pageBreakdown[short].clicks++;
  }
  const barData = Object.values(pageBreakdown);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`${API_BASE}/api/events/export/sessions/${sessionId}`, '_blank')}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{events.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{pageViews}</p>
            <p className="text-xs text-muted-foreground mt-1">Page Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{clicks}</p>
            <p className="text-xs text-muted-foreground mt-1">Clicks</p>
          </CardContent>
        </Card>
      </div>

      {events[0]?.user_agent && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <Monitor className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Device Info</p>
              <p className="text-xs text-muted-foreground truncate">{events[0].user_agent}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {events[0].screen_width && events[0].screen_height && (
                  <span>Viewport: {events[0].screen_width}×{events[0].screen_height}</span>
                )}
                {events[0].referrer && (
                  <span>Referrer: {events[0].referrer}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Event Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Page Views</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Clicks</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Events by Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="page" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-foreground)',
                  }}
                />
                <Bar dataKey="views" name="Page Views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" name="Clicks" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Event Timeline</CardTitle>
          <CardDescription>
            Session: <span className="font-mono">{sessionId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-0">
              {events.map((event, i) => (
                <div
                  key={event._id || i}
                  className="relative flex items-start gap-4 py-3 pl-10 pr-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="absolute left-2.5 top-4 flex items-center justify-center h-4 w-4 rounded-full border-2 border-background bg-card z-10">
                    {event.event_type === 'page_view' ? (
                      <Eye className="h-3 w-3 text-blue-600" />
                    ) : (
                      <MousePointerClick className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <Badge variant={event.event_type === 'page_view' ? 'blue' : 'red'} className="shrink-0">
                      {event.event_type}
                    </Badge>
                    <span className="text-sm text-foreground truncate">
                      {event.page_url}
                    </span>
                    {event.event_type === 'click' && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {event.click_x}, {event.click_y}
                      </Badge>
                    )}
                    {event.event_type === 'click' && event.element_tag && (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1 max-w-48 truncate">
                        <Tag className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">&lt;{event.element_tag}&gt;{event.element_text ? ` "${event.element_text}"` : ''}</span>
                      </Badge>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    <Clock className="h-3 w-3" />
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SessionDetail;
