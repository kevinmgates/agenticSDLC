# Spec: Technician Notification & Job Acceptance
**Feature ID:** FEAT-011  
**Epic:** EPIC-003 — Scheduling, Dispatch & Fleet Tracking  
**Priority:** High  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature notifies technicians when new work orders are assigned and allows them to accept or flag those assignments from the mobile app. It closes the loop between dispatch decisions and technician acknowledgment, reducing ambiguity and enabling fast reassignment when field constraints prevent acceptance.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-025 | Send push notifications for new assignments | 5 | High |
| US-026 | Accept or flag work order assignments | 3 | High |

---

## 3. Functional Behavior

### 3.1 Assignment notifications
When a dispatcher assigns a work order, the platform must send a push notification to the technician within 60 seconds. The notification deep-links into the mobile app and opens the relevant work order details.

### 3.2 Accept and flag actions
From the detail view, the technician can accept the assignment or flag it with a reason. Acceptance updates status to `Accepted`. Flagging returns the work order to the unassigned queue and notifies dispatch.

### 3.3 Delivery reliability
Notifications missed while the device is offline must be delivered or recovered on reconnect, and the app must reconcile assignment state on launch.

---

## 4. Data Model

### AssignmentNotification
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Related work order |
| technicianId | GUID | Yes | Target technician |
| sentAtUtc | datetime | No | Delivery attempt time |
| deliveryState | string | Yes | Pending, Sent, Failed |

### AssignmentResponse
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Work order |
| response | string | Yes | Accepted, Flagged |
| reason | string | No | Required for Flagged |
| respondedAtUtc | datetime | Yes | Response time |

---

## 5. API Contracts

### POST /api/notifications/assignments
**Description:** Sends mobile push notification for an assignment.

### POST /api/work-orders/{workOrderId}/accept
**Description:** Accepts an assignment.

### POST /api/work-orders/{workOrderId}/flag
**Description:** Flags an assignment and returns it to queue.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Missing flag reason |
| 409 | Assignment no longer in actionable state |

---

## 6. UI/UX Behavior

- Push notification includes work order summary and deep link.
- Work order detail shows prominent Accept and Flag actions.
- Flag action opens a reason dialog.
- Success states confirm dispatch has been updated.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Push notification provider | Outbound | Assignment save | Device token, notification payload |
| Dispatch queue | Bidirectional | Flag or accept action | Assignment state update |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Notification latency | Within 60 seconds | Acceptance criteria |
| Mobile support | iOS and Android | Feature DoD |
| Reliability | Recover missed notifications after reconnect | Offline-to-online support |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Technician taps stale notification for reassigned job  
  **Expected behavior:** Open current work order state and disable stale actions.  
  **User-facing message (if any):** "This assignment has changed."
- **Scenario:** Technician flags without reason  
  **Expected behavior:** Block submission.  
  **User-facing message (if any):** "Please provide a reason for flagging this assignment."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a dispatcher assigns a work order to a technician, when the assignment is saved, then the technician receives a push notification within 60 seconds
- [ ] Given a technician receives an assignment notification, when they tap it, then the work order details are displayed with Accept and Flag options
- [ ] Given a technician flags an assignment, when they provide a reason, then the dispatcher is notified and the work order returns to the unassigned queue

---

## 11. Out of Scope

- Teams-based notification experiences — covered by FEAT-026 and FEAT-027.
- Dispatch board creation of assignments — covered by FEAT-009.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Are reminder notifications required if no response is received? | Product Owner | Open |
| 2 | Which reasons should be preconfigured in the flag dialog? | Operations Lead | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
