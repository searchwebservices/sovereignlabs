# Sovereign Labs REST API v1

Base URL: `https://your-domain.com/api/v1`

## Authentication

All requests require an API key sent via the `X-API-Key` header:

```bash
curl -H "X-API-Key: YOUR_API_KEY" https://your-domain.com/api/v1/devices
```

## Response Format

All endpoints return a consistent JSON envelope:

```json
// Success
{ "data": <payload>, "error": null }

// Error
{ "data": null, "error": { "code": "not_found", "message": "Device not found" } }
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Missing or invalid API key |
| `bad_request` | 400 | Invalid request body or missing required fields |
| `not_found` | 404 | Resource not found |
| `server_error` | 500 | Internal server error |

---

## Endpoints

### Devices

#### List all devices
```
GET /devices
```

#### Create a device
```
POST /devices
Content-Type: application/json

{
  "name": "Samsung Galaxy S22",        // required
  "type": "smartphone",                // optional: smartphone, smartwatch, tablet, smart_speaker, other
  "description": "Test device",        // optional
  "status": "available",               // optional: available, in_use, maintenance, retired
  "location": "Lab A",                 // optional
  "purchase_date": "2024-01-15",       // optional
  "cost": 799.99,                      // optional
  "serial_number": "SN123456"          // optional
}
```

#### Get device by ID (includes attached parts)
```
GET /devices/:id
```

#### Update a device
```
PATCH /devices/:id
Content-Type: application/json

{ "status": "in_use", "location": "Lab B" }
```

#### Delete a device
```
DELETE /devices/:id
```

#### List parts attached to a device
```
GET /devices/:id/parts
```

---

### Parts

#### List all parts (with device relations)
```
GET /parts
```

#### Create a part
```
POST /parts
Content-Type: application/json

{
  "name": "OLED Display",             // required
  "description": "6.1 inch panel",    // optional
  "category": "display",              // optional: display, camera_module, battery, circuit_board, connector, cable, power_supply, actuator, sensor, memory
  "quantity": 5,                       // optional (default varies)
  "unit_cost": 45.00,                 // optional
  "status": "spare",                  // optional: spare, attached
  "device_id": "uuid",               // optional: attach to a device
  "location": "Shelf B2"              // optional
}
```

#### Get part by ID (with device relation)
```
GET /parts/:id
```

#### Update a part
```
PATCH /parts/:id
Content-Type: application/json

{ "quantity": 3, "status": "attached", "device_id": "uuid" }
```

#### Delete a part
```
DELETE /parts/:id
```

#### List spare parts only
```
GET /parts/spare
```

---

### Initiatives

#### List all initiatives
```
GET /initiatives
```

#### List active initiatives only (planning + active)
```
GET /initiatives/active
```

#### Create an initiative
```
POST /initiatives
Content-Type: application/json

{
  "name": "Home Assistant Dashboard",  // required
  "description": "Smart home control", // optional
  "status": "planning",                // optional: planning, active, completed, archived
  "start_date": "2024-02-01",          // optional
  "target_date": "2024-06-01"          // optional
}
```

#### Get initiative by ID (with assigned devices and parts)
```
GET /initiatives/:id
```

#### Update an initiative
```
PATCH /initiatives/:id
Content-Type: application/json

{ "status": "active", "start_date": "2024-02-15" }
```

#### Delete an initiative
```
DELETE /initiatives/:id
```

#### Assign a device to an initiative
```
POST /initiatives/:id/devices
Content-Type: application/json

{
  "deviceId": "uuid",       // required
  "notes": "Primary server" // optional
}
```

#### Unassign a device
```
DELETE /initiatives/:id/devices/:assignmentId
```

#### Assign a part to an initiative
```
POST /initiatives/:id/parts
Content-Type: application/json

{
  "partId": "uuid",          // required
  "quantity": 2,              // required
  "notes": "For display mod" // optional
}
```

#### Unassign a part
```
DELETE /initiatives/:id/parts/:assignmentId
```

---

### Team Members

#### List all team members
```
GET /team-members
```

#### Create a team member
```
POST /team-members
Content-Type: application/json

{
  "name": "Jane Doe",              // required
  "email": "jane@example.com",     // optional
  "role": "Engineer"               // optional
}
```

#### Update a team member
```
PATCH /team-members/:id
Content-Type: application/json

{ "role": "Lead Engineer" }
```

#### Delete a team member
```
DELETE /team-members/:id
```

---

### Tasks

#### List all tasks (with assignee info)
```
GET /tasks
```

#### Create a task
```
POST /tasks
Content-Type: application/json

