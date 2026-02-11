# Sovereign Labs REST API v1

Base URL: `https://your-domain.com/api/v1`

## Authentication

All `/api/v1/*` requests require an API key in `X-API-Key`.

```bash
curl -H "X-API-Key: YOUR_API_KEY" https://your-domain.com/api/v1/devices
```

## Closed-Ecosystem File Policy

Files are now stored internally in Supabase Postgres (`internal_drive_files`) and served via app routes.

- No external blob/CDN URL is required for research/task file workflows.
- Use the Drive Files API to upload binary payloads.
- Reference returned `drive_file_id` from task/research APIs.

## Response Envelope

```json
// Success
{ "data": <payload>, "error": null }

// Error
{ "data": null, "error": { "code": "not_found", "message": "..." } }
```

### Error Codes

| Code | HTTP Status | Description |
|---|---:|---|
| `unauthorized` | 401 | Missing/invalid API key |
| `bad_request` | 400 | Invalid request body/params |
| `not_found` | 404 | Resource missing |
| `server_error` | 500 | Internal server error |

---

## Devices

- `GET /devices`
- `POST /devices`
- `GET /devices/:id`
- `PATCH /devices/:id`
- `DELETE /devices/:id`
- `GET /devices/:id/parts`

---

## Parts

- `GET /parts`
- `POST /parts`
- `GET /parts/:id`
- `PATCH /parts/:id`
- `DELETE /parts/:id`
- `GET /parts/spare`

---

## Initiatives

- `GET /initiatives`
- `GET /initiatives/active`
- `POST /initiatives`
- `GET /initiatives/:id`
- `PATCH /initiatives/:id`
- `DELETE /initiatives/:id`
- `POST /initiatives/:id/devices`
- `DELETE /initiatives/:id/devices/:assignmentId`
- `POST /initiatives/:id/parts`
- `DELETE /initiatives/:id/parts/:assignmentId`

### Initiative statuses

Supported statuses:
- `suggested`
- `approved`
- `executing`
- `finalized`
- `archived`

---

## Team Members

- `GET /team-members`
- `POST /team-members`
- `PATCH /team-members/:id`
- `DELETE /team-members/:id`

---

## Tasks

- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

`GET /tasks/:id` includes enriched task details:
- assignee
- subtasks
- files
- meetings
- mentions

### Task files (new)

- `GET /tasks/:id/files`
- `POST /tasks/:id/files`
- `DELETE /tasks/:id/files/:fileId`

Create task file body:

```json
{
  "name": "Spec PDF",
  "drive_file_id": "uuid", 
  "content_type": "application/pdf",
  "file_size": 120033,
  "uploaded_by": "team-member-uuid"
}
```

Notes:
- `drive_file_id` is preferred for closed-system storage.

---

## Research Documents

- `GET /research-documents`
- `POST /research-documents`
- `PATCH /research-documents/:id`
- `DELETE /research-documents/:id`

Create/update payload supports:

```json
{
  "title": "Final report",
  "summary": "...",
  "content": "...",
  "status": "draft",
  "initiative_id": "uuid",
  "created_by": "team-member-uuid",
  "drive_file_id": "uuid"
}
```

Notes:
- If `drive_file_id` is provided and `storage_url` is omitted, server auto-populates internal storage URL.
- `status` values: `draft`, `final`.

---

## Drive Files (new)

Internal binary storage API for agents.

- `GET /drive-files?scope=research_document&isPublic=false&limit=100`
- `POST /drive-files`
- `GET /drive-files/:id`
- `DELETE /drive-files/:id`
- `GET /drive-files/:id/download`

Create body:

```json
{
  "name": "report.pdf",
  "contentType": "application/pdf",
  "dataBase64": "JVBERi0xLjc...",
  "scope": "research_document",
  "isPublic": false,
  "createdByUserId": "optional-user-uuid"
}
```

Response includes:
- `download_url` (API key protected binary endpoint)
- `app_download_url` (`/api/drive/files/:id`, app-session protected)
- `public_url` (`/api/files/:id`) when `isPublic=true`

File limits:
- Max upload size: 25 MB

---

## Purchases

- `GET /purchases`
- `POST /purchases`
- `GET /purchases/:id`
- `PATCH /purchases/:id`
- `DELETE /purchases/:id`

---

## Dashboard Stats

- `GET /stats`

---

## Chats

- `GET /chats?userId=UUID&limit=20&startingAfter=chatId&endingBefore=chatId`
- `GET /chats/:id`
- `DELETE /chats/:id`
- `GET /chats/:id/messages`
- `GET /chats/:id/votes`
- `PATCH /chats/:id/votes`

---

## Documents

- `POST /documents`
- `GET /documents/:id`
- `DELETE /documents/:id?timestamp=ISO_TIME`

---

## Suggestions

- `GET /suggestions/:documentId`

---

## User Models

- `GET /user-models/:userId`
- `POST /user-models/:userId`
- `DELETE /user-models/:userId/:modelId?action=delete_custom`
- `DELETE /user-models/:userId/:modelId?action=restore_default`

---

## Setup

Add to `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENCLAW_API_KEY=your-generated-api-key
```

## Quick Tests

```bash
# Unauthorized
curl http://localhost:3000/api/v1/devices

# Authorized list
curl -H "X-API-Key: YOUR_KEY" http://localhost:3000/api/v1/devices

# Upload internal drive file
curl -X POST \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"sample.txt","contentType":"text/plain","dataBase64":"aGVsbG8="}' \
  http://localhost:3000/api/v1/drive-files
```
