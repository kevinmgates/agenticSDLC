# Spec: Sensitive Data Access Restriction
**Feature ID:** FEAT-023  
**Epic:** EPIC-007 — Identity, Security & Access Control  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature enforces fine-grained access control on sensitive customer contract data so that only Account Manager and higher roles can view pricing, terms, and related confidential information. It also logs both allowed and denied access attempts for audit and security review.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-051 | Restrict sensitive contract data by role | 3 | Critical |
| US-052 | Log all access attempts to restricted data | 3 | Critical |

---

## 3. Functional Behavior

### 3.1 Field-level and endpoint-level protection
Sensitive fields in customer profiles and contract views must be filtered or fully denied depending on caller role. Direct API access attempts must also be blocked.

### 3.2 Audit logging
Every access attempt to restricted resources must generate an audit record containing identity, resource, outcome, and timestamp.

### 3.3 Security reporting
Denied attempts should be marked for inclusion in daily security reporting and available to IT admins in searchable audit views.

---

## 4. Data Model

### SensitiveFieldPolicy
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| fieldKey | string | Yes | Protected field |
| minimumRole | string | Yes | Lowest role allowed |
| maskingMode | string | Yes | Hide or Mask |

### RestrictedAccessAudit
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| userId | string | Yes | Acting identity |
| resourceKey | string | Yes | Protected resource |
| outcome | string | Yes | Allowed or Denied |
| occurredAtUtc | datetime | Yes | Timestamp |
| details | json | No | Additional context |

---

## 5. API Contracts

### GET /api/contracts/{contractId}
**Description:** Returns contract view scoped by caller permissions.

### GET /api/security/restricted-access-audit
**Description:** Returns filtered audit log entries for IT admins.

---

## 6. UI/UX Behavior

- Unauthorized users should not see sensitive fields or affordances.
- Masked/hidden states must be consistent across list and detail views.
- IT admin audit view supports date/user/outcome filters.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| RBAC service | Inbound | Request evaluation | Effective role |
| Audit store | Outbound | Access attempt | Security audit event |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Enforcement | API and UI both restricted | Security requirement |
| Audit search | < 5 seconds | Story acceptance criteria |
| Integrity | Audit store tamper-resistant | Compliance need |

---

## 9. Edge Cases & Error Handling

- **Scenario:** User bookmarks old direct API route  
  **Expected behavior:** Return 403 and audit denied attempt.  
  **User-facing message (if any):** "You do not have permission to view this information."
- **Scenario:** Allowed user loses role mid-session  
  **Expected behavior:** Enforce on next request and stop data access immediately after claims refresh.  
  **User-facing message (if any):** Permission-denied message.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a user without Account Manager or higher role, when they attempt to access customer contract data, then the data is hidden and access is denied
- [ ] Given an Account Manager, when they view a customer profile, then contract details including pricing and terms are visible
- [ ] Given any attempt to access restricted data, when the attempt occurs, then it is logged with user identity and outcome (allowed/denied)

---

## 11. Out of Scope

- General role definition and Azure AD sync.
- Broader compliance document audit trails.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which roles count as above Account Manager for all restricted fields? | Security Architect | Open |
| 2 | Should some fields be masked rather than fully hidden for lower roles? | Product Owner | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
