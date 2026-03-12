# Agentic SDLC Demo - Scopilot
### AI-Assisted Software Development Lifecycle

This project demonstrates how GitHub Copilot and MCP servers can automate the transformation of a customer scoping call transcript into a fully populated Azure DevOps or GitHub project backlog — with zero manual data entry.

---

## The Story

A Microsoft services engagement team has just completed a scoping call with a customer. Instead of spending days manually writing requirements and creating work items, an AI agent:

1. **Reads** the meeting transcript
2. **Extracts** structured requirements
3. **Generates** epics, features, user stories and technical specs
4. **Pushes** the entire backlog directly to Azure DevOps or GitHub

---

## Project Structure

```
sdlc-agent-demo/
├── .github/
│   └── workflows/
│       └── deploy-scopilot-pages.yml  # Builds and publishes the static app to GitHub Pages
├── .vscode/
│   ├── tasks.json          # One-click pipeline stage runners
│   ├── settings.json       # MCP server config + editor settings
│   └── extensions.json     # Recommended VS Code extensions
├── app/
│   ├── public/             # Local Scopilot visualizer UI
│   ├── lib/                # Shared stage-data loader for server + static build
│   ├── scripts/            # Build utilities, including static export
│   ├── server.js           # Express server for stage data + static app
│   ├── package.json        # App scripts and dependencies
│   ├── static/             # Generated static export for GitHub Pages/static hosting
│   └── README.md           # App-specific notes
├── stages/
│   ├── 01-transcript/      # INPUT: Raw meeting transcript
│   ├── 02-requirements/    # AI-generated: Requirements doc
│   ├── 03-backlog/         # AI-generated: Epics, Features, Stories
│   │   └── specs/          # AI-generated: Technical specs (one per feature)
│   └── 04-devops/          # AI-generated: Push logs
├── prompts/                # Copilot prompt files (one per stage)
├── .env.example            # Token configuration template
└── .gitignore
```

---

## Prerequisites

- VS Code with **GitHub Copilot** and **GitHub Copilot Chat** extensions
- Copilot Chat with **Agent Mode** enabled
- Node.js 18+ (for MCP servers)
- A GitHub repo and/or Azure DevOps project to push to
- Tokens configured (see Setup below)

---

## Setup

### 1. Install MCP Servers

```bash
# GitHub MCP server
npx -y @modelcontextprotocol/server-github

# Azure DevOps MCP server  
npx -y @azure-devops/mcp-server
```

### 2. Configure Tokens

```bash
cp .env.example .env
# Edit .env and fill in your GitHub token and/or ADO PAT
```

Set the environment variables in your shell before launching VS Code:

```bash
# macOS/Linux
export GITHUB_TOKEN=ghp_...
export AZURE_DEVOPS_PAT=...
export AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-org

# Windows PowerShell
$env:GITHUB_TOKEN="ghp_..."
$env:AZURE_DEVOPS_PAT="..."
```

### 3. Open in VS Code

```bash
code sdlc-agent-demo/
```

Install recommended extensions when prompted.

## Running the Demo

### Option A: Manual (most demo-friendly, shows AI working live)

Open the VS Code Tasks panel: `Terminal → Run Task`

| Task | What happens |
|------|-------------|
| 🎬 Stage 0 | Opens transcript in editor |
| 📋 Stage 1→2 | Extracts requirements from transcript |
| 🗂️ Stage 2→3A | Generates epics JSON |
| 🧩 Stage 2→3B | Generates features JSON |
| 📝 Stage 3 | Generates user stories JSON |
| 📐 Stage 4 | Generates technical specs (one per feature) |
| 🐙 Stage 5A | Agent pushes backlog to GitHub |
| 🔷 Stage 5B | Agent pushes backlog to Azure DevOps |
| ✅ Validate | Checks all stage outputs exist |
| 🔄 Reset | Clears outputs for a clean re-run |

### How to Run Each Stage

1. Run the task to see the prompt instruction
2. Open **Copilot Chat** (Ctrl+Alt+I / Cmd+Alt+I)
3. For Stages 1-3: use **Chat mode** with `@workspace`
4. For Stage 4: use **Chat mode** — target a specific feature (`generate a spec for FEAT-003`) or ask Copilot to loop through all features
5. For Stage 5: switch to **Agent mode** — Copilot will call MCP tools automatically
6. Paste or reference the relevant prompt file from `/prompts/`

