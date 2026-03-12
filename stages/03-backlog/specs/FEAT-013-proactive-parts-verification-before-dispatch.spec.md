# Spec: Proactive Parts Verification Before Dispatch
**Feature ID:** FEAT-013  
**Epic:** EPIC-004 — Parts & Inventory Integration  
**Priority:** High  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature automatically checks parts readiness during dispatch so the dispatcher can identify missing parts before a technician is sent on site. It adds a traffic-light readiness model, override controls, alternative part suggestions, and reschedule actions to reduce second visits caused by inventory issues.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-029 | Auto-verify parts before dispatch confirmation | 5 | High |
| US-030 | Alert dispatchers on parts unavailability | 3 | High |

---

## 3. Functional Behavior

### 3.1 Pre-dispatch parts check
When a dispatcher is about to confirm an assignment, the system automatically calls the parts availability service for required parts. The board displays a green/yellow/red readiness indicator.

### 3.2 Alerting and alternatives
If one or more parts are unavailable, the dispatcher sees alternative compatible parts or estimated restock dates where available. The work order is marked with a parts risk flag visible to downstream technician views.

### 3.3 Override and reschedule
Dispatchers may override warnings only by providing justification. Alternatively, they may return the work order to the queue with a `PartsPending` status.

---

## 4. Data Model

### PartsReadinessCheck
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Work order |
| readinessState | string | Yes | Green, Yellow, Red |
| checkedAtUtc | datetime | Yes | Check time |
| overrideReason | string | No | Required when overridden |

### PartsRiskFlag
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| workOrderId | GUID | Yes | Work order |
| riskState | string | Yes | Warning, Critical |
| details | json | No | Missing parts, restock dates |

---

## 5. API Contracts

### POST /api/dispatch/precheck-parts
**Description:** Runs automatic pre-dispatch parts verification.

### POST /api/dispatch/precheck-parts/{workOrderId}/override
**Description:** Records dispatcher override justification.

### POST /api/dispatch/precheck-parts/{workOrderId}/reschedule
**Description:** Returns work order to queue with parts-pending status.

---

## 6. UI/UX Behavior

- Dispatch board shows readiness color on candidate assignments.
- Alert panel lists unavailable parts and alternatives.
- Override requires mandatory text input.
- Technician mobile view shows parts risk badge when dispatched with warning.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| SAP inventory service | Inbound | Pre-dispatch check | Part availability and alternatives |
| Dispatch board | Bidirectional | Assignment confirmation | Readiness state and override actions |
| Mobile work order view | Outbound | Dispatch with warning | Parts risk flag |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Automatic check | Runs before dispatch confirmation | Core behavior |
| Explainability | Dispatcher sees reason for red/yellow state | Trust requirement |
| Auditability | Override justifications retained | Operational control |

---

## 9. Edge Cases & Error Handling

- **Scenario:** SAP check unavailable during dispatch  
  **Expected behavior:** Show yellow warning and allow justified override.  
  **User-facing message (if any):** "Parts readiness could not be verified."
- **Scenario:** Alternative part incompatible with customer contract  
  **Expected behavior:** Do not present as valid substitute.  
  **User-facing message (if any):** Contract-specific restriction in alert detail.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a dispatcher is about to assign a work order, when the system checks parts availability, then a green/yellow/red indicator shows parts readiness status
- [ ] Given required parts are unavailable, when the dispatcher views the alert, then alternative parts or estimated restock dates are suggested
- [ ] Given a work order has been dispatched with a parts warning, when the technician views the order, then the parts risk is clearly flagged

---

## 11. Out of Scope

- Manual parts ordering workflows.
- Underlying SAP inventory API modernization.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which work order types require hard stop vs override-able warnings? | Product Owner | Open |
| 2 | How should compatible substitute parts be curated and approved? | Operations Lead | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
