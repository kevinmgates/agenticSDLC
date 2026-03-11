# Prompt: Extract Requirements from Meeting Transcript
## Stage 1 → 2

You are a senior business analyst working on a software modernization project for Microsoft Services.

Your task is to analyze the meeting transcript located at:
`stages/01-transcript/meeting-transcript.md`

Extract and structure all requirements from the transcript into a formal requirements document.
IMPORTANT: Output the result as a markdown file to:
`stages/02-requirements/requirements.md`

---

## Output Format

Structure the requirements document exactly as follows:

### 1. Project Overview
- Customer name, project name, key stakeholders
- Business drivers and urgency
- Timeline and constraints

### 2. Functional Requirements
Group by domain (e.g., Work Order Management, Scheduling & Dispatch, Mobile, Customer Portal, Integrations, Reporting, Notifications, Compliance). For each requirement:
- Assign a unique ID: `FR-001`, `FR-002`, etc.
- Write a clear, testable requirement statement
- Note the priority: **Must Have**, **Should Have**, **Nice to Have**
- Note the source quote or context from the transcript

### 3. Non-Functional Requirements
- Performance, scalability, availability
- Security and compliance
- Data residency
- Offline capability
- Assign IDs: `NFR-001`, `NFR-002`, etc.

### 4. Integration Requirements
- List each system to integrate with
- Note integration type (read, write, bidirectional, event-driven)
- Note any known constraints
- Assign IDs: `INT-001`, `INT-002`, etc.

### 5. Constraints & Assumptions
- Hard deadlines
- Budget and licensing considerations
- Technology decisions already made
- Assumptions made where the transcript was ambiguous

### 6. Out of Scope / Phase 2
- Items explicitly deferred or flagged as future state

---

## Instructions
- Be thorough — do not omit requirements that were mentioned even briefly
- Where the transcript implies a requirement without stating it explicitly, include it and mark it as *[Implied]*
- Use professional, precise language suitable for a formal requirements document
- Do not invent requirements that are not grounded in the transcript
