# Spec: Real-Time Technician Location Map
**Feature ID:** FEAT-010  
**Epic:** EPIC-003 — Scheduling, Dispatch & Fleet Tracking  
**Priority:** High  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature integrates FleetComplete location data into the dispatch experience so dispatchers can visualize active technicians on a map and make location-aware assignment decisions. It includes stale-data handling and graceful degradation when live GPS feeds are delayed or unavailable.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-023 | Display real-time technician locations on map | 5 | High |
| US-024 | Handle stale GPS data gracefully | 3 | High |

---

## 3. Functional Behavior

### 3.1 Map rendering
The dispatch board must offer a map toggle that displays active technician markers, names, and statuses. Marker positions should update within 30 seconds when vehicles are moving.

### 3.2 Stale data behavior
If GPS data is older than the stale threshold, the map must visually distinguish stale markers and show last update time. If FleetComplete is down, a banner indicates stale data and the system continues showing last known positions.

### 3.3 Performance at pilot scale
The map must render and update 40+ active technicians without material UI degradation.

---

## 4. Data Model

### TechnicianLocation
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| technicianId | GUID | Yes | Technician key |
| latitude | decimal | Yes | Current/last known latitude |
| longitude | decimal | Yes | Current/last known longitude |
| status | string | Yes | Available, Busy, Offline |
| lastUpdatedAtUtc | datetime | Yes | GPS timestamp |
| isStale | boolean | Yes | Derived state |

---

## 5. API Contracts

### GET /api/dispatch/locations
**Description:** Returns current technician locations for the map.

### GET /api/dispatch/locations/health
**Description:** Returns FleetComplete connectivity and freshness status.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 503 | FleetComplete unavailable |

---

## 6. UI/UX Behavior

- Map toggle from dispatch board.
- Marker tooltips show name, status, and last update time.
- Stale markers appear grayed out or otherwise distinguished.
- Outage banner appears above the map with last successful refresh time.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| FleetComplete | Inbound | Polling or stream refresh | GPS coordinates, timestamps |
| Dispatch board | Inbound | Toggle map view | Technician location layer |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Position freshness | Updates within 30 seconds | Feature acceptance criteria |
| Scale | 40+ simultaneous markers | Pilot requirement |
| Resilience | Show stale positions when live feed unavailable | Graceful degradation |

---

## 9. Edge Cases & Error Handling

- **Scenario:** GPS feed unavailable  
  **Expected behavior:** Show stale banner and last known positions.  
  **User-facing message (if any):** "Location data may be stale."
- **Scenario:** One technician missing updates for >5 minutes  
  **Expected behavior:** Mark only that technician as stale.  
  **User-facing message (if any):** Tooltip displays last update time.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a dispatcher viewing the dispatch board, when they toggle the map view, then all active technician locations are displayed with real-time GPS data from FleetComplete
- [ ] Given a technician's vehicle is moving, when the dispatcher views the map, then the technician's position updates within 30 seconds
- [ ] Given the FleetComplete API is unavailable, when a dispatcher views the map, then a notification indicates location data is stale and shows the last known positions

---

## 11. Out of Scope

- Route optimization logic beyond visualization.
- Technician mobile GPS capture.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which mapping provider is preferred for MVP? | Tech Lead | Open |
| 2 | What exact stale threshold should trigger degraded state? | Operations Lead | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
