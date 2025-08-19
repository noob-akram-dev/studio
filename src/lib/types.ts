export interface User {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  text: string;
  user: User;
  timestamp: number;
  language?: string;
}

export interface Room {
  code: string;
  messages: Message[];
  createdAt: number;
}
