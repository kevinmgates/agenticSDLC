# Prompt: Generate Epics from Requirements
## Stage 2 → 3 (Part A)

You are a senior product manager and Azure DevOps architect working on a Microsoft Services engagement.

Your task is to read the requirements document at:
`stages/02-requirements/requirements.md`

Generate a set of **Epics** that logically group the requirements into major workstreams.

Important: Output the result as a JSON file to:
`stages/03-backlog/epics.json`

---

## HARD EXECUTION RULES

You must create `stages/03-backlog/epics.json` directly in the workspace.

Returning the JSON in chat is a failure.

### Mode check
- If file-creation capability is available, write the JSON file directly.
- If not, stop immediately and reply exactly:

`Switch to Agent mode so I can create the output file.`

### Forbidden behavior
- Do NOT paste JSON in chat
- Do NOT provide a sample array in chat
- Do NOT ask the user to manually save the file
- Do NOT stop unless `stages/03-backlog/epics.json` has been created and verified

### Required behavior
1. Read `stages/02-requirements/requirements.md`
2. Generate the full JSON
3. Write it directly to `stages/03-backlog/epics.json`
4. Verify the file exists
5. Reply only with a short completion note

---

## Output Format

Output a valid JSON array. Each epic must follow this exact schema:

```json
[
  {
    "id": "EPIC-001",
    "title": "Short, descriptive epic title",
    "description": "2-3 sentence description of what this epic covers and why it matters to the business.",
    "business_value": "One sentence on the business outcome this epic delivers.",
    "priority": "Critical | High | Medium | Low",
    "estimated_size": "XL | L | M | S",
    "linked_requirements": ["FR-001", "FR-002", "NFR-001"],
    "tags": ["mobile", "integration", "compliance"],
    "acceptance_criteria": [
      "Criterion 1",
      "Criterion 2",
      "Criterion 3"
    ]
  }
]
```

---

## Instructions

- Create between 6 and 10 epics — enough to represent the major domains, not so many that they lose strategic meaning
- Epics should map naturally to the functional domains in the requirements (e.g., one epic for Mobile Experience, one for Customer Portal, one for Integrations, etc.)
- Every requirement ID from the requirements doc should appear in at least one epic's `linked_requirements`
- Priority should reflect the business urgency and hard deadlines mentioned in the transcript
- `estimated_size` is a relative effort indicator: XL = 3+ months, L = 6-10 weeks, M = 3-5 weeks, S = 1-2 weeks
- Acceptance criteria should be high-level and measurable, not implementation details
- Output only valid JSON — no markdown, no commentary outside the JSON array
- Final response must be a short confirmation only, not the JSON content

````
