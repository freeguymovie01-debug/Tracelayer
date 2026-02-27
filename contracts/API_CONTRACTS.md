# API Contracts

**Base URL:** `http://localhost:4000`

## Auth Routes

### `POST /auth/register`
**Body:**
```json
{
  "name": "Test Admin",
  "email": "admin@dda.com",
  "password": "password123",
  "role": "ADMIN"
}
```
**Response (201):**
```json
{
  "token": "eyJhb...",
  "user": {
    "id": "cm...",
    "email": "admin@dda.com",
    "name": "Test Admin",
    "role": "ADMIN",
    "createdAt": "2023-10-10T..."
  }
}
```

### `POST /auth/login`
**Body:**
```json
{
  "email": "admin@dda.com",
  "password": "password123"
}
```
**Response (200):** Same as `/auth/register`

### `GET /auth/me`
**Header:** `Authorization: Bearer <token>`
**Response (200):** User object (no password).

---

## Upload Routes

### `POST /uploads/photo`
**Header:** `Authorization: Bearer <token>`
**Body:** `multipart/form-data` with field `photo` (Max: 10MB)
**Response (200):**
```json
{
  "url": "/uploads/123456789-photo.jpg",
  "filename": "123456789-photo.jpg"
}
```

---

## Assessment Routes

### `GET /assessments`
**Header:** `Authorization: Bearer <token>`
**Query Params:** `?page=1&limit=20&zone=id&status=PENDING&severity=high`
**Response (200):**
```json
{
  "data": [{ ...assessment Object... }],
  "total": 50,
  "page": 1,
  "totalPages": 3
}
```

### `POST /assessments`
**Header:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "zoneId": "cm...",
  "lat": 28.6139,
  "lng": 77.2090,
  "damageType": "structural",
  "structureDamage": 80,
  "damageSeverity": 75,
  "personsDamage": 0,
  "infraDamage": 50,
  "photoUrl": "/uploads/123.jpg",
  "notes": "Building collapse"
}
```
**Response (201):** Assessment object with calculated `severityScore`.

### `PATCH /assessments/:id/verify`
**Header:** `Authorization: Bearer <token>` (Admin/Supervisor only)
**Body:** `{ "status": "VERIFIED" }`
**Response (200):** Updated Assessment object.

### `GET /assessments/stats/overview`
**Header:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "total": 100,
  "pending": 40,
  "verified": 50,
  "rejected": 10
}
```

---

## WebSocket Connections
**Client URL:** `ws://localhost:4000`
**Connection:**
```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:4000', {
  auth: { token: '<jwt>' }
});
```

**Events emitted BY SERVER:**
- `'newAssessment'`: Emits full Assessment object.
- `'alertFired'`: Emits `{ alertId, zoneId, zoneName, severityScore, message, timestamp }`.
- `'mapUpdate'`: Emits `{ type: 'invalidate' }`.

**Events emitted BY CLIENT:**
- `'subscribe:zone'`: Emits `{ zoneId }`.

---

## AI Recognition Routes

### `POST /ai/classify`
**Header:** `Authorization: Bearer <token>`
**Body:** `multipart/form-data` with field `file` (image)
**Model:** `openai/clip-vit-base-patch32` (Zero-shot NLP prompt matching, no fine-tuning)
**Response (200):**
```json
{
  "damageClass": "major-damage",
  "classLabel": "Major Structural Damage",
  "confidence": 0.8234,
  "confidencePercent": 82,
  "severityHint": 70,
  "requiresReview": false,
  "reviewMessage": null,
  "allScores": {
    "no-damage": 0.05,
    "minor-damage": 0.1,
    "major-damage": 0.8234,
    "destroyed": 0.0266
  },
  "mode": "clip-zero-shot"
}
```

### `GET /ai/status`
**Header:** `Authorization: Bearer <token>`
**Response (200):**
Includes the runtime configuration and reviewer notes explaining confidence levels (Softmax probability over top predicted class) and support mechanisms (4 NLP text prompts representing the equal semantic classes).
