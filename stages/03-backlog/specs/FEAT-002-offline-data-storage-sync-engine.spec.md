# Spec: Offline Data Storage & Sync Engine
**Feature ID:** FEAT-002  
**Epic:** EPIC-001 — Mobile Field Technician Experience  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature enables field technicians to continue working when they have little or no connectivity by introducing local device storage, a background synchronization engine, and conflict resolution rules. It is a core business capability because Contoso technicians regularly work in rural locations and inside facilities where signal is unreliable. The feature ensures completed work is not lost, uploads changes automatically when connectivity returns, and provides a controlled process for resolving conflicting edits.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-004 | Implement local offline data storage | 8 | Critical |
| US-005 | Build background data sync engine | 8 | Critical |
| US-006 | Implement conflict resolution for offline edits | 5 | Critical |

---

## 3. Functional Behavior

### 3.1 Local-first work order storage
The mobile application must use a local database to persist previously synced work orders, related tasks, notes, parts, photos, and attachments needed in the field. When the device has no connectivity, the application must load work order data from local storage without blocking on server calls. Create, update, and complete operations performed offline must be written immediately to the local store and marked as pending sync.

Business rules:
- Local storage must support all work order data types required for field execution.
- Cached attachments must remain available offline once downloaded.
- Writes must be atomic so partially saved work is not visible as complete.

### 3.2 Background synchronization
When connectivity is restored, the sync engine must detect network availability and process queued changes automatically within 60 seconds. Each work order change must be synced independently so a failure on one record does not block the queue. The engine must support retry with resumable processing if connectivity drops mid-sync.

State transitions:
- `Local Only` → `Queued for Sync`
- `Queued for Sync` → `Sync In Progress`
- `Sync In Progress` → `Synced`
- `Sync In Progress` → `Failed - Retryable`
- `Failed - Retryable` → `Sync In Progress` on next retry window

### 3.3 Conflict detection and resolution
If two users modify the same work order while offline, the sync engine must detect field-level conflicts using timestamps or version markers. Non-critical fields may follow last-write-wins. Critical fields such as status, approvals, compliance completion, customer sign-off, and billable values must be flagged for manual review. Affected technicians and supervisors must see a clear notification and a structured comparison of conflicting values.

Business rules:
- Conflict rules must be configurable by field category.
- Manual resolution decisions must be auditable.
- No conflicting payload may be silently discarded for critical fields.

### 3.4 Sync status visibility
The mobile shell must expose sync status to technicians. Users must be able to tell whether records are local-only, queued, syncing, failed, or fully synced. A last successful sync timestamp must be displayed in relevant mobile views.

---

## 4. Data Model

### OfflineWorkOrder
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Local primary key matching server work order ID when available |
| status | string | Yes | Current work order state |
| payload | json | Yes | Serialized work order data |
| lastServerVersion | string | No | Last known server version/etag |
| lastModifiedAtUtc | datetime | Yes | Last local update time |
| syncState | string | Yes | `local-only`, `queued`, `syncing`, `synced`, `failed`, `conflict` |
| lastSyncedAtUtc | datetime | No | Last successful sync time |

### SyncQueueItem
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| entityType | string | Yes | WorkOrder, Attachment, Checklist, etc. |
| entityId | GUID | Yes | Related entity |
| operation | string | Yes | Create, Update, Delete |
| payload | json | Yes | Change payload |
| retryCount | integer | Yes | Starts at 0 |
| nextRetryAtUtc | datetime | No | Backoff schedule |
| status | string | Yes | Pending, InProgress, Failed, Complete, Conflict |

### SyncConflict
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| entityId | GUID | Yes | Conflicted entity |
| fieldName | string | Yes | Field in conflict |
| localValue | string | No | Serialized local value |
| serverValue | string | No | Serialized server value |
| resolutionState | string | Yes | Open, Resolved |
| resolvedBy | string | No | User or supervisor ID |
| resolvedAtUtc | datetime | No | Resolution timestamp |

Relationships:
- `OfflineWorkOrder` has many `SyncQueueItem` entries.
- `OfflineWorkOrder` can have many `SyncConflict` entries.

---

## 5. API Contracts

### POST /api/mobile/sync/batch
**Description:** Uploads queued offline changes from a device to the platform backend.

**Request:**
```json
{
  "deviceId": "string — mobile device identifier",
  "changes": [
    {
      "entityType": "WorkOrder",
      "entityId": "GUID",
      "operation": "Update",
      "clientVersion": "string — local version marker",
      "payload": {}
    }
  ]
}
```

