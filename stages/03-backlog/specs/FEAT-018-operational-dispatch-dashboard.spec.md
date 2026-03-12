# Spec: Operational Dispatch Dashboard
**Feature ID:** FEAT-018  
**Epic:** EPIC-006 — Reporting, Analytics & Dashboards  
**Priority:** High  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature provides dispatchers with a real-time operational dashboard showing the current day's workload, utilization, overdue jobs, and drill-through navigation. It supplies the operational visibility missing in the current process and complements the dispatch board with summarized metrics.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-041 | Display real-time job status metrics on dispatch dashboard | 5 | High |
| US-042 | Drill down from dashboard metrics to work order lists | 3 | High |

---

## 3. Functional Behavior

### 3.1 Real-time KPI tiles
The dashboard must display counts for active, completed, unassigned, and overdue work orders for the selected date. Metrics auto-refresh on the configured interval.

### 3.2 Drill-down navigation
Selecting any metric tile opens a filtered list of the underlying work orders. Returning to dashboard preserves prior date/filter state.

---

## 4. Data Model

### DispatchMetricSnapshot
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| snapshotAtUtc | datetime | Yes | Snapshot time |
| activeCount | integer | Yes | Current active jobs |
| completedCount | integer | Yes | Completed jobs |
| unassignedCount | integer | Yes | Unassigned jobs |
| overdueCount | integer | Yes | Overdue jobs |

---

## 5. API Contracts

### GET /api/analytics/dispatch-dashboard
**Description:** Returns dispatch KPI tile values.

### GET /api/analytics/dispatch-dashboard/drilldown
**Description:** Returns work orders behind selected metric.

---

## 6. UI/UX Behavior

- Tile-based layout with configurable refresh interval.
- Date filter for today and historical daily views.
- Drill-down list uses same sort/filter language as dispatch workflows.
- Back navigation restores dashboard state.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Work order analytics store | Inbound | Dashboard load | Aggregated metrics |
| Work order service | Inbound | Drill-down | Filtered job list |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Dashboard load | < 3 seconds | Feature DoD |
| Auto-refresh | Default 60 seconds | Configurable |
| Volume | 200+ active work orders | Realistic load target |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Auto-refresh returns partial data  
  **Expected behavior:** Keep prior snapshot and surface refresh warning.  
  **User-facing message (if any):** "Dashboard refresh is temporarily delayed."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a dispatcher opens the dashboard, when the page loads, then they see real-time counts of active, completed, and unassigned work orders for the current day
- [ ] Given work orders are being completed in the field, when the dashboard auto-refreshes, then the status updates appear within 60 seconds
- [ ] Given a dispatcher wants to drill down, when they click a metric tile, then they are taken to the relevant filtered list of work orders

---

## 11. Out of Scope

- Executive KPI analytics.
- IT health monitoring.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Should dispatchers be able to customize tile order and thresholds? | Product Owner | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
