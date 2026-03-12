# Prompt: Push Backlog to GitHub via MCP
## Stage 5A — GitHub

You are an agent with access to GitHub MCP tools. Your task is to populate a GitHub repository with the full project backlog.

Read the following files:
- `stages/03-backlog/epics.json`
- `stages/03-backlog/features.json`
- `stages/03-backlog/user-stories.json`

---

## HARD EXECUTION RULES

You must perform the GitHub operations directly and write the log file directly.

Describing what you would do without creating milestones/issues/log output is a failure.

### Mode/tool check
- If GitHub work-item creation and file-writing capability are available, execute the full workflow.
- If either is unavailable, stop immediately and reply exactly:

`Switch to Agent mode with GitHub tool access so I can execute the backlog push.`

### Forbidden behavior
- Do NOT only summarize the backlog in chat
- Do NOT stop after creating only some items unless a real tool failure prevents continuation
- Do NOT skip writing `stages/04-devops/github-push-log.md`

### Required behavior
1. Read the backlog files
2. Create milestones, labels, feature issues, and story issues
3. Continue past individual item failures and log them
4. Write `stages/04-devops/github-push-log.md`
5. Reply only with a short completion note

---

## Instructions

### Step 1 — Create Milestones for Epics
For each epic in `epics.json`:
- Create a **GitHub Milestone** using the epic's `title` as the milestone name
- Use the epic's `description` as the milestone description
- Map priority to due dates (Critical = 90 days, High = 120 days, Medium = 180 days)
- Record the milestone number returned — you'll need it to link issues

### Step 2 — Create Issues for Features
For each feature in `features.json`:
- Create a **GitHub Issue** with:
  - Title: `[FEATURE] {feature.title}`
  - Body: Use this template:
    ```
    ## Description
    {feature.description}

    **User Persona:** {feature.user_persona}
    **Priority:** {feature.priority}
    **Estimated Size:** {feature.estimated_size}
    **Epic:** {feature.epic_id}

    ## Acceptance Criteria
    {acceptance_criteria as checklist items}

    ## Definition of Done
    {definition_of_done as checklist items}

    ## Linked Requirements
    {linked_requirements}
    ```
  - Labels: `feature`, `{feature.priority.toLowerCase()}`, `{feature.user_persona.toLowerCase().replace(' ', '-')}`
  - Milestone: The milestone you created for the parent epic

### Step 3 — Create Issues for User Stories
For each user story in `user-stories.json`:
- Create a **GitHub Issue** with:
  - Title: `[STORY] {story.title}`
  - Body: Use this template:
    ```
    ## User Story
    {story.user_story}

    **Story Points:** {story.story_points}
    **Priority:** {story.priority}
    **Feature:** {story.feature_id} | **Epic:** {story.epic_id}

    ## Acceptance Criteria
    {acceptance_criteria as checklist items}

    ## Tasks
    {tasks as checklist items}

    ## Notes
    {story.notes}
    ```
  - Labels: `user-story`, `{story.priority.toLowerCase()}`, story point label (e.g., `points-5`), tags from `story.tags`
  - Milestone: The milestone for the parent epic

### Step 4 — Log Results
After all issues are created, write a summary to `stages/04-devops/github-push-log.md` with:
- Total milestones created
- Total feature issues created
- Total user story issues created
- Any errors or skipped items
- Links to the repository milestones page

---

## Important
- Process items in order: Epics → Features → Stories (dependencies flow downward)
- If an item fails to create, log the error and continue — do not abort the entire run
- Use the exact label names specified — create labels if they don't exist in the repo
- Final response must be a short confirmation only, not a restatement of the backlog

````
