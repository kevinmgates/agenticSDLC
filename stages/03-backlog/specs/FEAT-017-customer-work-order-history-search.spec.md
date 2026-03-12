# Spec: Customer Work Order History & Search
**Feature ID:** FEAT-017  
**Epic:** EPIC-005 — Customer Self-Service Portal & Notifications  
**Priority:** High  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature gives customers searchable access to historical work orders with filters, pagination, and export capability. It supports self-service reporting and reduces customer dependence on dispatch for past service information.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-039 | Search and filter historical work orders | 3 | High |
| US-040 | Export work order reports | 3 | High |

---

## 3. Functional Behavior

### 3.1 Search and filter
Customers must be able to filter historical work orders by date range, asset, status, and technician. Filters are server-side and paginated for large result sets.

### 3.2 Export
Filtered results can be exported as CSV or PDF. Exported reports must match the currently scoped result set and complete within 10 seconds for large but supported datasets.

---

## 4. Data Model

### CustomerHistoryQuery
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| customerAccountId | GUID | Yes | Scope |
| fromDate | date | No | Filter |
| toDate | date | No | Filter |
| assetId | GUID | No | Filter |
| status | string | No | Filter |
| technicianId | GUID | No | Filter |

### ExportRequest
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| format | string | Yes | CSV or PDF |
| query | json | Yes | Applied filter set |
| createdAtUtc | datetime | Yes | Requested time |

---

## 5. API Contracts

### GET /api/customer-portal/history
**Description:** Returns paged historical work orders.

### POST /api/customer-portal/history/export
**Description:** Generates export for filtered history.

---

## 6. UI/UX Behavior

- History page includes filter drawer/panel and result table.
- Export buttons reflect current filter selection.
- Empty results state is explicit and does not clear filters automatically.
- Large export actions show progress or download-ready confirmation.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Customer portal | Bidirectional | Search and export actions | Filtered result set |
| Reporting/export service | Outbound | Export action | CSV/PDF payload |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Search performance | < 3 seconds | Acceptance criteria |
| Large dataset support | 1000+ work orders/customer | DoD |
| Export performance | < 10 seconds for supported volume | Story acceptance criteria |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Query returns no rows  
  **Expected behavior:** Show empty state with retained filters.  
  **User-facing message (if any):** "No work orders match your filters."
- **Scenario:** Export request exceeds supported limit  
  **Expected behavior:** Queue job or request narrower filter.  
  **User-facing message (if any):** "Please narrow your filters before exporting."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a customer on the portal, when they navigate to the history section, then they can filter work orders by date range, asset, and status
- [ ] Given search results are displayed, when the customer clicks export, then a CSV or PDF report is downloaded
- [ ] Given a customer has hundreds of work orders, when they search, then results load within 3 seconds

---

## 11. Out of Scope

- Live work order notifications.
- Internal operational analytics.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | What columns are mandatory in CSV/PDF exports? | Product Owner | Open |
| 2 | Should exports include closed-only records older than a retention threshold? | Compliance Lead | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
