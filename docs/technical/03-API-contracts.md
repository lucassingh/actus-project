# 03 — API Contracts (Mobile ↔ Web)

All endpoints are under `/api/v1/`. Authentication via Clerk JWT — mobile sends `Authorization: Bearer <clerk_session_token>`.

## Auth

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/auth/me` | Get current user + tenant info |

## Events

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/v1/events` | operator, supervisor | List events for tenant (operator sees own, supervisor sees all) |
| POST | `/api/v1/events` | operator | Create new event (status: draft) |
| GET | `/api/v1/events/:id` | operator, supervisor | Get single event with conversation history |
| PATCH | `/api/v1/events/:id` | operator | Update event (status, solution, etc.) |

## Agent (chat)

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/api/v1/agent/message` | operator | Send message to agent (text/audio/image) |

### POST /api/v1/agent/message — Request
```json
{
  "eventId": 123,          // null = create new draft event
  "messageType": "text",   // "text" | "audio" | "image"
  "content": "La bomba A3 hace ruido raro",
  "file": "<base64>"       // only for audio/image
}
```

### POST /api/v1/agent/message — Response
```json
{
  "response": "Entiendo, la bomba A3 puede estar...",
  "eventId": 123,
  "eventUpdate": {
    "status": "in_progress",
    "priority": "high",
    "machineName": "Pump A3",
    "resolved": false
  }
}
```

## Users (admin/supervisor)

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/v1/users` | supervisor, admin | List users in tenant |
| POST | `/api/v1/users/invite` | supervisor | Invite operator via Clerk |

## Notes for mobile app migration (actus-app)

The contract is **identical** to the v1 API except:
1. Auth: same `Bearer` token header — Clerk session tokens work the same way
2. Base URL changes from `http://local-ip:8000` to the Vercel deployment URL
3. The `/api/v1/chat/message` endpoint becomes `/api/v1/agent/message` — update `chat.service.ts`
4. Invitations: removed from mobile scope, handled via Clerk dashboard
