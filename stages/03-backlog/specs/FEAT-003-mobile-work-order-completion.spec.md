# Spec: Mobile Work Order Completion
**Feature ID:** FEAT-003  
**Epic:** EPIC-001 — Mobile Field Technician Experience  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature allows field technicians to view assigned work orders, update required job information, and complete work orders directly from the mobile app. It replaces paper-based completion steps with a digital workflow that supports both online and offline work. The business value is faster work-order-to-invoice processing, better field accuracy, and elimination of manual back-office re-entry.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-007 | View assigned work orders on mobile | 5 | Critical |
| US-008 | Complete and submit work orders on mobile | 5 | Critical |

---

## 3. Functional Behavior

### 3.1 Assigned work order list and detail views
Technicians must be able to open the My Work Orders area and see all assigned work orders sorted by scheduled date and time. Each list item must show enough summary context to support field prioritization, including customer, site, status, due window, and data freshness when offline. Selecting a work order opens a detailed view with customer information, linked asset details, task instructions, required parts, and prior notes.

### 3.2 Work order editing and completion
The detail view must allow technicians to update all required completion fields, including labor details, notes, statuses, checklist references, and completion metadata. When the technician taps Submit, the app validates all required fields before changing the work order status to `Completed`. A successfully submitted work order enters the approval workflow.

Business rules:
- Required fields must block submission if incomplete.
- Work orders can be edited multiple times until final submission.
- Once submitted, technician editing is limited according to workflow state and permissions.

### 3.3 Offline completion behavior
If the user is offline, completed work orders must be stored locally, marked as pending sync, and clearly indicated as not yet uploaded. The user must still receive a confirmation that the work is saved on the device.

### 3.4 Submission confirmation and audit metadata
After submit, the user must see a confirmation summary with work order ID, completion timestamp, sync state, and next workflow step. The system must capture who submitted the work, from which device, and when.

---

## 4. Data Model

### MobileWorkOrder
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Work order identifier |
| technicianId | GUID | Yes | Assigned technician |
| customerId | GUID | Yes | Customer reference |
| assetId | GUID | No | Linked asset |
| status | string | Yes | Assigned, InProgress, Completed, PendingSync |
| scheduledStartUtc | datetime | No | Planned visit time |
| scheduledEndUtc | datetime | No | Planned completion time |
| dataFreshnessAtUtc | datetime | No | Last sync timestamp |

### WorkOrderCompletion
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| workOrderId | GUID | Yes | Parent work order |
| laborHours | decimal | No | Actual labor effort |
| completionNotes | string | No | Technician summary |
| completedAtUtc | datetime | Yes | Completion timestamp |
| completedBy | GUID | Yes | Technician ID |
| submissionState | string | Yes | Draft, Submitted, PendingSync |

### WorkOrderTask
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Parent work order |
| description | string | Yes | Task description |
| isRequired | boolean | Yes | Mandatory task flag |
| status | string | Yes | NotStarted, Complete |

Relationships:
- `MobileWorkOrder` has one `WorkOrderCompletion` draft/final submission.
- `MobileWorkOrder` has many `WorkOrderTask` records.

---

## 5. API Contracts

### GET /api/mobile/work-orders
**Description:** Returns assigned work orders for the authenticated technician.

**Request:**
```json
{
  "status": "string — optional filter",
  "fromDateUtc": "string — optional start date"
}
```

**Response (200):**
```json
{
  "items": [
    {
      "id": "GUID",
      "customerName": "string",
      "status": "Assigned",
      "scheduledStartUtc": "string",
      "dataFreshnessAtUtc": "string"
    }
  ]
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 | Unauthenticated request |
| 403 | Caller is not a technician |
| 500 | Query failure |

### GET /api/mobile/work-orders/{workOrderId}
**Description:** Returns full work order details for mobile execution.

**Request:**
```json
{}
```

**Response (200):**
```json
{
  "id": "GUID",
  "customer": {},
  "asset": {},
  "tasks": [],
  "requiredParts": [],
  "notes": []
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 403 | Work order not assigned to caller |
| 404 | Work order not found |

### POST /api/mobile/work-orders/{workOrderId}/submit
**Description:** Submits a completed work order to the approval workflow.

**Request:**
```json
{
  "laborHours": 3.5,
  "completionNotes": "string",
  "tasks": [
    {
      "id": "GUID",
      "status": "Complete"
    }
  ]
}
```

**Response (200):**
```json
{
  "workOrderId": "GUID",
  "status": "Completed",
  "workflowState": "SupervisorReview"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Required fields missing |
| 401 | Unauthenticated request |
| 409 | Work order already submitted |

---

## 6. UI/UX Behavior

- Work order list shows status, priority, customer, and schedule in a scannable mobile list.
- Detail screen groups information into sections: customer, asset, tasks, notes, parts.
- Completion form highlights missing required fields inline.
- Confirmation screen displays when submission succeeds or is saved offline.
- Offline state shows data freshness and pending sync badges.
- Tablet layout may display list and detail side by side.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Mobile offline store | Bidirectional | Load and save work order data | Work orders, completion drafts |
| Approval workflow backend | Outbound | Submit completion | Completed work order payload |
| Maximo-linked asset data | Inbound | Work order detail load | Asset context, if available |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Offline completion | Supported | Must work without connectivity |
| Validation | Client-side required-field enforcement | Prevent incomplete submission |
| Performance | Detail screen usable within 2 seconds after local load | Mobile usability baseline |
| Accessibility | WCAG 2.1 AA | Mobile forms and controls |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Technician opens a work order offline with stale data  
  **Expected behavior:** Show cached data and freshness timestamp.  
  **User-facing message (if any):** "You are viewing offline data from the last sync."
- **Scenario:** Submission attempted with missing required fields  
  **Expected behavior:** Block submission and focus missing fields.  
  **User-facing message (if any):** "Complete all required fields before submitting."
- **Scenario:** Work order was already completed elsewhere  
  **Expected behavior:** Prevent duplicate submission and refresh status.  
  **User-facing message (if any):** "This work order has already been submitted."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a technician with assigned work orders, when they open the My Work Orders screen, then they see a list of all assigned work orders sorted by scheduled date
- [ ] Given a work order in the list, when the technician taps it, then they see full details including customer info, asset info, tasks, and parts required
- [ ] Given the technician is offline, when they view assigned work orders, then all previously synced work orders display with a visual indicator showing the data freshness
- [ ] Given a technician on-site with an open work order, when they complete all required fields and tap Submit, then the work order status changes to Completed and enters the approval queue
- [ ] Given a technician attempts to submit an incomplete form, when required fields are missing, then the form highlights missing fields and prevents submission
- [ ] Given the technician is offline, when they submit a completed work order, then it is saved locally and marked for sync when connectivity is restored

---

## 11. Out of Scope

- Photo capture, digital signatures, and compliance checklists — covered by FEAT-004.
- Approval queue behavior — covered by FEAT-007.
- Offline sync engine internals — covered by FEAT-002.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which completion fields are mandatory by work order type? | Product Owner | Open |
| 2 | Can technicians edit submitted work orders before supervisor review starts? | Product Owner | Open |
| 3 | Should labor entry support multiple time segments or only total hours? | Business Analyst | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
