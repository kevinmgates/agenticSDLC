# Spec: Compliance Document Capture & Storage
**Feature ID:** FEAT-024  
**Epic:** EPIC-008 — Compliance, Document Retention & Audit Trail  
**Priority:** High  
**Last Updated:** 2026-03-11  
**Status:** Draft

---

## 1. Overview

This feature securely stores photos, signatures, and checklist documents captured in the field with metadata tagging, encryption at rest, and immutable linkage to originating work orders. It operationalizes compliance storage requirements and US data residency constraints.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-053 | Store compliance documents with encryption and metadata | 5 | High |
| US-054 | Enforce US data residency for compliance storage | 2 | High |

---

## 3. Functional Behavior

### 3.1 Secure document ingestion
Uploaded compliance artifacts must be written to secure storage with metadata tags for work order, technician, timestamp, and document type.

### 3.2 Encryption and immutability
All stored artifacts must be encrypted at rest and protected from modification or deletion by non-admin users.

### 3.3 US data residency enforcement
The storage target must reside in approved US Azure regions only, and policy controls must block non-US deployments.

---

## 4. Data Model

### ComplianceDocument
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| workOrderId | GUID | Yes | Parent work order |
| documentType | string | Yes | Photo, Signature, Checklist |
| blobUri | string | Yes | Storage path |
| technicianId | GUID | Yes | Creator |
| createdAtUtc | datetime | Yes | Timestamp |
| region | string | Yes | Azure region |

---

## 5. API Contracts

### POST /api/compliance/documents
**Description:** Stores a compliance document and metadata.

### GET /api/compliance/documents/{documentId}
**Description:** Returns metadata and authorized access to the stored document.

---

## 6. UI/UX Behavior

- Mobile and web workflows should not expose storage implementation details.
- Admin/compliance views show metadata and immutability status.
- Upload success should confirm document is securely stored.

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| Mobile evidence capture | Inbound | Artifact sync/upload | Binary document + metadata |
| Azure Blob Storage | Outbound | Secure store | Blob content and tags |
| Azure Policy | Inbound | Resource deployment | Region compliance evaluation |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Data residency | US Azure regions only | Hard constraint |
| Encryption | Enabled at rest | Required |
| File size | Support photos up to 20 MB | DoD |

---

## 9. Edge Cases & Error Handling

- **Scenario:** Document upload succeeds but metadata tagging fails  
  **Expected behavior:** Treat as failed transaction and retry/compensate before exposing as complete.  
  **User-facing message (if any):** "Document upload is still being finalized."
- **Scenario:** Deployment attempted in non-US region  
  **Expected behavior:** Azure Policy denies deployment.  
  **User-facing message (if any):** N/A — administrative deployment error.

---

## 10. Acceptance Criteria (Consolidated)

- [ ] Given a technician submits a work order with compliance documents, when the documents are stored, then each document is encrypted at rest and tagged with work order ID, timestamp, and technician ID
- [ ] Given all customer data must reside in the US, when compliance documents are stored, then the storage account is verified to be in a US Azure region
- [ ] Given a compliance document is uploaded, when it is saved, then it is immutable and cannot be modified or deleted by non-admin users

---

## 11. Out of Scope

- Seven-year retention policies and searchable audit trail — covered by FEAT-025.
- Capture UX of photos and signatures — covered by FEAT-004.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Which admin roles are permitted to override immutability in exceptional cases? | Compliance Lead | Open |
| 2 | Are customer-facing downloads of compliance evidence in scope later? | Product Owner | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-03-11 | GitHub Copilot | Initial draft generated from backlog |