**Response (200):**
```json
{
  "results": [
    {
      "entityId": "GUID",
      "status": "Synced",
      "serverVersion": "string"
    }
  ]
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid sync payload |
| 401 | Unauthenticated request |
| 409 | Conflict detected on one or more fields |
| 503 | Sync service temporarily unavailable |

### GET /api/mobile/sync/bootstrap
**Description:** Returns delta data since the last successful sync.

**Request:**
```json
{
  "lastSyncAtUtc": "string — ISO 8601 timestamp"
}
```

**Response (200):**
```json
{
  "workOrders": [],
  "attachments": [],
  "serverTimeUtc": "string"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 | Unauthenticated request |
| 500 | Delta generation failure |

### POST /api/mobile/sync/conflicts/{conflictId}/resolve
**Description:** Resolves a flagged conflict.

**Request:**
```json
{
  "resolution": "keep-local | keep-server | merged",
  "mergedPayload": {}
}
```

**Response (200):**
```json
{
  "resolved": true,
  "entityId": "GUID"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 403 | Insufficient permissions for manual resolution |
| 404 | Conflict not found |
| 409 | Conflict already resolved |

---

## 6. UI/UX Behavior

- Mobile views using offline data must show a freshness indicator and sync badge.
- Pending changes should display a subtle queued/syncing icon.
- Conflict notifications must take the user to a readable comparison view.
- Loading state: initial hydration reads local data first, then overlays newer server data when available.
- Error state: failed sync items remain visible with retry status.
- Offline behavior: full read/write support for previously synced records and captured artifacts.
- Responsive behavior: queue and status indicators must work on phone and tablet layouts.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Mobile local database | Bidirectional | User reads/writes offline records | Work orders, attachments, checklist data |
| Platform backend sync service | Bidirectional | Connectivity restored | Changed records, deltas, conflict results |
| Mobile OS background task APIs | Outbound | Background sync window | Scheduled sync execution |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Offline support | Full read + write | Core requirement for rural job sites |
| Sync trigger | Within 60 seconds of connectivity restore | From user story acceptance criteria |
| Scale | 200 concurrent technicians | Full deployment target |
| Resilience | Per-record retry isolation | One failure must not block all syncs |
| Attachment support | Photos up to 20 MB | From backlog notes |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Device loses connectivity during sync  
  **Expected behavior:** Pause current batch, persist progress, retry when network returns.  
  **User-facing message (if any):** "Sync paused. Changes will resume when connection returns."
- **Scenario:** Local database is full or corrupted  
  **Expected behavior:** Prevent further writes, log diagnostics, prompt support/recovery path.  
  **User-facing message (if any):** "The app cannot save more offline data right now."
- **Scenario:** Two users update same critical field offline  
  **Expected behavior:** Create conflict record and require manual resolution.  
  **User-facing message (if any):** "A sync conflict requires review."
- **Scenario:** One item in batch fails validation  
  **Expected behavior:** Mark failed item individually and continue with remaining queue items.  
  **User-facing message (if any):** "One change could not be synced. Other changes continued."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a technician in an area with no connectivity, when they complete a work order, then all data is persisted locally on the device
- [ ] Given a technician whose device regains connectivity, when the sync engine runs, then all locally stored changes are uploaded to the server
- [ ] Given two users editing the same work order offline, when both sync, then the system applies conflict resolution rules and notifies affected users
- [ ] Given a technician in an area with no connectivity, when they open the app, then all previously synced work orders are available for viewing
- [ ] Given the device has no connectivity, when the technician completes a work order and saves it, then the data is persisted to the local database
- [ ] Given multiple work orders were updated offline, when the sync runs, then each work order is synced independently so a failure in one does not block others

---

## 11. Out of Scope

- Mobile shell and navigation foundation — covered by FEAT-001.
- Work order completion UX and field entry forms — covered by FEAT-003.
- Photo/signature capture UI specifics — covered by FEAT-004.
- Supervisor conflict review workflow outside sync resolution UI.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which local database technology is approved for the mobile stack? | Tech Lead | Open |
| 2 | Which fields are classified as critical and require manual conflict review? | Product Owner | Open |
| 3 | Should sync run only automatically, or can technicians trigger manual sync? | Product Owner | Open |
| 4 | What is the maximum offline retention period before forced resync is required? | Security Architect | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
