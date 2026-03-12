# Spec: Asset Linkage with IBM Maximo
**Feature ID:** FEAT-006  
**Epic:** EPIC-002 — Work Order Management & Approval Workflow  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature links work orders to customer assets stored in IBM Maximo so dispatchers and technicians can identify the exact equipment under service. It provides Maximo-powered asset search during work order creation and surfaces maintenance history and specifications in mobile work order context. The feature improves first-time resolution by giving technicians accurate asset history before arriving on site.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-014 | Search and link Maximo assets to work orders | 5 | Critical |
| US-015 | View asset maintenance history from work orders | 3 | Critical |

---

## 3. Functional Behavior

### 3.1 Asset search and linkage
Dispatchers creating or editing a work order must be able to search Maximo by asset name, ID, or location. Search results must display key identifying attributes and allow selection of a single asset to link to the work order. If Maximo is unavailable, the dispatcher may still save the work order without an asset link.

### 3.2 Asset context in technician workflow
When a work order has a linked asset, technicians must be able to open an asset details view showing specifications, maintenance history, and relevant service context. Cached asset data should remain visible offline with a freshness timestamp.

### 3.3 Integration resilience
The integration layer must time out gracefully, log failures, and separate Maximo outages from core work order save behavior.

---

## 4. Data Model

### AssetReference
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Internal linkage record |
| workOrderId | GUID | Yes | Parent work order |
| maximoAssetId | string | Yes | External asset identifier |
| assetName | string | Yes | Display name |
| assetType | string | No | Equipment type |
| location | string | No | Asset location |
| linkedAtUtc | datetime | Yes | Link timestamp |

### AssetSnapshot
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| maximoAssetId | string | Yes | External key |
| specifications | json | No | Asset specs |
| maintenanceHistory | json | No | Prior service events |
| cachedAtUtc | datetime | Yes | Cache freshness |

Relationships: `AssetReference` belongs to one work order; `AssetSnapshot` is keyed by Maximo asset ID.

---

## 5. API Contracts

### GET /api/integrations/maximo/assets/search
**Description:** Searches Maximo for assets.

**Request:**
```json
{
  "query": "string",
  "customerId": "GUID"
}
```

**Response (200):**
```json
{
  "items": [
    {
      "maximoAssetId": "string",
      "assetName": "string",
      "assetType": "string",
      "location": "string"
    }
  ]
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 503 | Maximo unavailable |

### POST /api/work-orders/{workOrderId}/asset-link
**Description:** Links a Maximo asset to a work order.

**Request:**
```json
{
  "maximoAssetId": "string"
}
```

**Response (200):**
```json
{
  "linked": true
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 404 | Work order or asset not found |
| 409 | Work order already linked to conflicting asset |

---

## 6. UI/UX Behavior

- Dispatcher asset search uses type-ahead with key identifying columns.
- Linked assets are shown as chips/cards on the work order.
- Technician asset detail view emphasizes service history and specs.
- Offline indicator shows last refreshed time for cached Maximo data.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| IBM Maximo | Bidirectional | Search and detail retrieval | Asset IDs, specs, maintenance history |
| Mobile app | Inbound | Technician opens asset details | Cached asset snapshot |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Asset search response | < 3 seconds | Feature DoD |
| Availability | Work order save not blocked by Maximo outage | Graceful degradation |
| Offline cache | Last known asset view available | Field usability |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Maximo search times out  
  **Expected behavior:** Show graceful error, allow save without link.  
  **User-facing message (if any):** "Asset search is temporarily unavailable."
- **Scenario:** Linked asset has no maintenance history  
  **Expected behavior:** Display specs and explicit no-history message.  
  **User-facing message (if any):** "No prior maintenance history found."

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a dispatcher creating a work order, when they search for a customer asset, then matching assets from Maximo are displayed with key details
- [ ] Given a work order linked to a Maximo asset, when a technician views the work order, then they can see the asset's maintenance history and specifications
- [ ] Given the Maximo API is temporarily unavailable, when a user attempts to link an asset, then the system displays a graceful error and allows the work order to be saved without the link

---

## 11. Out of Scope

- Two-way Maximo maintenance updates back from mobile edits.
- Approval or finance workflow impacts.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which Maximo asset fields are mandatory in the search results? | Product Owner | Open |
| 2 | Should asset search be scoped by customer automatically? | Business Analyst | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
