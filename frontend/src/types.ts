export interface Session {
  session_id: string;
  event_count: number;
  page_views: number;
  clicks: number;
  first_event: string;
  last_event: string;
}

export interface SessionsResponse {
  sessions: Session[];
}

export interface TrackingEvent {
  _id: string;
  session_id: string;
  event_type: 'page_view' | 'click';
  page_url: string;
  timestamp: string;
  click_x: number | null;
  click_y: number | null;
  user_agent: string | null;
  screen_width: number | null;
  screen_height: number | null;
  referrer: string | null;
  element_tag: string | null;
  element_text: string | null;
}

export interface ClickData {
  click_x: number;
  click_y: number;
  session_id: string;
  timestamp: string;
}
