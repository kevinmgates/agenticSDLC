# Spec: On-Site Photo Capture & Digital Sign-Off
**Feature ID:** FEAT-004  
**Epic:** EPIC-001 — Mobile Field Technician Experience  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature enables technicians to capture on-site photos, collect customer digital signatures, and complete compliance checklists directly in the mobile workflow. It replaces paper artifacts and disconnected evidence capture with structured, auditable digital records tied to each work order. The feature matters because Contoso must capture site documentation for compliance and customer sign-off while technicians are in the field, often with inconsistent connectivity.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-009 | Capture and attach photos to work orders | 5 | Critical |
| US-010 | Collect digital signatures from customers | 3 | Critical |
| US-011 | Complete compliance checklists on mobile | 5 | Critical |

---

## 3. Functional Behavior

### 3.1 Photo capture and attachment
From a work order detail screen, a technician must be able to launch the device camera, capture one or more photos, preview them, and attach them to the current work order. Captured photos must be compressed according to platform rules, stored locally when offline, and prepared for sync. Multiple photos must appear in a scrollable gallery on the work order.

### 3.2 Digital signature capture
When the technician requests customer sign-off, the mobile app must open a touch-friendly signature pad. The customer signs directly on the device. On confirmation, the signature is stored as an image with timestamp, work order ID, and signer context. Signature capture must support phone and tablet touch surfaces.

### 3.3 Compliance checklist completion
If the work order includes compliance requirements, the technician must see a checklist tab or section listing all required items. Checklist types may include boolean items, text entry, and photo-required evidence. Mandatory checklist items must be completed before final work order submission.

### 3.4 Offline behavior and evidence integrity
All captured artifacts must be available offline after creation and persist until synced successfully. The app must not allow users to lose captured photos or signatures because of app backgrounding or network changes.

---

## 4. Data Model

### WorkOrderPhoto
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Parent work order |
| localPath | string | Yes | Device storage path |
| mimeType | string | Yes | JPEG/PNG |
| capturedAtUtc | datetime | Yes | Capture time |
| capturedBy | GUID | Yes | Technician ID |
| syncState | string | Yes | Pending, Synced, Failed |

### WorkOrderSignature
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Parent work order |
| imagePath | string | Yes | Stored signature image |
| signedAtUtc | datetime | Yes | Signature timestamp |
| signedByDisplayName | string | No | Optional captured customer name |
| syncState | string | Yes | Pending, Synced, Failed |

### ComplianceChecklistItem
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Parent work order |
| label | string | Yes | Checklist label |
| itemType | string | Yes | Checkbox, Text, PhotoRequired |
| isRequired | boolean | Yes | Submission rule |
| value | string | No | Stored response |
| status | string | Yes | NotStarted, Complete |

Relationships:
- `WorkOrderPhoto`, `WorkOrderSignature`, and `ComplianceChecklistItem` belong to one work order.

---

## 5. API Contracts

### POST /api/mobile/work-orders/{workOrderId}/photos
**Description:** Uploads a photo attachment for a work order.

**Request:**
```json
{
  "fileName": "string",
  "mimeType": "image/jpeg",
  "capturedAtUtc": "string",
  "contentBase64": "string"
}
```

**Response (200):**
```json
{
  "photoId": "GUID",
  "stored": true
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid file payload |
| 413 | File too large |
| 503 | Storage service unavailable |

### POST /api/mobile/work-orders/{workOrderId}/signature
**Description:** Stores customer digital sign-off.

**Request:**
```json
{
  "signedAtUtc": "string",
  "signerName": "string",
  "contentBase64": "string"
}
```

**Response (200):**
```json
{
  "signatureId": "GUID",
  "stored": true
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Signature missing or unreadable |
| 409 | Signature already exists and replacement not allowed |

### POST /api/mobile/work-orders/{workOrderId}/checklists/{checklistId}/complete
**Description:** Saves checklist responses.

**Request:**
```json
{
  "items": [
    {
      "id": "GUID",
      "value": "string",
      "status": "Complete"
    }
  ]
}
```

**Response (200):**
```json
{
  "saved": true,
  "allRequiredComplete": true
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Required checklist response missing |
| 404 | Checklist not found |

---

## 6. UI/UX Behavior

- Camera launch must be a clear action on the work order screen.
- Captured photos show thumbnail previews and support deletion before final submit if still local.
- Signature pad includes clear, retry, and confirm actions.
- Checklist items display mandatory indicators and validation errors inline.
- Offline indicators must reassure users that captured artifacts are safely stored.
- Tablet layouts should allow a wider signature area and better checklist readability.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Device camera APIs | Outbound | Photo capture action | Captured image stream |
| Local storage / sync engine | Bidirectional | Artifact save and upload | Photos, signatures, checklist payloads |
| Compliance document storage | Outbound | Successful upload | Structured evidence linked to work order |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Attachment size | Up to 20 MB per photo | From backlog notes |
| Offline support | Full artifact capture offline | Required for field use |
| Durability | No data loss after capture | Local persistence required |
| Accessibility | Signature and checklist flows usable on phone/tablet | Mobile UX requirement |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Camera permission denied  
  **Expected behavior:** Explain permission need and allow retry after settings update.  
  **User-facing message (if any):** "Camera access is required to capture photos."
- **Scenario:** User captures photo offline  
  **Expected behavior:** Save locally and mark pending sync.  
  **User-facing message (if any):** "Photo saved. It will sync when connected."
- **Scenario:** Signature pad confirmed without visible input  
  **Expected behavior:** Block confirmation.  
  **User-facing message (if any):** "Please capture a signature before continuing."
- **Scenario:** Required checklist items incomplete  
  **Expected behavior:** Prevent final submission.  
  **User-facing message (if any):** "Complete all required checklist items."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a technician on-site, when they tap the photo capture button, then the device camera opens and the photo is attached to the work order
- [ ] Given a completed job, when the technician requests a customer sign-off, then a digital signature pad is presented and the signature is stored with the work order
- [ ] Given a work order with compliance requirements, when the technician opens the checklist, then all required items are displayed and must be completed before submission
- [ ] Given multiple photos are needed, when the technician captures additional photos, then all photos are added to the work order as a scrollable gallery
- [ ] Given the technician is offline, when they capture photos or a signature or complete a checklist, then the artifacts are stored locally and synced when connectivity returns

---

## 11. Out of Scope

- Long-term retention policy and immutable compliance storage — covered by FEAT-024 and FEAT-025.
- Core work order submission flow — covered by FEAT-003.
- Mobile shell foundation — covered by FEAT-001.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Are there work order types that require minimum numbers of photos? | Product Owner | Open |
| 2 | Must customer printed name be captured in addition to signature image? | Business Analyst | Open |
| 3 | Which checklist templates are configurable at launch versus phase 2? | Product Owner | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
