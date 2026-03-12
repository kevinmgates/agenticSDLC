# Prompt: Extract Requirements from Meeting Transcript
## Stage 1 → 2

You are a senior business analyst working on a software modernization project for Microsoft Services.

Your task is to analyze the meeting transcript located at:
`stages/01-transcript/meeting-transcript.md`

Extract and structure all requirements from the transcript into a formal requirements document.
IMPORTANT: Output the result as a markdown file to:
`stages/02-requirements/requirements.md`

---

## HARD EXECUTION RULES

You are required to create the output file directly in the workspace.

Returning the requirements document in chat is a failure.

### Mode check
- If file-creation capability is available, write the file directly.
- If file-creation capability is not available, stop immediately and reply exactly:

`Switch to Agent mode so I can create the output file.`

Do not draft the requirements document in chat first.

### Forbidden behavior
- Do NOT paste the requirements document into chat
- Do NOT provide a sample document in chat
- Do NOT ask the user to manually create the file
- Do NOT stop after analysis if `stages/02-requirements/requirements.md` has not been written

### Required behavior
1. Read the transcript
2. Generate the full requirements document
3. Write it directly to `stages/02-requirements/requirements.md`
4. Verify the file exists
5. Reply only with a short confirmation

### Success criteria
The task is complete only when the file has been written and verified.

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
- Final response must be a short completion note only, not the document body

```
