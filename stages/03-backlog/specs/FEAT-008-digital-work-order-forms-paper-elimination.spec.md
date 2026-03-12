# Spec: Digital Work Order Forms & Paper Elimination
**Feature ID:** FEAT-008  
**Epic:** EPIC-002 — Work Order Management & Approval Workflow  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature replaces legacy paper work order forms with digital equivalents that preserve every required field, familiar terminology, and validation rule. It ensures field technicians and dispatch users can enter complete data once and feed it directly into downstream approvals and invoicing without office re-entry. The feature reduces cycle time and adoption risk by mirroring the existing business form while modernizing validation.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-018 | Map legacy paper forms to digital equivalents | 3 | Critical |
| US-019 | Enforce required field validation on digital forms | 2 | Critical |

---

## 3. Functional Behavior

### 3.1 Paper-to-digital field mapping
All fields from current paper forms must be cataloged and represented in the digital form model. Labels and grouping should remain recognizable to technicians. No required paper field may be omitted from MVP digital forms.

### 3.2 Digital validation
Required and conditionally required fields must be enforced at entry and final submit. Inline errors must identify missing or invalid values before the record can proceed to approval.

### 3.3 Data flow continuity
Once the digital form is submitted, data must move directly into approval and invoicing-related processes without re-entry or translation by office staff.

---

## 4. Data Model

### DigitalFormField
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| formType | string | Yes | Work order type |
| paperFieldName | string | Yes | Legacy reference |
| digitalFieldKey | string | Yes | API/UI key |
| isRequired | boolean | Yes | Base required flag |
| conditionalRule | string | No | Dependency logic |

### DigitalFormSubmission
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Parent work order |
| values | json | Yes | Submitted field values |
| validationState | string | Yes | Valid, Invalid |
| submittedAtUtc | datetime | No | Set on final submit |

---

## 5. API Contracts

### GET /api/forms/work-order-types/{type}/definition
**Description:** Returns digital form definition and validation metadata.

### POST /api/forms/work-orders/{workOrderId}/validate
**Description:** Validates form values before save/submit.

### POST /api/forms/work-orders/{workOrderId}/submit
**Description:** Saves final form payload.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Validation failed |
| 404 | Form definition not found |

---

## 6. UI/UX Behavior

- Field groups align with existing paper sections.
- Required fields show clear markers.
- Conditional fields appear only when triggered.
- Inline validation appears near the field and summary errors appear on submit.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Legacy paper form mapping artifacts | Inbound | Form design | Field inventory and labels |
| Approval workflow | Outbound | Final form submit | Validated work order payload |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Completeness | 100% field parity with paper MVP forms | Core requirement |
| Validation | Immediate client-side feedback | Prevent incomplete submissions |
| Usability | Familiar terminology | Adoption support |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Conditional required field not triggered correctly  
  **Expected behavior:** Validation engine recalculates dependencies before submit.  
  **User-facing message (if any):** Field-specific error.
- **Scenario:** Legacy field has no approved digital equivalent  
  **Expected behavior:** Feature cannot be marked complete until mapping decision exists.  
  **User-facing message (if any):** N/A — build-time governance issue.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given the current paper work order form, when compared to the digital form, then all data fields from the paper version are present in the digital version
- [ ] Given a technician filling out a digital form, when they miss a required field, then the form highlights the missing field and prevents submission
- [ ] Given a completed digital form, when submitted, then the data flows directly to the approval workflow without manual re-entry

---

## 11. Out of Scope

- Approval workflow rules.
- Advanced analytics on form completion quality.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which paper form variants must be included in MVP? | Business Analyst | Open |
| 2 | Are any legacy free-text fields being intentionally standardized? | Product Owner | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
