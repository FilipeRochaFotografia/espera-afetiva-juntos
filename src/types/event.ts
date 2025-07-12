export interface Event {
  id: string;
  name: string;
  date: Date;
  emoji: string;
  theme: string;
  customMessage?: string;
}