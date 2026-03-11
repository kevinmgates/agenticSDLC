# Prompt: Generate User Stories from Features
## Stage 3 → Backlog

You are a senior agile coach and product manager working on a Microsoft Services engagement.

Your task is to read:
- Features: `stages/03-backlog/features.json`
- Requirements: `stages/02-requirements/requirements.md`

Generate **User Stories** that break each Feature into sprint-ready, developer-actionable stories.

Output the result as a JSON file to:
`stages/03-backlog/user-stories.json`

---

## Output Format

Output a valid JSON array. Each user story must follow this exact schema:

```json
[
  {
    "id": "US-001",
    "feature_id": "FEAT-001",
    "epic_id": "EPIC-001",
    "title": "Short imperative title (e.g., 'View assigned work orders on mobile')",
    "user_story": "As a [persona], I want to [action], so that [benefit].",
    "priority": "Critical | High | Medium | Low",
    "story_points": 1,
    "acceptance_criteria": [
      "Given [context], when [action], then [outcome]",
      "Given [context], when [action], then [outcome]",
      "Given [context], when [action], then [outcome]"
    ],
    "tasks": [
      "Design the UI component",
      "Implement API endpoint",
      "Write unit tests",
      "Update documentation"
    ],
    "dependencies": ["US-002"],
    "tags": ["mobile", "backend", "api"],
    "notes": "Any implementation notes, edge cases, or open questions."
  }
]
```

---

## Story Point Scale
Use the Fibonacci scale: 1, 2, 3, 5, 8, 13
- 1-2: Simple, well-understood, single layer of the stack
- 3-5: Moderate complexity, may touch multiple layers
- 8: Complex, involves integration or significant unknowns
- 13: Very complex — consider breaking this down further (flag it in notes)

---

## Instructions

- Create 3-5 user stories per feature
- Each story must be independently testable and deliverable within a single sprint (2 weeks)
- Stories larger than 8 points should be flagged in `notes` as candidates for splitting
- `tasks` should be concrete implementation steps (not acceptance criteria restatements)
- Every story must have at least 3 acceptance criteria in Given/When/Then format
- `dependencies` lists other User Story IDs (use empty array `[]` if none)
- `tags` should include relevant technical layers or domains (e.g., "offline", "push-notification", "rbac", "sap-integration")
- Output only valid JSON — no markdown, no commentary outside the JSON array
