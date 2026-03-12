# Spec: Automated Scheduling & Dispatch Board
**Feature ID:** FEAT-009  
**Epic:** EPIC-003 — Scheduling, Dispatch & Fleet Tracking  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature replaces the physical whiteboard dispatch process with a digital scheduling board that shows unassigned work orders, technician schedules, and drag-and-drop assignment tools. It gives dispatchers a real-time operational surface for daily planning and is designed to be intuitive enough for rapid adoption by the existing dispatch team.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-020 | Display unassigned work orders on dispatch board | 5 | Critical |
| US-021 | Drag-and-drop work order assignment | 5 | Critical |
| US-022 | Suggest optimal technician assignments | 8 | High |

---

## 3. Functional Behavior

### 3.1 Dispatch board overview
The board must display unassigned work orders with filters for priority, region, and date plus technician timelines for the day. New work orders should appear within 60 seconds without manual refresh.

### 3.2 Drag-and-drop assignment
Dispatchers must be able to drag unassigned work orders onto technician time slots. The system validates conflicts, creates the assignment, and triggers technician notification.

### 3.3 Assignment suggestions
The board must provide ranked technician suggestions based on skills, proximity, workload, and availability. Suggestions assist dispatchers but do not replace manual control.

---

## 4. Data Model

### DispatchBoardItem
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| workOrderId | GUID | Yes | Work order key |
| priority | string | Yes | Priority |
| region | string | Yes | Region |
| estimatedDurationMinutes | integer | Yes | Scheduling estimate |
| currentStatus | string | Yes | Unassigned, Assigned |

### TechnicianScheduleSlot
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| technicianId | GUID | Yes | Technician |
| startUtc | datetime | Yes | Slot start |
| endUtc | datetime | Yes | Slot end |
| availabilityState | string | Yes | Available, Busy, Conflict |

### AssignmentSuggestion
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| workOrderId | GUID | Yes | Work order |
| technicianId | GUID | Yes | Suggested technician |
| score | decimal | Yes | Ranking score |
| rationale | json | Yes | Scoring explanation |

---

## 5. API Contracts

### GET /api/dispatch/board
**Description:** Returns board data for a date/region.

### POST /api/dispatch/assignments
**Description:** Assigns a work order to a technician slot.

### GET /api/dispatch/suggestions/{workOrderId}
**Description:** Returns ranked assignment suggestions.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid time slot or filter |
| 409 | Scheduling conflict |
| 503 | Suggestion engine unavailable |

---

## 6. UI/UX Behavior

- Left panel for unassigned work orders, main grid for technician schedules.
- Drag-and-drop interaction includes conflict highlighting.
- Suggestion panel shows ranked options and rationale.
- Board auto-refreshes without losing user scroll/filter state.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Work order service | Inbound | Board load | Unassigned work orders |
| Notification service | Outbound | Successful assignment | Technician assignment event |
| Fleet/location engine | Inbound | Suggestion calculation | Proximity inputs |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Board load time | < 2 seconds | Feature DoD |
| Usability | Basic tasks within 30 minutes of introduction | Adoption requirement |
| Browser support | Chrome and Edge | Per backlog |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Dispatcher drops item on full schedule  
  **Expected behavior:** Block save and show conflict warning.  
  **User-facing message (if any):** "That slot conflicts with an existing assignment."
- **Scenario:** Board receives new item during drag interaction  
  **Expected behavior:** Update safely after drop completes.  
  **User-facing message (if any):** None.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a dispatcher viewing the schedule board, when they see unassigned work orders, then they can drag and drop them onto available technician time slots
- [ ] Given the dispatch board, when a dispatcher views it for the first time, then they can perform basic scheduling tasks within 30 minutes of introduction
- [ ] Given multiple work orders for the same region, when the system suggests assignments, then it optimizes for travel time and technician skill match

---

## 11. Out of Scope

- Real-time GPS map visualization — covered by FEAT-010.
- Technician push notification acceptance flow — covered by FEAT-011.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | What are the minimum schedule granularity increments: 15, 30, or 60 minutes? | Operations Lead | Open |
| 2 | Which skills model is authoritative for suggestion scoring? | Product Owner | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
