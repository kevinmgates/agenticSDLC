# Spec: Work Order Creation & Multi-Trigger Support
**Feature ID:** FEAT-005  
**Epic:** EPIC-002 — Work Order Management & Approval Workflow  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature provides the primary entry points for creating work orders from dispatcher call intake, maintenance contract triggers, and future extensible trigger sources. It replaces ad hoc creation logic with a common creation service and ensures every new work order enters the dispatch flow with required metadata, trigger provenance, and validation. The feature is central to Contoso's digitized operating model because every downstream activity begins with a correctly created work order.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-012 | Create work orders from customer calls | 5 | Critical |
| US-013 | Auto-create work orders from maintenance contracts | 5 | Critical |

---

## 3. Functional Behavior

### 3.1 Manual call-based creation
Dispatchers must be able to create a work order from a call intake form capturing customer, contact, location, issue description, priority, and scheduling context. Selecting a known customer must auto-populate address and contact information from the customer system. Validation must prevent saving without all required fields.

### 3.2 Automated contract-triggered creation
A scheduled process must evaluate active maintenance contracts daily and create work orders when trigger criteria are met. Auto-created work orders must carry source metadata linking them to the contract and enter the dispatch queue automatically. If required data is missing, the work order is created in `Draft` and flagged for dispatcher review.

### 3.3 Extensible trigger architecture
The creation service must support new trigger sources without changing core work order creation behavior. Trigger adapters must normalize incoming data into a standard work order creation contract.

---

## 4. Data Model

### WorkOrder
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| customerId | GUID | Yes | Customer reference |
| locationId | GUID | Yes | Service site |
| title | string | Yes | Summary title |
| description | string | Yes | Issue description |
| priority | string | Yes | Priority classification |
| status | string | Yes | Draft, Unassigned, Assigned |
| triggerSource | string | Yes | ManualCall, Contract, FutureIoT |
| createdAtUtc | datetime | Yes | Creation time |

### WorkOrderTriggerMetadata
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Parent work order |
| sourceType | string | Yes | Trigger type |
| sourceReference | string | No | Contract ID or call reference |
| createdBy | string | No | Dispatcher or system account |
| validationState | string | Yes | Valid, NeedsReview |

Relationships: `WorkOrder` has one `WorkOrderTriggerMetadata`.

---

## 5. API Contracts

### POST /api/work-orders
**Description:** Creates a work order from a manual dispatcher request.

**Request:**
```json
{
  "customerId": "GUID",
  "locationId": "GUID",
  "description": "string",
  "priority": "Critical",
  "contactName": "string"
}
```

**Response (201):**
```json
{
  "id": "GUID",
  "status": "Unassigned",
  "triggerSource": "ManualCall"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Required field missing |
| 403 | Caller lacks dispatcher permissions |

### POST /api/work-orders/triggers/contracts/run
**Description:** Evaluates contract triggers and creates due work orders.

**Request:**
```json
{
  "asOfDate": "string — ISO date"
}
```

**Response (200):**
```json
{
  "createdCount": 5,
  "draftCount": 1
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 500 | Trigger evaluation failed |

---

## 6. UI/UX Behavior

- New work order form uses clear sections for customer, site, issue, and priority.
- Customer lookup supports fast search and auto-fill.
- Auto-created contract work orders show a visual tag indicating trigger source.
- Draft work orders needing review are highlighted in the queue.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| CRM/customer system | Inbound | Customer lookup | Customer and contact details |
| Contract scheduler | Inbound | Daily trigger evaluation | Contract trigger data |
| Dispatch queue | Outbound | Successful creation | New unassigned work order |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Extensibility | New trigger sources without core refactor | Key architectural requirement |
| Validation | Prevent incomplete manual submissions | Data quality |
| Reliability | Scheduled creation runs daily without duplicates | Contract automation |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Contract trigger missing required location data  
  **Expected behavior:** Create draft and alert dispatcher.  
  **User-facing message (if any):** "Contract-generated work order needs review."
- **Scenario:** Duplicate trigger fires twice  
  **Expected behavior:** Idempotency prevents duplicate work order creation.  
  **User-facing message (if any):** None.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a dispatcher receiving a customer call, when they enter work order details, then a new work order is created with all required fields populated
- [ ] Given an active maintenance contract with a scheduled trigger, when the trigger date arrives, then a work order is automatically created and assigned to the dispatch queue
- [ ] Given the system architecture, when a new trigger source is defined, then it can be added without modifying existing work order creation logic

---

## 11. Out of Scope

- Maximo asset linkage — covered by FEAT-006.
- Dispatch board assignment UX — covered by FEAT-009.
- Future IoT trigger implementation — phase 2.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which customer system is authoritative for auto-population? | IT Admin | Open |
| 2 | How should duplicate customer calls for same issue be detected? | Product Owner | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
