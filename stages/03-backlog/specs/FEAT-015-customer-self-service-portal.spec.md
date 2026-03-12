# Spec: Customer Self-Service Portal
**Feature ID:** FEAT-015  
**Epic:** EPIC-005 — Customer Self-Service Portal & Notifications  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature delivers a browser-based customer portal where authenticated customers can view current and recent work orders without calling dispatch. It introduces a customer dashboard, real-time detail pages, and self-registration flow to close a major competitive gap identified during discovery.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-034 | Customer login and work order dashboard | 5 | Critical |
| US-035 | View real-time work order status details | 3 | Critical |
| US-036 | Customer self-registration flow | 3 | High |

---

## 3. Functional Behavior

### 3.1 Customer authentication and dashboard
Customers with approved credentials must sign in and see a dashboard containing active and recent work orders for their account only. Account scoping is mandatory.

### 3.2 Work order detail and timeline
Selecting a work order opens status details including current state, assigned technician, ETA, and milestone timeline. Updates should appear near-real-time.

### 3.3 Self-registration and approval
Visitors without accounts can submit a registration request with account identification. Admins approve or reject requests, and approved customers receive login instructions.

---

## 4. Data Model

### CustomerPortalUser
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Portal user |
| customerAccountId | GUID | Yes | Customer scope |
| email | string | Yes | Login identity |
| registrationState | string | Yes | Pending, Approved, Rejected |

### CustomerWorkOrderView
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| workOrderId | GUID | Yes | Work order |
| status | string | Yes | Current status |
| technicianName | string | No | Assigned tech |
| etaWindow | string | No | ETA/appointment window |
| lastUpdatedAtUtc | datetime | Yes | Status freshness |

---

## 5. API Contracts

### GET /api/customer-portal/dashboard
**Description:** Returns active/recent work orders for authenticated customer.

### GET /api/customer-portal/work-orders/{workOrderId}
**Description:** Returns detailed work order timeline and status.

### POST /api/customer-portal/registrations
**Description:** Submits self-registration request.

---

## 6. UI/UX Behavior

- Dashboard shows cards/table rows for active and recent work orders.
- Empty state explains there are no active requests and links to history.
- Detail page shows timeline events in chronological order.
- Registration form includes validation and success confirmation.
- Responsive design supports desktop and mobile browsers.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Customer identity provider | Bidirectional | Portal login | Authentication tokens |
| Work order service | Inbound | Dashboard/detail load | Customer-scoped work orders |
| Admin approval workflow | Outbound | Registration submitted | Pending registration request |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Browser support | Modern desktop/mobile browsers | Definition of done |
| Data isolation | Customer can only see own account data | Security-critical |
| Status freshness | Reflect changes within 2 minutes | Story acceptance criteria |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Customer has no active work orders  
  **Expected behavior:** Show empty state with history link.  
  **User-facing message (if any):** "You have no active work orders right now."
- **Scenario:** Registration account number cannot be matched  
  **Expected behavior:** Hold request for manual review or reject with clear guidance.  
  **User-facing message (if any):** "We could not verify that account information."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a customer with valid credentials, when they log into the portal, then they see a dashboard of all their active and recent work orders
- [ ] Given a work order is in progress, when the customer views its detail page, then the current status, assigned technician, and estimated completion time are displayed
- [ ] Given a customer without an account, when they visit the portal, then they can request access through a self-registration flow pending admin approval

---

## 11. Out of Scope

- Automated milestone notifications — covered by FEAT-016.
- Historical export/reporting — covered by FEAT-017.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which customer identity solution is preferred for external users? | IT Admin | Open |
| 2 | Who approves portal registrations operationally? | Product Owner | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
