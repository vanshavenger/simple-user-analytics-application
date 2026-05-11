import { Suspense, useState } from 'react';
import SessionsView from './components/SessionsView';
import HeatmapView from './components/HeatmapView';
import LiveFeed from './components/LiveFeed';
import DateRangeFilter, { type DateRange } from './components/DateRangeFilter';
import { TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { ThemeToggle } from './components/ThemeToggle';
import { SessionsListSkeleton, HeatmapSkeleton } from './components/Skeletons';
import { BarChart3, MousePointerClick, Activity, RefreshCw, Radio } from 'lucide-react';
import { invalidateAll } from './fetchData';

function App() {
  const [view, setView] = useState<'sessions' | 'heatmap' | 'live'>('sessions');
  const [refreshKey, setRefreshKey] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' });

  function handleRefresh() {
    invalidateAll();
    setRefreshKey(k => k + 1);
  }

  function handleDateChange(range: DateRange) {
    invalidateAll();
    setDateRange(range);
    setRefreshKey(k => k + 1);
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-foreground">Analytics</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">v1.0</Badge>
          </div>

          <div className="flex items-center gap-3">
            <TabsList>
              <TabsTrigger active={view === 'sessions'} onClick={() => setView('sessions')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger active={view === 'heatmap'} onClick={() => setView('heatmap')}>
                <MousePointerClick className="h-4 w-4 mr-2" />
                Heatmap
              </TabsTrigger>
              <TabsTrigger active={view === 'live'} onClick={() => setView('live')}>
                <Radio className="h-4 w-4 mr-2" />
                Live
              </TabsTrigger>
            </TabsList>
            <div className="w-px h-6 bg-border" />
            <button
              onClick={handleRefresh}
              title="Refresh data"
              className="inline-flex items-center justify-center rounded-lg p-2 bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {view !== 'live' && (
          <div className="mb-4">
            <DateRangeFilter value={dateRange} onChange={handleDateChange} />
          </div>
        )}
        <Suspense key={`${refreshKey}-${dateRange.from}-${dateRange.to}`} fallback={view === 'sessions' ? <SessionsListSkeleton /> : <HeatmapSkeleton />}>
          {view === 'sessions' && <SessionsView dateRange={dateRange} />}
          {view === 'heatmap' && <HeatmapView dateRange={dateRange} />}
        </Suspense>
        {view === 'live' && <LiveFeed />}
      </main>
    </div>
  );
}

export default App;
