// Types matching the Actus V2 API (apps/web /api/v1/*)
// All fields are camelCase; enums are UPPERCASE to match Prisma
//
// Enums come from @actus/types (shared with apps/web) so they can't drift out of sync again.
// The interfaces below stay local for now — apps/web's @actus/types shapes (EventDetail, AuthMeResponse)
// don't fully match what these API routes actually return yet (e.g. creator object vs creatorId),
// so unifying them needs checking the route implementations first rather than guessing here.
import type { Role, EventType, EventStatus, Priority, ContentType, MessageType } from '@actus/types';
export type { Role, EventType, EventStatus, Priority, ContentType, MessageType };

// /api/v1/auth/me response
export interface User {
  id: number;
  clerkUserId: string;
  tenantId: number | null;
  email: string;
  name: string;
  lastname: string;
  role: Role;
  isActive: boolean;
  tenant: {
    id: number;
    name: string;
    code: string;
    plan: string;
  } | null;
}

// Full event as returned by GET /api/v1/events/:id
export interface Event {
  id: number;
  title: string;
  description: string | null;
  eventType: EventType;
  status: EventStatus;
  priority: Priority;
  contentType: ContentType;
  machineName: string | null;
  location: string | null;
  problemContent: string | null;
  solution: string | null;
  symptoms: string[];
  conversationHistory: ConversationHistory | null;
  aiSuggestions: string[] | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  creatorId: number;
  tenantId: number;
}

// Summary as returned by GET /api/v1/events (list)
export interface EventSummary {
  id: number;
  title: string;
  eventType: EventType;
  status: EventStatus;
  priority: Priority;
  contentType: ContentType;
  machineName: string | null;
  location: string | null;
  createdAt: string;
  resolvedAt: string | null;
  creator: {
    id: number;
    name: string;
    lastname: string;
  };
}

export interface ConversationHistory {
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type: MessageType;
  filePath?: string;
}

// Agent API
export interface AgentMessageResponse {
  response: string;
  eventId: number;
  eventUpdate: EventUpdate | null;
}

export interface EventUpdate {
  status?: EventStatus;
  priority?: Priority;
  machineName?: string;
  location?: string;
  resolved?: boolean;
  title?: string;
}

// Chat message for local UI display
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: MessageType;
  timestamp: string;
  isNewMessage?: boolean;
}
