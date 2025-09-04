export interface User {
  id: string;
  name: string;
  avatarUrl: string;
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
  typing?: { [userName: string]: number };
  users: { name: string; joinedAt: number; avatarUrl: string; }[];
  isPrivate?: boolean;
  password?: string;
}
