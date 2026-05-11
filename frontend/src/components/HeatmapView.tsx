import { Suspense, use, useState } from 'react';
import type { ClickData } from '../types';
import { fetchData } from '../fetchData';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Dropdown } from './ui/dropdown';
import { MousePointerClick, Crosshair } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import type { DateRange } from './DateRangeFilter';

function buildHeatmapUrl(pageUrl: string, dateRange: DateRange): string {
  const params = new URLSearchParams({ page_url: pageUrl });
  if (dateRange.from) params.set('from', dateRange.from);
  if (dateRange.to) params.set('to', dateRange.to);
  return `/api/events/heatmap?${params.toString()}`;
}

function HeatmapDots({ pageUrl, dateRange }: { pageUrl: string; dateRange: DateRange }) {
  const clicks = use(fetchData<ClickData[]>(buildHeatmapUrl(pageUrl, dateRange)));

  if (clicks.length === 0) {
    return (
      <div className="py-16 text-center">
        <Crosshair className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">No click data for this page yet.</p>
      </div>
    );
  }

  const chartData = clicks.map(c => ({ x: c.click_x, y: c.click_y }));

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <ResponsiveContainer width="100%" height={450}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              type="number"
              dataKey="x"
              name="X"
              unit="px"
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              label={{ value: 'X Position (px)', position: 'bottom', offset: 0, style: { fontSize: 12, fill: 'var(--color-muted-foreground)' } }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Y"
              unit="px"
              reversed
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              label={{ value: 'Y Position (px)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'var(--color-muted-foreground)' } }}
            />
            <ZAxis range={[80, 80]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--color-foreground)',
              }}
              formatter={(value) => [`${value}px`]}
            />
            <Scatter
              data={chartData}
              fill="#ef4444"
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {clicks.length} click(s) recorded
          </span>
        </div>
        <Badge variant="secondary" className="text-xs">
          Y-axis inverted (top = 0)
        </Badge>
      </div>
    </div>
  );
}

function HeatmapView({ dateRange }: { dateRange: DateRange }) {
  const pages = use(fetchData<string[]>('/api/events/pages'));
  const [selectedPage, setSelectedPage] = useState(pages.length > 0 ? pages[0] : '');

  const dropdownOptions = pages.map(p => ({ value: p, label: p }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MousePointerClick className="h-5 w-5" />
              Click Heatmap
            </CardTitle>
            <CardDescription className="mt-1">
              Density heatmap of user clicks on the page
            </CardDescription>
          </div>
          {selectedPage && (
            <Badge variant="outline">{selectedPage}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5">
          <label className="text-sm font-medium text-foreground mb-2 block">Page URL</label>
          <Dropdown
            options={dropdownOptions}
            value={selectedPage}
            onValueChange={setSelectedPage}
            placeholder="Select a page..."
          />
        </div>

        {selectedPage ? (
          <Suspense fallback={
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
              Loading heatmap...
            </div>
          }>
            <HeatmapDots pageUrl={selectedPage} dateRange={dateRange} />
          </Suspense>
        ) : (
          <div className="py-16 text-center">
            <Crosshair className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Select a page to view its heatmap.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HeatmapView;
