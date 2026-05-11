import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  session_id: string;
  event_type: 'page_view' | 'click';
  page_url: string;
  timestamp: Date;
  click_x: number | null;
  click_y: number | null;
  user_agent: string | null;
  screen_width: number | null;
  screen_height: number | null;
  referrer: string | null;
  element_tag: string | null;
  element_text: string | null;
}

const eventSchema = new Schema<IEvent>({
  session_id: { type: String, required: true, index: true },
  event_type: { type: String, required: true, enum: ['page_view', 'click'] },
  page_url: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  click_x: { type: Number, default: null },
  click_y: { type: Number, default: null },
  user_agent: { type: String, default: null },
  screen_width: { type: Number, default: null },
  screen_height: { type: Number, default: null },
  referrer: { type: String, default: null },
  element_tag: { type: String, default: null },
  element_text: { type: String, default: null }
});

eventSchema.index({ page_url: 1, event_type: 1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
