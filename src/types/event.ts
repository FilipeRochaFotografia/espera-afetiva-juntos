export interface Event {
  id: string;
  name: string;
  date: Date;
  emoji: string;
  theme: string;
  custom_message?: string;
  created_by?: string;
  is_active?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Post {
  id: string;
  event_id: string;
  user_id: string;
  type: 'text' | 'image' | 'video';
  content?: string;
  media_url?: string;
  created_at: Date;
  user?: User;
  reactions?: Reaction[];
  reaction_count?: number;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: Date;
  user?: User;
}