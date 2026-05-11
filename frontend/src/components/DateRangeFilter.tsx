import { Calendar } from 'lucide-react';

const PRESETS = [
  { label: 'All Time', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Custom', value: 'custom' },
] as const;

function getRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  switch (preset) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to };
    }
    case '7d': {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { from: start.toISOString(), to };
    }
    case '30d': {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { from: start.toISOString(), to };
    }
    default:
      return { from: '', to: '' };
  }
}

export interface DateRange {
  from: string;
  to: string;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function DateRangeFilter({ value, onChange }: Props) {
  const activePreset = PRESETS.find(p => {
    if (p.value === '' && !value.from && !value.to) return true;
    if (p.value === 'custom') return false;
    if (p.value === '') return false;
    const r = getRange(p.value);
    // Match by comparing dates (ignoring ms precision)
    return r.from.slice(0, 16) === value.from.slice(0, 16);
  })?.value || 'custom';

  const isCustom = activePreset === 'custom' || (value.from && !PRESETS.some(p => p.value !== '' && p.value !== 'custom' && getRange(p.value).from.slice(0, 16) === value.from.slice(0, 16)));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
        {PRESETS.filter(p => p.value !== 'custom').map(preset => (
          <button
            key={preset.value}
            onClick={() => onChange(getRange(preset.value))}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activePreset === preset.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <input
          type="date"
          value={value.from ? value.from.slice(0, 10) : ''}
          onChange={e => {
            const from = e.target.value ? new Date(e.target.value).toISOString() : '';
            onChange({ from, to: value.to });
          }}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
        />
        <span className="text-muted-foreground">to</span>
        <input
          type="date"
          value={value.to ? value.to.slice(0, 10) : ''}
          onChange={e => {
            const to = e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : '';
            onChange({ from: value.from, to });
          }}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
        />
      </div>
    </div>
  );
}

export default DateRangeFilter;
