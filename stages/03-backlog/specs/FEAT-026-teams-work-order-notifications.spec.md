# Spec: Teams Work Order Notifications
**Feature ID:** FEAT-026  
**Epic:** EPIC-009 — Teams Integration & Technician Notifications  
**Priority:** High  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature sends adaptive card work order notifications into Microsoft Teams for technicians and supervisors. It extends platform communication into an application already heavily used by field staff, supporting faster adoption and more responsive approvals.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-057 | Send adaptive card notifications in Teams | 5 | High |
| US-058 | Deliver approval request notifications via Teams | 3 | High |

---

## 3. Functional Behavior

### 3.1 New assignment notifications
Technicians receive adaptive cards containing work order summary, customer, location, priority, and schedule.

### 3.2 Approval request cards
Supervisors receive adaptive cards with approve/reject actions when work orders enter approval.

### 3.3 Cross-client rendering
Adaptive cards must render correctly in desktop, iOS, and Android Teams clients.

---

## 4. Data Model

### TeamsNotification
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| recipientUserId | string | Yes | Teams/AAD user |
| notificationType | string | Yes | Assignment or Approval |
| cardPayload | json | Yes | Adaptive card body |
| sentAtUtc | datetime | No | Delivery time |

---

## 5. API Contracts

### POST /api/integrations/teams/notify
**Description:** Sends adaptive card notification to Teams.

### POST /api/integrations/teams/actions/approval
**Description:** Handles approval card action callbacks.

---

## 6. UI/UX Behavior

- Cards must be readable on small mobile screens.
- Actions should provide immediate confirmation state after use.
- Notification content should be concise with clear CTA labels.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Microsoft Teams / Bot Framework | Bidirectional | Assignment/approval events | Adaptive cards and action callbacks |
| Work order workflow | Inbound | Approval actions | State transition results |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Delivery latency | < 60 seconds | DoD |
| Client compatibility | Desktop, iOS, Android Teams | DoD |
| Security | Action callbacks validated against identity context | Required |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Card action submitted after work order state changed  
  **Expected behavior:** Reject stale action and return updated state.  
  **User-facing message (if any):** "This request has already been updated."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a technician is assigned a new work order, when the assignment is saved, then they receive a Teams notification with an adaptive card showing work order summary
- [ ] Given a supervisor has a pending approval, when the work order enters the approval queue, then they receive a Teams notification with approve/reject action buttons
- [ ] Given a technician is using Teams on iOS or Android, when they receive a notification, then the adaptive card renders correctly on the mobile Teams client

---

## 11. Out of Scope

- Full work order detail interaction inside Teams — covered by FEAT-027.
- Generic push notification flows to the native app.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Should notifications target personal chat, channel, or both? | Product Owner | Open |
| 2 | Are finance approval notifications also required in Teams for MVP? | Operations Lead | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