### Option B: Chained (advanced)
In Agent mode, you can run the entire pipeline with a single prompt:
> *"@workspace Run the full SDLC pipeline: start with #file:prompts/01-extract-requirements.md, then proceed through each stage in order, saving outputs to the appropriate stage folders."*

## Local Visualizer App (optional)
The repo also includes a local Node.js web app in [app/](app/) that visualizes the generated artifacts. It is meant for local review only, so you can quickly browse the transcript, requirements, epics, features, user stories and specs without pushing the backlog to GitHub or Azure DevOps via the MCP servers.

![Local Visualizer App](<images/CleanShot 2026-03-11 at 22.10.02@2x.png>)
*Local visualizer preview after running the pipeline.*

### Start the App

```bash
cd app
npm install
npm run dev
```

Then open:

- http://localhost:4173 or the click the link provided in your terminal

The app reads from the repo's `stages/` folder, so as you generate requirements, backlog items, specs, and push logs, the visualizer reflects those outputs locally when refreshed.

## Demo Script (10-15 minutes)

**[0:00]** Open `stages/01-transcript/meeting-transcript.md` — walk through it briefly. *"This is a real scoping call — 62 minutes, lots of detail, would take a BA a full day to process manually."*

**[2:00]** Run Stage 1→2. *"Copilot reads the transcript and extracts structured requirements."* Show the output file appearing.

**[4:00]** Run Stage 2→3A. *"Now it generates epics — the strategic workstreams."* Show `epics.json`.

**[6:00]** Run Stage 2→3B + Stage 3. *"Features and user stories, all linked back to requirements."* Show the hierarchy in `features.json` and `user-stories.json`.

**[8:00]** Run Stage 4. *"Now watch it generate a full technical spec for each feature — data models, API contracts, edge cases, acceptance criteria."* Show a spec file appearing in `stages/03-backlog/specs/`. *"This is what a developer — or an AI coding agent — works from."*

**Optional** Start the local visualizer app from [app/](app/) by running `npm run dev` from the /app directory in the terminal. This is a great option to visualize the artifacts WITHOUT pushing the backlog to GitHub or Azure DevOps. *"We also used AI to help build this lightweight review app itself, so once the stages run, we can browse requirements, epics, features, user stories, specs in a single interface."*

**[11:00]** Switch to Agent mode. Open GitHub or ADO — show it empty.

**[12:00]** Run Stage 5. *"Watch the agent call MCP tools in real time."* Let the audience see the tool calls in Copilot Chat.

**[15:00]** Refresh GitHub/ADO. Show the fully populated backlog. *"From transcript to backlog — in minutes."*

## Token Security Reminder

- Never commit `.env` to source control
- Use short-lived PATs scoped to minimum permissions
- For demo environments, consider using a dedicated demo org/project
- Rotate tokens after the demo if used in a shared environment

### Build a Static Version

If you want to preserve the existing Node.js app and also generate a static version for GitHub Pages or another static host:

```bash
cd app
npm install
npm run build:static
```

This writes a static export to [app/static/](app/static). Re-run the command whenever the files in `stages/` or `prompts/` change.

### Publish to GitHub Pages

The repo now includes a GitHub Actions workflow at [.github/workflows/deploy-scopilot-pages.yml](.github/workflows/deploy-scopilot-pages.yml) that:

- installs the app dependencies
- runs `npm run build:static`
- publishes [app/static/](app/static) to GitHub Pages

To use it:

1. In GitHub, open **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `main` or run the workflow manually from the **Actions** tab

After deployment, GitHub Pages will host the static Scopilot site built from the current `stages/` and `prompts/` content in the repository.

## Next Steps (Roadmap)

- [ ] Web UI to replace the VS Code task runner
- [ ] Drag-and-drop transcript upload
- [ ] Backlog review/editing step before pushing
- [ ] Feed specs directly into Copilot to generate scaffolded code (`implement this spec`)
- [ ] Sprint assignment and capacity planning stage
- [ ] Teams notification when backlog is ready
- [ ] Support for audio transcript input (Whisper integration)
