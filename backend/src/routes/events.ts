import { Router, Request, Response } from 'express';
import { Event } from '../models/Event';

const router = Router();

const sseClients = new Set<Response>();

router.get('/stream', (req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(': connected\n\n');

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

function broadcastEvent(data: unknown): void {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

router.post('/track', async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_id, event_type, page_url, timestamp, click_x, click_y, user_agent, screen_width, screen_height, referrer, element_tag, element_text } = req.body;

    if (!session_id || !event_type || !page_url) {
      res.status(400).json({ error: 'Missing required fields: session_id, event_type, page_url' });
      return;
    }

    if (!['page_view', 'click'].includes(event_type)) {
      res.status(400).json({ error: 'Invalid event_type. Must be page_view or click' });
      return;
    }

    const event = new Event({
      session_id,
      event_type,
      page_url,
      timestamp: timestamp || new Date(),
      click_x: event_type === 'click' ? click_x : null,
      click_y: event_type === 'click' ? click_y : null,
      user_agent: user_agent || null,
      screen_width: screen_width || null,
      screen_height: screen_height || null,
      referrer: referrer || null,
      element_tag: event_type === 'click' ? (element_tag || null) : null,
      element_text: event_type === 'click' ? (element_text || null) : null
    });

    await event.save();
    broadcastEvent(event.toObject());
    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track event' });
  }
});

router.get('/sessions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    const match: Record<string, unknown> = {};
    if (from || to) {
      match.timestamp = {};
      if (from) (match.timestamp as Record<string, unknown>).$gte = new Date(from as string);
      if (to) (match.timestamp as Record<string, unknown>).$lte = new Date(to as string);
    }

    const pipeline = [
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      {
        $group: {
          _id: '$session_id',
          event_count: { $sum: 1 },
          page_views: { $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] } },
          clicks: { $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] } },
          first_event: { $min: '$timestamp' },
          last_event: { $max: '$timestamp' }
        }
      },
      { $sort: { last_event: -1 as const } }
    ];

    const sessions = await Event.aggregate(pipeline);

    res.json({
      sessions: sessions.map(s => ({
        session_id: s._id,
        event_count: s.event_count,
        page_views: s.page_views,
        clicks: s.clicks,
        first_event: s.first_event,
        last_event: s.last_event
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/sessions/:sessionId/events', async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ session_id: req.params.sessionId })
      .sort({ timestamp: 1 })
      .lean();

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session events' });
  }
});

router.get('/heatmap', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page_url, from, to } = req.query;

    if (!page_url) {
      res.status(400).json({ error: 'page_url query parameter is required' });
      return;
    }

    const filter: Record<string, unknown> = {
      page_url: page_url as string,
      event_type: 'click',
      click_x: { $ne: null },
      click_y: { $ne: null }
    };
    if (from || to) {
      filter.timestamp = {};
      if (from) (filter.timestamp as Record<string, unknown>).$gte = new Date(from as string);
      if (to) (filter.timestamp as Record<string, unknown>).$lte = new Date(to as string);
    }

    const clicks = await Event.find(filter)
      .select('click_x click_y session_id timestamp')
      .lean();

    res.json(clicks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

router.get('/pages', async (_req: Request, res: Response): Promise<void> => {
  try {
    const pages = await Event.distinct('page_url');
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function eventsToCsv(events: Record<string, unknown>[]): string {
  const headers = ['session_id', 'event_type', 'page_url', 'timestamp', 'click_x', 'click_y', 'user_agent', 'screen_width', 'screen_height', 'referrer', 'element_tag', 'element_text'];
  const rows = events.map(e => headers.map(h => escapeCsvField(e[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

router.get('/export/sessions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    const filter: Record<string, unknown> = {};
    if (from || to) {
      filter.timestamp = {};
      if (from) (filter.timestamp as Record<string, unknown>).$gte = new Date(from as string);
      if (to) (filter.timestamp as Record<string, unknown>).$lte = new Date(to as string);
    }
    const events = await Event.find(filter).sort({ session_id: 1, timestamp: 1 }).lean();
    const csv = eventsToCsv(events as unknown as Record<string, unknown>[]);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sessions_export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

router.get('/export/sessions/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ session_id: req.params.sessionId }).sort({ timestamp: 1 }).lean();
    const csv = eventsToCsv(events as unknown as Record<string, unknown>[]);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=session_${req.params.sessionId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export session data' });
  }
});

export default router;
