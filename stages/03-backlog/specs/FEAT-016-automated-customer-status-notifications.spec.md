# Spec: Automated Customer Status Notifications
**Feature ID:** FEAT-016  
**Epic:** EPIC-005 — Customer Self-Service Portal & Notifications  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature sends customers automated notifications at major work order milestones using email and SMS according to customer preferences. It reduces dispatcher call volume and improves customer transparency at key service moments such as dispatch, en route, and completion.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-037 | Send milestone notifications to customers | 5 | Critical |
| US-038 | Configure customer notification preferences | 2 | High |

---

## 3. Functional Behavior

### 3.1 Milestone event publishing
The platform must emit notification events for dispatch confirmed, technician en route, work started, and work completed. Notification content must include customer-safe data only.

### 3.2 Channel preference routing
Customers must be able to choose email, SMS, both, or unsubscribe. The notification service must route per preference at send time.

### 3.3 Delivery timing and auditability
Milestone notifications must be delivered within 2 minutes of the underlying event. Delivery attempts and outcomes must be logged.

---

## 4. Data Model

### CustomerNotificationPreference
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| customerAccountId | GUID | Yes | Customer account |
| emailEnabled | boolean | Yes | Email channel |
| smsEnabled | boolean | Yes | SMS channel |
| unsubscribed | boolean | Yes | Global opt-out |
| updatedAtUtc | datetime | Yes | Last change |

### NotificationDelivery
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Related work order |
| milestone | string | Yes | Dispatched, EnRoute, Started, Completed |
| channel | string | Yes | Email or SMS |
| deliveryState | string | Yes | Pending, Sent, Failed |
| sentAtUtc | datetime | No | Send time |

---

## 5. API Contracts

### POST /api/customer-notifications/events
**Description:** Accepts work order milestone event for delivery.

### GET /api/customer-portal/notification-preferences
**Description:** Returns current customer preferences.

### PUT /api/customer-portal/notification-preferences
**Description:** Updates customer delivery preferences.

---

## 6. UI/UX Behavior

- Portal settings page exposes simple channel toggles.
- Unsubscribe is explicit and reversible.
- Notification previews may be shown where practical.
- Delivery failures are logged admin-side, not exposed directly to customers unless required.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Work order event stream | Inbound | Milestone reached | Notification event payload |
| Email provider | Outbound | Channel send | Email message |
| SMS provider | Outbound | Channel send | SMS message |
| Customer portal | Bidirectional | Preference change | Preference settings |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Delivery SLA | Within 2 minutes | Acceptance criteria |
| Channel support | Email and SMS | DoD |
| Compliance | Respect unsubscribe and customer preferences | Required |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Customer has unsubscribed  
  **Expected behavior:** No message is sent for any milestone.  
  **User-facing message (if any):** Preference page reflects opt-out state.
- **Scenario:** SMS provider fails  
  **Expected behavior:** Log failed delivery, optionally fall back only if customer allowed both channels and rule permits.  
  **User-facing message (if any):** None.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a technician is dispatched to a job, when the assignment is confirmed, then the customer receives a notification with the technician's name and estimated arrival window
- [ ] Given a technician marks a job as complete, when the status updates, then the customer receives a completion notification with a summary of work performed
- [ ] Given a customer's notification preferences, when a milestone is reached, then the notification is sent via the customer's preferred channel (email or SMS)

---

## 11. Out of Scope

- Portal dashboard and work order views — covered by FEAT-015.
- Historical reporting/export of notifications.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Are legal opt-in/consent workflows required for SMS? | Compliance Lead | Open |
| 2 | Should failed SMS automatically retry by email when both channels are enabled? | Product Owner | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
