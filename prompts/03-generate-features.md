# Prompt: Generate Features from Epics and Requirements
## Stage 2 → 3 (Part B)

You are a senior product manager working on a Microsoft Services engagement.

Your task is to read:
- Requirements: `stages/02-requirements/requirements.md`
- Epics: `stages/03-backlog/epics.json`

Generate **Features** that decompose each Epic into shippable, meaningful chunks of functionality.

Output the result as a JSON file to:
`stages/03-backlog/features.json`

---

## Output Format

Output a valid JSON array. Each feature must follow this exact schema:

```json
[
  {
    "id": "FEAT-001",
    "epic_id": "EPIC-001",
    "title": "Short, descriptive feature title",
    "description": "2-3 sentence description of what this feature delivers to the end user.",
    "user_persona": "Field Technician | Dispatcher | Customer | IT Admin | Finance | Manager",
    "priority": "Critical | High | Medium | Low",
    "estimated_size": "L | M | S | XS",
    "linked_requirements": ["FR-001", "FR-002"],
    "dependencies": ["FEAT-002"],
    "acceptance_criteria": [
      "Given [context], when [action], then [outcome]",
      "Given [context], when [action], then [outcome]"
    ],
    "definition_of_done": [
      "Unit tests written and passing",
      "Accessibility requirements met",
      "Reviewed by product owner"
    ]
  }
]
```

---

## Instructions

- Create 3-6 features per epic (adjust based on epic size — XL epics may have more)
- Features should represent a shippable increment — something that could go through a sprint or two
- Each feature belongs to exactly one epic (`epic_id` must match an ID from `epics.json`)
- `user_persona` should reflect who primarily benefits from this feature
- `dependencies` should list other Feature IDs that must be completed first (use empty array `[]` if none)
- Acceptance criteria must use Given/When/Then format
- `definition_of_done` should include standard quality gates relevant to this type of feature
- Output only valid JSON — no markdown, no commentary outside the JSON array