{
  "title": "Repair display",          // required
  "description": "Fix cracked OLED",  // optional
  "status": "todo",                    // optional: todo, in_progress, done
  "priority": "high",                 // optional: low, medium, high, urgent
  "assigned_to": "team-member-uuid",  // optional
  "due_date": "2024-03-01"            // optional
}
```

#### Get task by ID (with assignee)
```
GET /tasks/:id
```

#### Update a task
```
PATCH /tasks/:id
Content-Type: application/json

{ "status": "in_progress", "assigned_to": "uuid" }
```

#### Delete a task
```
DELETE /tasks/:id
```

---

### Purchases

#### List all purchases (with relations)
```
GET /purchases
```

#### Create a purchase
```
POST /purchases
Content-Type: application/json

{
  "item_name": "Replacement Battery",  // required
  "description": "3000mAh Li-ion",     // optional
  "quantity": 2,                        // optional (default: 1)
  "estimated_cost": 25.00,             // optional
  "vendor": "iFixit",                  // optional
  "status": "needed",                  // optional: needed, approved, ordered, shipped, received, cancelled
  "priority": "medium",                // optional: low, medium, high, urgent
  "linked_device_id": "uuid",          // optional
  "linked_part_id": "uuid",            // optional
  "requested_by": "team-member-uuid",  // optional
  "notes": "Urgent replacement"        // optional
}
```

#### Get purchase by ID (with relations)
```
GET /purchases/:id
```

#### Update a purchase
```
PATCH /purchases/:id
Content-Type: application/json

{ "status": "ordered", "vendor": "Amazon" }
```

#### Delete a purchase
```
DELETE /purchases/:id
```

---

### Dashboard Stats

#### Get lab dashboard aggregates
```
GET /stats
```

Response:
```json
{
  "data": {
    "deviceCount": 12,
    "sparePartCount": 45,
    "activeInitiativeCount": 3,
    "totalInventoryValue": 2500.00
  },
  "error": null
}
```

---

### Chats

#### List chats by user
```
GET /chats?userId=UUID&limit=20&startingAfter=chatId&endingBefore=chatId
```
- `userId` (required): The user's UUID
- `limit` (optional, default: 20): Number of chats to return
- `startingAfter` / `endingBefore` (optional): Cursor-based pagination

Response includes `{ chats: [...], hasMore: boolean }`

#### Get chat by ID
```
GET /chats/:id
```

#### Delete a chat (and all related messages, votes, streams)
```
DELETE /chats/:id
```

#### Get messages for a chat
```
GET /chats/:id/messages
```

#### Get votes for a chat
```
GET /chats/:id/votes
```

#### Vote on a message
```
PATCH /chats/:id/votes
Content-Type: application/json

{
  "messageId": "uuid",  // required
  "type": "up"          // required: "up" or "down"
}
```

---

### Documents

#### Create a document
```
POST /documents
Content-Type: application/json

{
  "id": "uuid",          // required
  "title": "My Doc",     // required
  "userId": "uuid",      // required
  "kind": "text",        // optional: text, code, image, sheet
  "content": "Hello"     // optional
}
```

#### Get document versions
```
GET /documents/:id
```

#### Delete document versions after timestamp
```
DELETE /documents/:id?timestamp=2024-01-01T00:00:00Z
```
- `timestamp` (optional): ISO date string. Deletes versions created after this time. Defaults to epoch (deletes all).

---

### Suggestions

#### Get suggestions for a document
```
GET /suggestions/:documentId
```

---

### User Models

#### Get model preferences for a user
```
GET /user-models/:userId
```

#### Add, remove, or select a model
```
POST /user-models/:userId
Content-Type: application/json

{
  "action": "add",                  // required: "add", "remove", or "select"
  "model_id": "gpt-4o",            // required
  "model_name": "GPT-4o",          // required
  "provider": "openai"             // required
}
```

#### Delete a custom model or restore a default model
```
DELETE /user-models/:userId/:modelId?action=delete_custom
DELETE /user-models/:userId/:modelId?action=restore_default
```

---

## Setup

### Environment Variables

Add these to your `.env.local`:

```bash
# Supabase service role key (from Supabase Dashboard > Settings > API)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API key for external agent access
OPENCLAW_API_KEY=your-generated-api-key
```

### Quick Test

```bash
# Should return 401
curl http://localhost:3000/api/v1/devices

# Should return data
curl -H "X-API-Key: YOUR_KEY" http://localhost:3000/api/v1/devices

# Create a device
curl -X POST -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"name": "Test Device", "status": "available"}' \
  http://localhost:3000/api/v1/devices
```
