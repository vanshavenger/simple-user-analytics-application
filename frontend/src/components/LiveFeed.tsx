import { useEffect, useRef, useState } from 'react';
import type { TrackingEvent } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Radio, Eye, MousePointerClick, Clock, Tag, Wifi, WifiOff } from 'lucide-react';

const SSE_URL = import.meta.env.DEV ? 'http://localhost:5000/api/events/stream' : '/api/events/stream';
const MAX_EVENTS = 50;

function LiveFeed() {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(SSE_URL);
    sourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as TrackingEvent;
        setEvents(prev => [event, ...prev].slice(0, MAX_EVENTS));
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      sourceRef.current = null;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Live Event Feed
            </CardTitle>
            <CardDescription className="mt-1">
              Real-time stream of incoming tracking events
            </CardDescription>
          </div>
          <Badge variant={connected ? 'green' : 'red'} className="flex items-center gap-1.5">
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="py-16 text-center">
            <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground text-sm">Waiting for events…</p>
            <p className="text-muted-foreground text-xs mt-1">Open the demo page and click around to see events appear here in real-time.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-0">
              {events.map((event, i) => (
                <div
                  key={event._id || `live-${i}`}
                  className="relative flex items-start gap-4 py-3 pl-10 pr-3 rounded-lg hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <div className="absolute left-2.5 top-4 flex items-center justify-center h-4 w-4 rounded-full border-2 border-background bg-card z-10">
                    {event.event_type === 'page_view' ? (
                      <Eye className="h-3 w-3 text-blue-600" />
                    ) : (
                      <MousePointerClick className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={event.event_type === 'page_view' ? 'blue' : 'red'} className="shrink-0">
                        {event.event_type}
                      </Badge>
                      <span className="text-sm text-foreground truncate">
                        {event.page_url}
                      </span>
                      {event.event_type === 'click' && event.click_x != null && (
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
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="font-mono truncate max-w-45">{event.session_id}</span>
                      {event.screen_width && event.screen_height && (
                        <span>{event.screen_width}×{event.screen_height}</span>
                      )}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    <Clock className="h-3 w-3" />
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LiveFeed;
