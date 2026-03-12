# Prompt: Generate Specification from User Stories
## Stage 3.5 — Spec-Driven Development

You are a senior software architect working on a Microsoft Services engagement building a Field Service Management platform on Azure.

Your task is to read:
- A specific feature from `stages/03-backlog/features.json`
- All user stories for that feature from `stages/03-backlog/user-stories.json`
- The parent epic from `stages/03-backlog/epics.json`
- The requirements doc at `stages/02-requirements/requirements.md` for additional context

Generate a **Technical Specification** for the feature and its stories.

---

## HARD EXECUTION RULES

You are required to create the output file(s) directly in the workspace.

Returning the spec content in chat is a failure.

### Mode check
Before doing any detailed analysis or drafting any spec content:
- If file-creation capability is available, create the file(s) directly.
- If file-creation capability is **not** available, stop immediately and reply exactly:

`Switch to Agent mode so I can create the spec file(s).`

Do **not** draft the spec in chat first.

### Forbidden behavior
- Do **NOT** paste the spec into chat
- Do **NOT** provide a sample spec in chat
- Do **NOT** summarize the spec instead of writing the file
- Do **NOT** ask the user to manually create the file
- Do **NOT** stop after analysis if the file has not been created
- Do **NOT** reply with a section beginning with `# Spec:` in chat unless the user explicitly asks to view the generated file contents

### Required behavior
1. Read the required source files
2. Generate the full spec
3. Write it directly to:
   `stages/03-backlog/specs/{FEAT-ID}-{kebab-case-feature-title}.spec.md`
4. Verify the file exists by listing `stages/03-backlog/specs`
5. Reply only with a short confirmation and the created file path(s)

### Success criteria
The task is complete **only when**:
- the spec file(s) have been written to `stages/03-backlog/specs/`
- the folder listing confirms they exist
- the final response is a short completion note, not the spec content

---

## File Output Required

You MUST use file creation tools to create the spec directly at:

`stages/03-backlog/specs/{FEAT-ID}-{kebab-case-feature-title}.spec.md`

For example:
`stages/03-backlog/specs/FEAT-003-mobile-work-order-management.spec.md`

Use lowercase kebab-case for the feature title portion of the filename.

If a target file already exists, overwrite it with the newly generated version unless the user explicitly says not to.

If the user asks for **all features**, iterate through every feature in `stages/03-backlog/features.json` and create one file per feature before responding.
Do **not** stop after the first feature.
Do **not** ask for confirmation between features.
Do **not** return partial results unless an actual tool failure prevents continuation.

---

## Allowed Final Response Format

Allowed final responses are limited to:
- `Created: stages/03-backlog/specs/{filename}`
- a short bullet list of created files
- a short completion note confirming folder verification

Do **not** include spec body text in the final response.

---

## Output Format

Structure each generated spec exactly as follows:

---

```markdown
# Spec: {Feature Title}
**Feature ID:** FEAT-XXX  
**Epic:** EPIC-XXX — {Epic Title}  
**Priority:** {priority}  
**Last Updated:** {today's date}  
**Status:** Draft

---

## 1. Overview

One paragraph summarizing what this feature does, who it serves, and why it matters to the business. Written for a developer reading this for the first time.

---

## 2. User Stories Covered

| Story ID | Title | Story Points | Priority |
|----------|-------|-------------|----------|
| US-XXX | ... | X | High |

---

## 3. Functional Behavior

### 3.1 {Sub-area or user story group title}
Describe in detail what the system must do. Be specific — this section should leave no ambiguity for a developer or AI coding agent. Include:
- What the user sees and does
- What the system does in response
- State transitions (e.g., work order status changes)
- Business rules that must be enforced

Repeat section 3.x for each logical sub-area or story group.

---

## 4. Data Model

List the primary entities involved in this feature. For each:

### {EntityName}
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | GUID | Yes | Primary key |
| ... | ... | ... | ... |

Include any relationships between entities (one-to-many, etc.).

---

## 5. API Contracts

For each API endpoint this feature requires:

### {HTTP Method} {/path/to/endpoint}
**Description:** What this endpoint does

**Request:**
```json
{
  "field": "type — description"
}
```

**Response (200):**
```json
{
  "field": "type — description"
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Validation failed — describe what triggers this |
| 401 | Unauthenticated request |
| 403 | Insufficient permissions (RBAC) |
| 404 | Resource not found |

---

## 6. UI/UX Behavior

Describe the user interface behavior in enough detail for a frontend developer or AI agent to implement it:
- Screen or component name
- What data is displayed and how
- User interactions and what they trigger
- Loading, empty, and error states
- Offline behavior (if applicable)
- Responsive / mobile considerations

---

## 7. Integration Points

| System | Direction | Trigger | Data Exchanged |
|--------|-----------|---------|----------------|
| SAP S/4HANA | Outbound | Work order completion | Invoice line items |
| ... | ... | ... | ... |

---

## 8. Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Response time | < 2s for page loads | |
| Offline support | Full read + write with sync | |
| Data retention | 7 years for compliance docs | |
| RBAC | Role list: Technician, Dispatcher, Manager | |

---

## 9. Edge Cases & Error Handling

List every edge case and error condition that must be handled. For each:
- **Scenario:** What happens
- **Expected behavior:** How the system must respond
- **User-facing message (if any):** Exact text or description

---

## 10. Acceptance Criteria (Consolidated)

The full consolidated set of acceptance criteria across all stories in this feature, in Given/When/Then format. This is the authoritative list for QA.

- [ ] Given... When... Then...
- [ ] Given... When... Then...

---

## 11. Out of Scope

Explicitly list what this spec does NOT cover, to prevent scope creep. Reference Phase 2 items where relevant.

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | ... | TBD | Open |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | {today} | GitHub Copilot | Initial draft generated from backlog |
```

---

## Detailed Instructions

- Generate one spec per **feature** (not per story) — stories are consolidated into the spec
- Section 3 (Functional Behavior) and Section 5 (API Contracts) should be the most detailed sections — these are what a developer or AI coding agent will work from
- For the data model, infer reasonable field names and types based on the requirements and domain context (field service management)
- API contracts should follow RESTful conventions and use Azure API Management-compatible patterns
- RBAC roles referenced throughout should be consistent: `Technician`, `Dispatcher`, `Manager`, `Finance`, `IT Admin`, `Customer`
- If a section is not applicable to a particular feature (e.g., a reporting feature may have no offline requirements), write `N/A — {brief reason}` rather than omitting the section
- Flag any ambiguity or missing information in Section 12 (Open Questions) rather than inventing answers
- The spec should be detailed enough that a developer could implement the feature without needing to re-read the original transcript or requirements doc
- For bulk generation, create files in batches until all requested features are complete, then verify the final folder contents before replying
- After generating the spec(s), confirm the file(s) were written by listing the contents of `stages/03-backlog/specs`
```
