// Shared TypeScript types for Actus V2
// Used by: apps/web (API routes) and actus-app (mobile services)

// ─────────────────────────────────────────────────────────────────────────────
// Enums (mirror Prisma enums — kept in sync manually)
// ─────────────────────────────────────────────────────────────────────────────

export type Role = "ADMIN" | "SUPERVISOR" | "OPERATOR";
export type EventType = "INCIDENT" | "MAINTENANCE" | "CONTROL";
export type EventStatus = "DRAFT" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ContentType = "TEXT" | "AUDIO" | "IMAGE" | "MIXED";
export type MessageType = "text" | "audio" | "image";

// ─────────────────────────────────────────────────────────────────────────────
// API Request / Response types
// Used to type fetch() calls in the mobile app and dashboard
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthMeResponse {
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

export interface EventDetail extends EventSummary {
  description: string | null;
  problemContent: string | null;
  solution: string | null;
  conversationHistory: ConversationHistory | null;
  aiSuggestions: string[] | null;
  symptoms: string[];
}

export interface ConversationHistory {
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  type: MessageType;
  filePath?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent API
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentMessageRequest {
  eventId?: number;      // null = create new draft event
  messageType: MessageType;
  content?: string;      // text content
  file?: string;         // base64 for audio/image
  fileName?: string;
  fileMimeType?: string;
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Knowledge Base
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeBaseEntry {
  id: number;
  problemText: string;
  solutionText: string;
  effectivenessScore: number;
  timesReferenced: number;
  machineName: string | null;
  tags: string[];
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// User management
// ─────────────────────────────────────────────────────────────────────────────

export interface UserSummary {
  id: number;
  email: string;
  name: string;
  lastname: string;
  role: Role;
  isActive: boolean;
  department: string | null;
  lastLoginAt: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// API error envelope
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code?: string;
}
