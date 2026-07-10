export type Participant = {
  id: number;
  name: string;
  email?: string | null;
};

export type Topic = {
  id: number;
  label: string;
};

export type Segment = {
  id: number;
  speaker: string;
  start_seconds: number;
  end_seconds: number;
  text: string;
};

export type ActionItem = {
  id: number;
  text: string;
  assignee?: string | null;
  due_date?: string | null;
  completed: boolean;
};

export type MeetingListItem = {
  id: number;
  title: string;
  meeting_date: string;
  duration_seconds: number;
  source: string;
  status: string;
  participants: Participant[];
  topics: Topic[];
  updated_at: string;

  // Optional because the list API may not return these fields.
  summary?: string;
  action_items?: ActionItem[];
};

export type MeetingDetail = MeetingListItem & {
  summary: string;
  segments: Segment[];
  action_items: ActionItem[];
  created_at: string;
};

export type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  meetingId?: number;
};

