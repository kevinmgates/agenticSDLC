# Spec: Role-Based Access Control Configuration
**Feature ID:** FEAT-022  
**Epic:** EPIC-007 — Identity, Security & Access Control  
**Priority:** Critical  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature defines and enforces platform RBAC using predefined roles and Azure AD group mappings. It restricts data and feature access by job function and provides an administrative configuration view for role definitions and effective assignments.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-049 | Configure predefined RBAC roles | 5 | Critical |
| US-050 | Sync role assignments with Azure AD groups | 3 | Critical |

---

## 3. Functional Behavior

### 3.1 Predefined roles
The platform must support at minimum `Technician`, `Dispatcher`, `Supervisor`, `Finance`, `Account Manager`, and `IT Admin` roles, each with explicit data and feature permissions.

### 3.2 API and UI enforcement
All protected API endpoints and module navigation must enforce role checks. Unauthorized operations return 403 and hidden UI controls should not imply access.

### 3.3 Azure AD group sync
Role assignment should derive from Azure AD security group membership and refresh on login and periodic sync intervals.

---

## 4. Data Model

### RoleDefinition
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| roleKey | string | Yes | Unique role |
| permissions | json | Yes | Feature/data permissions |
| sourceGroupId | string | No | Azure AD group link |

### UserRoleAssignment
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| userId | string | Yes | Azure AD user |
| roleKey | string | Yes | Assigned role |
| source | string | Yes | AzureADGroup or ManualOverride |
| syncedAtUtc | datetime | No | Last sync |

---

## 5. API Contracts

### GET /api/admin/rbac/roles
**Description:** Returns role definitions and permission matrix.

### GET /api/admin/rbac/assignments
**Description:** Returns effective role assignments with source group mapping.

### POST /api/admin/rbac/sync
**Description:** Triggers or reports Azure AD group synchronization.

---

## 6. UI/UX Behavior

- Admin view lists roles and mapped permissions.
- Assignment view shows effective role and source group.
- Unauthorized users do not see admin RBAC screens.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Azure AD groups | Inbound | Login/sync cycle | Group membership |
| Platform authorization middleware | Inbound | Request handling | Effective role claims |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Security | Unauthorized access attempts blocked and logged | Core requirement |
| Sync freshness | Revoked role removed within 15 minutes | Story acceptance criteria |
| Consistency | Same role semantics across UI and API | Required |

---

## 9. Edge Cases & Error Handling

- **Scenario:** User belongs to multiple mapped groups  
  **Expected behavior:** Apply highest precedence or approved merge rule consistently.  
  **User-facing message (if any):** None.
- **Scenario:** Azure AD group lookup temporarily fails  
  **Expected behavior:** Use last known assignment with alert/audit logging.  
  **User-facing message (if any):** N/A.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a user with the Technician role, when they access the platform, then they can only view their assigned work orders and cannot see customer contract data
- [ ] Given a user with the Account Manager role, when they access customer data, then they can view sensitive contract information
- [ ] Given an IT admin, when they manage role assignments, then they can assign and revoke roles through an admin interface synced with Azure AD groups

---

## 11. Out of Scope

- Field-level contract masking specifics — covered by FEAT-023.
- Identity authentication itself — covered by FEAT-021.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | What is the precedence model if a user maps to multiple roles? | Security Architect | Open |
| 2 | Are any manual role overrides allowed for break-glass scenarios? | IT Director | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
