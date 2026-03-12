# Prompt: Push Backlog to Azure DevOps via MCP
## Stage 5B — Azure DevOps

You are an agent with access to Azure DevOps MCP tools. Your task is to populate an Azure DevOps project with the full project backlog as a properly structured work item hierarchy.

Read the following files:
- `stages/03-backlog/epics.json`
- `stages/03-backlog/features.json`
- `stages/03-backlog/user-stories.json`

---

## HARD EXECUTION RULES

You must perform the Azure DevOps operations directly and write the log file directly.

Describing what you would do without creating work items, links, and log output is a failure.

### Mode/tool check
- If Azure DevOps work item tools and file-writing capability are available, execute the workflow.
- If either is unavailable, stop immediately and reply exactly:

`Switch to Agent mode with Azure DevOps tool access so I can execute the backlog push.`

### Forbidden behavior
- Do NOT only summarize the hierarchy in chat
- Do NOT stop after partial hierarchy creation unless a real tool failure prevents continuation
- Do NOT skip writing `stages/04-devops/ado-push-log.md`

### Required behavior
1. Read the backlog files
2. Create Epics, Features, User Stories, and optional Tasks in order
3. Create required parent-child links
4. Continue past individual failures and log them
5. Write `stages/04-devops/ado-push-log.md`
6. Reply only with a short completion note

---

## Work Item Hierarchy
Azure DevOps uses this hierarchy (top to bottom):
```
Epic → Feature → User Story → Task
```
Parent-child relationships must be created explicitly after each work item is created.

---

## Instructions

### Step 1 — Create Epics
For each item in `epics.json`:
- Create a work item of type **Epic** with:
  - `System.Title`: epic's `title`
  - `System.Description`: epic's `description`
  - `Microsoft.VSTS.Common.BusinessValue`: map priority (Critical=100, High=75, Medium=50, Low=25)
  - `Microsoft.VSTS.Common.Priority`: map (Critical=1, High=2, Medium=3, Low=4)
  - `System.Tags`: join `tags` array with `;`
- Record the returned work item ID — you'll need it to link children

### Step 2 — Create Features
For each item in `features.json`:
- Create a work item of type **Feature** with:
  - `System.Title`: feature's `title`
  - `System.Description`: feature's `description` + formatted acceptance criteria
  - `Microsoft.VSTS.Common.Priority`: map priority field
  - `System.Tags`: join linked_requirements + tags with `;`
- After creation, create a **parent link** connecting this Feature to its parent Epic (using the epic ID recorded in Step 1)

### Step 3 — Create User Stories
For each item in `user-stories.json`:
- Create a work item of type **User Story** with:
  - `System.Title`: story's `title`
  - `System.Description`: formatted as:
    ```
    <b>User Story</b><br>{story.user_story}<br><br>
    <b>Acceptance Criteria:</b><br>{acceptance_criteria as HTML list}
    ```
  - `Microsoft.VSTS.Common.AcceptanceCriteria`: acceptance criteria as HTML
  - `Microsoft.VSTS.Scheduling.StoryPoints`: story's `story_points`
  - `Microsoft.VSTS.Common.Priority`: map priority field
  - `System.Tags`: join tags with `;`
- After creation, create a **parent link** connecting this User Story to its parent Feature

### Step 4 — Create Tasks (optional, if time permits)
For each user story, create child **Task** work items for each item in the story's `tasks` array:
- `System.Title`: task text
- `System.State`: "To Do"
- Parent link: the parent User Story

### Step 5 — Log Results
After all work items are created, write a summary to `stages/04-devops/ado-push-log.md` with:
- Total Epics created (with work item IDs)
- Total Features created
- Total User Stories created
- Total Tasks created
- Any errors or skipped items
- Link to the Azure DevOps backlog view

---

## Important
- Process items strictly in order: Epics → Features → Stories → Tasks
- Parent links must be created — an unlinked backlog is not useful for the demo
- If a work item fails, log it and continue
- Area Path and Iteration Path: use the project root defaults unless otherwise configured
- Final response must be a short confirmation only, not a restatement of the hierarchy

````
