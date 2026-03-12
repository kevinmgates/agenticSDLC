# Spec: Two-Level Approval Workflow
**Feature ID:** FEAT-007  
**Epic:** EPIC-002 — Work Order Management & Approval Workflow  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature implements the required supervisor and finance approval chain before work orders proceed to invoicing. It provides approval queues, approve/reject actions, audit trails, and state transitions that return rejected work orders to the appropriate prior stage. The business value is billing accuracy, quality control, and a formal digital replacement for informal review steps.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-016 | Supervisor approval of completed work orders | 5 | Critical |
| US-017 | Finance review and approval before invoicing | 5 | Critical |

---

## 3. Functional Behavior

### 3.1 Supervisor review queue
Completed technician work orders must enter a supervisor queue with all completion evidence, including notes, photos, and checklist summaries. Supervisors can approve or reject with comments.

### 3.2 Finance review queue
Once supervisor approved, the work order enters finance review with cost details, labor, and parts consumption. Finance can approve for invoicing or reject back to supervisor.

### 3.3 Workflow state management
The workflow must enforce these states: `CompletedByTechnician`, `SupervisorReview`, `FinanceReview`, `ReadyForInvoicing`, `RejectedToTechnician`, `RejectedToSupervisor`. Every transition must be timestamped and attributed to the acting user.

---

## 4. Data Model

### ApprovalRecord
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Parent work order |
| stage | string | Yes | Supervisor or Finance |
| decision | string | Yes | Approved, Rejected, Pending |
| comments | string | No | Reviewer comments |
| reviewedBy | GUID | No | Reviewer ID |
| reviewedAtUtc | datetime | No | Action timestamp |

### WorkflowState
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| workOrderId | GUID | Yes | Parent key |
| currentState | string | Yes | Current workflow state |
| previousState | string | No | Prior state |
| changedAtUtc | datetime | Yes | Transition time |
| changedBy | GUID | Yes | Actor |

---

## 5. API Contracts

### GET /api/approvals/supervisor-queue
**Description:** Returns supervisor pending approvals.

### POST /api/approvals/{workOrderId}/supervisor-decision
**Description:** Records supervisor approve/reject action.

### GET /api/approvals/finance-queue
**Description:** Returns finance pending reviews.

### POST /api/approvals/{workOrderId}/finance-decision
**Description:** Records finance approve/reject action.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 403 | Caller lacks correct review role |
| 409 | Work order is not in expected workflow state |

---

## 6. UI/UX Behavior

- Queue views show sortable columns and status tags.
- Rejection requires comments before submission.
- Review detail view shows evidence and prior comments.
- Confirmation banners appear after approve/reject actions.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Work order completion workflow | Inbound | Technician submission | Work order ready for review |
| Notifications | Outbound | Approval or rejection | In-app/Teams/email events |
| SAP invoicing process | Outbound | Finance approval | Ready-for-invoice signal |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Auditability | Full decision trail | Compliance and finance control |
| Security | Role-restricted review queues | RBAC required |
| Reliability | No skipped workflow stage | Core business rule |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Supervisor tries to approve already rejected item  
  **Expected behavior:** Reject stale action and refresh queue.  
  **User-facing message (if any):** "This work order has changed. Refresh and try again."
- **Scenario:** Finance rejects due to missing cost detail  
  **Expected behavior:** Return to supervisor stage with comments.  
  **User-facing message (if any):** Finance comment shown in workflow history.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a technician has submitted a completed work order, when the supervisor opens their approval queue, then the work order appears with all completion details for review
- [ ] Given a supervisor has approved a work order, when finance opens their review queue, then the work order appears with cost details and supervisor approval timestamp
- [ ] Given a reviewer rejects a work order, when the rejection is submitted with comments, then the work order is returned to the previous stage and the relevant party is notified

---

## 11. Out of Scope

- Customer notifications after approval.
- SAP invoice posting details beyond handoff signal.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Is finance rejection always routed back to supervisor rather than technician? | Product Owner | Open |
| 2 | Are SLA timers required for supervisor/finance review aging? | Operations Lead | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
