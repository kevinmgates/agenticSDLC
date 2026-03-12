# Spec: Real-Time Parts Availability Check
**Feature ID:** FEAT-012  
**Epic:** EPIC-004 — Parts & Inventory Integration  
**Priority:** High  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature lets technicians and dispatchers check SAP S/4HANA inventory availability before a site visit. It reduces wasted trips by surfacing stock levels, warehouse availability, and pickup timing directly from work order context.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-027 | Check parts availability from work order view | 5 | High |
| US-028 | Display warehouse locations and pickup times | 3 | High |

---

## 3. Functional Behavior

### 3.1 Parts availability query
From a work order, the user can run a parts check that queries SAP inventory for all required parts. The result must show stock quantities and availability status per part.

### 3.2 Warehouse and pickup guidance
If stock exists in one or more warehouses, the response must include warehouse name, address, proximity, and estimated pickup timing. Results should be sorted by proximity to job site or technician.

### 3.3 Failure handling
If SAP is slow or unavailable, the request should time out after 10 seconds and present a graceful fallback message.

---

## 4. Data Model

### PartsAvailabilityResult
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| partNumber | string | Yes | SAP part identifier |
| description | string | Yes | Display name |
| quantityAvailable | decimal | Yes | On-hand quantity |
| availabilityState | string | Yes | Available, Limited, Unavailable |

### WarehouseOption
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| warehouseId | string | Yes | Warehouse key |
| warehouseName | string | Yes | Display name |
| address | string | Yes | Address |
| distanceMiles | decimal | No | Proximity |
| estimatedPickupTime | string | No | Human-readable estimate |

---

## 5. API Contracts

### POST /api/parts/availability-check
**Description:** Checks SAP inventory for required work order parts.

**Request:**
```json
{
  "workOrderId": "GUID",
  "parts": ["string"]
}
```

**Response (200):**
```json
{
  "items": [
    {
      "partNumber": "string",
      "availabilityState": "Available",
      "warehouses": []
    }
  ]
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 408 | SAP availability request timed out |
| 503 | SAP service unavailable |

---

## 6. UI/UX Behavior

- `Check Parts` action appears on work order detail.
- Results show color-coded availability indicators.
- Warehouse list sorted by proximity with optional map/deeplink.
- Error banner appears after timeout with fallback guidance.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| SAP S/4HANA inventory | Inbound | Parts check action | Part stock and warehouse data |
| Work order service | Inbound | Parts check action | Required parts list |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Query performance | < 5 seconds at 95th percentile | Feature DoD |
| Timeout | 10 seconds max | Graceful failure rule |
| Availability | Mobile and dispatcher contexts | Shared business capability |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Some parts available, some unavailable  
  **Expected behavior:** Show mixed results per part with warehouse options where available.  
  **User-facing message (if any):** None.
- **Scenario:** SAP timeout  
  **Expected behavior:** Abort request and display fallback guidance.  
  **User-facing message (if any):** "Parts availability could not be confirmed right now. Please call the warehouse."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a technician viewing a work order, when they tap 'Check Parts', then the system queries SAP and displays current stock levels for all required parts
- [ ] Given parts are available at a nearby warehouse, when the technician views results, then the warehouse location and estimated pickup time are shown
- [ ] Given the SAP API is slow or unavailable, when a parts check is initiated, then the system times out gracefully after 10 seconds and suggests the technician call the warehouse

---

## 11. Out of Scope

- Automatic pre-dispatch verification — covered by FEAT-013.
- Underlying SAP integration layer implementation — covered by FEAT-030.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Should proximity be based on job site, technician location, or configurable choice? | Product Owner | Open |
| 2 | Are warehouse operating hours available from SAP or another source? | IT Admin | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
