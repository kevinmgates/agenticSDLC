# Spec: Teams Work Order Interaction
**Feature ID:** FEAT-027  
**Epic:** EPIC-009 — Teams Integration & Technician Notifications  
**Priority:** High  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature allows technicians to open work order details and perform basic status actions directly inside Microsoft Teams using task modules and adaptive actions. It reduces context switching and increases adoption by supporting common field interactions without launching the dedicated mobile app.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-059 | View work order details in Teams task module | 5 | High |
| US-060 | Update work order status from within Teams | 5 | High |

---

## 3. Functional Behavior

### 3.1 Task module work order detail
Selecting `View Details` from a Teams notification opens a task module with work order summary, customer, asset, tasks, and attachments.

### 3.2 Teams-native actions
Technicians can Accept, Flag, or Mark En Route directly from Teams. Successful actions update backend state in real time.

### 3.3 Offline/degraded experience
If connectivity is unavailable, the Teams experience must indicate queued behavior where supported or show that the action cannot complete immediately.

---

## 4. Data Model

### TeamsWorkOrderContext
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| workOrderId | GUID | Yes | Work order |
| teamsUserId | string | Yes | Teams identity |
| actionState | string | Yes | ViewOnly, Actionable |
| lastLoadedAtUtc | datetime | Yes | Freshness |

---

## 5. API Contracts

### GET /api/integrations/teams/work-orders/{workOrderId}
**Description:** Returns work order content optimized for Teams task module.

### POST /api/integrations/teams/work-orders/{workOrderId}/actions
**Description:** Processes Teams action requests.

---

## 6. UI/UX Behavior

- Task module layout must be responsive on mobile Teams.
- Attachments display inline where feasible.
- Action buttons are prominent and update to confirmed state after success.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Microsoft Teams | Bidirectional | Task module open/action | Work order detail and action payloads |
| Platform work order service | Bidirectional | Teams action | Status updates |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Mobile Teams compatibility | iOS and Android clients | DoD |
| Real-time status update | Immediate backend sync when online | Acceptance criteria |
| No extra install | Works within Teams | Epic requirement |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Technician attempts action with no connectivity  
  **Expected behavior:** Queue if supported or inform user action is delayed.  
  **User-facing message (if any):** "This action will be processed when connectivity returns."
- **Scenario:** Work order was reassigned before task module action  
  **Expected behavior:** Prevent stale action and refresh view.  
  **User-facing message (if any):** "This work order assignment has changed."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a technician receives a work order notification in Teams, when they click 'View Details', then full work order information is displayed in a Teams task module
- [ ] Given a technician viewing a work order in Teams, when they tap 'Accept' or 'Mark En Route', then the work order status updates in the platform in real time
- [ ] Given a technician with no connectivity, when they attempt an action in Teams, then the action is queued and a message indicates it will be processed when connectivity returns

---

## 11. Out of Scope

- Full mobile app workflows like completion forms and photo capture.
- Teams notification delivery mechanics — covered by FEAT-026.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which attachments should render inline versus link out? | Product Owner | Open |
| 2 | Is queueing within Teams technically required or should actions fail fast offline? | Tech Lead | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
