const appRoot = document.getElementById('app');

const state = {
    data: null,
    loading: true,
    error: null,
    selectedEpicId: null,
    selectedFeatureId: null,
    selectedStoryId: null,
    activePublishInfoTarget: null,
    activePromptKey: null,
    isAgentPreviewOpen: false,
    activePaneMenuKey: null,
    isAssignMenuOpen: false,
    selectedAssignees: [],
    paneWidths: loadPaneWidths(),
};

let hasBoundGlobalKeyboardHandler = false;
let hasBoundGlobalClickHandler = false;
let heroIntroPlayed = false;

const defaultPaneWidths = {
    'transcript-column': 380,
    'requirements-column': 720,
    'epics-column': 360,
    'features-column': 380,
    'stories-column': 380,
    'detail-column': 760,
};

const minPaneWidth = 300;
const maxPaneWidth = 1200;
const githubRepoBaseUrl = 'https://github.com/kevinmgates/agenticSDLC';
const heroLogoAsset = getAssetPath('scopilot.png');
const githubPublishIconAsset = getAssetPath('GitHub_Invertocat_White.png');
const azureDevOpsPublishIconAsset = getAssetPath('azure_devops_logo_freelogovectors.net_.png');
const jiraPublishIconAsset = getAssetPath('Jira.png');
const assigneeOptions = [
    { id: 'github-coding-agent', name: 'GitHub Coding Agent', subtitle: 'AI collaborator', avatar: '🤖' },
    { id: 'maya-chen', name: 'Maya Chen', subtitle: 'Senior frontend engineer', avatar: 'MC' },
    { id: 'jordan-lee', name: 'Jordan Lee', subtitle: 'Platform developer', avatar: 'JL' },
    { id: 'priya-patel', name: 'Priya Patel', subtitle: 'Product engineer', avatar: 'PP' },
];

bootstrap();

async function bootstrap() {
    await loadData();
}

async function loadData() {
    state.loading = true;
    state.error = null;
    render();

    try {
        const response = await fetch(getDataEndpoint());
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        state.data = data;
        hydrateSelections();
        state.loading = false;
        render();
    } catch (error) {
        state.loading = false;
        state.error = error instanceof Error ? error.message : String(error);
        render();
    }
}

function hydrateSelections() {
    const { data } = state;
    const epics = data?.epics || [];
    const features = data?.features || [];
    const stories = data?.userStories || [];

    if (!epics.length) {
        state.selectedEpicId = null;
        state.selectedFeatureId = null;
        state.selectedStoryId = null;
        return;
    }

    const epicStillExists = epics.some((epic) => epic.id === state.selectedEpicId);
    state.selectedEpicId = epicStillExists ? state.selectedEpicId : epics[0].id;

    const featuresForEpic = features.filter((feature) => feature.epic_id === state.selectedEpicId);
    const featureStillExists = featuresForEpic.some((feature) => feature.id === state.selectedFeatureId);
    state.selectedFeatureId = featureStillExists ? state.selectedFeatureId : featuresForEpic[0]?.id || null;

    const storiesForFeature = stories.filter((story) => story.feature_id === state.selectedFeatureId);
    const storyStillExists = storiesForFeature.some((story) => story.id === state.selectedStoryId);
    state.selectedStoryId = storyStillExists ? state.selectedStoryId : storiesForFeature[0]?.id || null;
}

function render(options = {}) {
    const { focusColumnId = null } = options;

    if (state.loading) {
        appRoot.innerHTML = '<div class="empty-state">Loading the SDLC stage visualizer…</div>';
        return;
    }

    if (state.error) {
        appRoot.innerHTML = `
      <section class="error-shell">
        <h1>Unable to load the stage visualizer</h1>
        <p>${escapeHtml(state.error)}</p>
        <button class="refresh-button" id="retry-load">Try again</button>
      </section>
    `;

        document.getElementById('retry-load')?.addEventListener('click', loadData);
        return;
    }

    const previousColumnsShell = document.getElementById('columns-shell');
    const preservedScrollLeft = previousColumnsShell?.scrollLeft || 0;

    const { data } = state;
    const selectedEpic = data.epics.find((epic) => epic.id === state.selectedEpicId) || null;
    const selectedFeature = data.features.find((feature) => feature.id === state.selectedFeatureId) || null;
    const selectedStory = data.userStories.find((story) => story.id === state.selectedStoryId) || null;
    const selectedSpec = data.specs.find((spec) => spec.featureId === state.selectedFeatureId) || null;

    const featuresForEpic = data.features.filter((feature) => feature.epic_id === state.selectedEpicId);
    const storiesForFeature = data.userStories.filter((story) => story.feature_id === state.selectedFeatureId);
    const heroTitleClass = heroIntroPlayed ? 'hero-title' : 'hero-title hero-title-intro';

    appRoot.innerHTML = `
    <main class="app-shell">
      <section class="hero">
        <article class="hero-card">
          <div class="hero-title-row">
            <img class="hero-logo" src="${escapeHtml(heroLogoAsset)}" alt="Scopilot logo" />
            <div class="hero-copy-block">
              <h1 class="${heroTitleClass}"><span class="hero-brand-highlight">Scopilot</span><span class="hero-divider" aria-hidden="true">&nbsp;&nbsp;|&nbsp;&nbsp;</span><span class="hero-typed-copy">Ship Faster. Start Smarter.</span></h1>
              <p>Scoping calls transformed into a structured backlog in minutes with AI agents.</p>
            </div>
          </div>
        </article>
        <div class="hero-side-cards">
          <aside class="summary-card">
            <div class="summary-header">
              <span class="card-header-icon" aria-hidden="true">📸</span>
              <strong>Backlog Snapshot</strong>
            </div>
            <div class="summary-grid">
              ${summaryPill(data.summary.epicCount, 'Epics')}
              ${summaryPill(data.summary.featureCount, 'Features')}
              ${summaryPill(data.summary.userStoryCount, 'User stories')}
              ${summaryPill(data.summary.specCount, 'Specs')}
            </div>
          </aside>
          <aside class="publish-card">
            <div class="publish-card-header">
              <span class="card-header-icon" aria-hidden="true">🤖</span>
              <strong>Publish Backlog</strong>
            </div>
            ${renderPublishActions()}
          </aside>
        </div>
      </section>

      <section class="columns-shell" id="columns-shell">
        ${renderTranscriptColumn(data.transcript)}
        ${renderRequirementsColumn(data.requirements)}
        ${renderEpicsColumn(data.epics, selectedEpic)}
        ${renderFeaturesColumn(featuresForEpic, selectedFeature, selectedEpic)}
        ${renderStoriesColumn(storiesForFeature, selectedStory, selectedFeature)}
        ${renderDetailColumn(selectedFeature, selectedStory, selectedSpec)}
      </section>
      ${renderPromptModal()}
      ${renderAgentPreviewModal()}
      ${renderPublishInfoModal()}
      <button class="floating-refresh-button" id="refresh-data" type="button" aria-label="Refresh data" title="Refresh data">
        <span aria-hidden="true">↻</span>
      </button>
    </main>
  `;

    const nextColumnsShell = document.getElementById('columns-shell');
    if (nextColumnsShell) {
        nextColumnsShell.scrollLeft = preservedScrollLeft;
    }

    document.getElementById('refresh-data')?.addEventListener('click', loadData);
    bindCardSelection('.epic-card', (id) => {
        state.selectedEpicId = id;
        state.selectedFeatureId = data.features.find((feature) => feature.epic_id === id)?.id || null;
        state.selectedStoryId = data.userStories.find((story) => story.feature_id === state.selectedFeatureId)?.id || null;
        render({ focusColumnId: 'features-column' });
    });

    bindCardSelection('.feature-card', (id) => {
        state.selectedFeatureId = id;
        state.selectedStoryId = data.userStories.find((story) => story.feature_id === id)?.id || null;
        render({ focusColumnId: 'stories-column' });
    });

    bindCardSelection('.story-card', (id) => {
        state.selectedStoryId = id;
        render({ focusColumnId: 'detail-column' });
    });

    bindPaneResizers();
    bindRequirementsOutline();
    bindPaneMenus();
    bindPromptActions();
    bindPublishInfoActions();
    bindAssignMenu();
    bindAgentPreviewModal();
    bindGlobalInteractions();

    if (focusColumnId) {
        scrollColumnIntoView(focusColumnId);
    }

    if (!heroIntroPlayed) {
        heroIntroPlayed = true;
    }
}

function bindCardSelection(selector, handler) {
    document.querySelectorAll(selector).forEach((button) => {
        button.addEventListener('click', () => {
            handler(button.dataset.id);
        });
    });
}

function scrollColumnIntoView(columnId) {
    const columnsShell = document.getElementById('columns-shell');
    const column = document.getElementById(columnId);
    if (!columnsShell || !column) {
        return;
    }

    const currentScrollLeft = columnsShell.scrollLeft;
    const columnStart = column.offsetLeft;
    const columnEnd = columnStart + column.offsetWidth;
    const viewportStart = currentScrollLeft;
    const viewportEnd = viewportStart + columnsShell.clientWidth;
    const padding = 24;

    if (columnStart >= viewportStart + padding && columnEnd <= viewportEnd - padding) {
        return;
    }

    const maxScrollLeft = Math.max(0, columnsShell.scrollWidth - columnsShell.clientWidth);
    let targetScrollLeft = currentScrollLeft;

    if (columnStart < viewportStart + padding) {
        targetScrollLeft = columnStart - padding;
    } else if (columnEnd > viewportEnd - padding) {
        targetScrollLeft = columnEnd - columnsShell.clientWidth + padding;
    }

    columnsShell.scrollTo({
        left: Math.max(0, Math.min(maxScrollLeft, targetScrollLeft)),
        behavior: 'smooth',
    });
}

function renderTranscriptColumn(transcript) {
    return renderColumn({
        id: 'transcript-column',
        content: `
      <header class="column-header">
        <div class="column-title-row">
          <div>
            <h2 class="pane-title">1. Transcript ${renderAiEnhancementBadge({ label: 'AI assisted', interactive: false })}</h2>
            <div class="column-subtitle">The original customer conversation that starts the pipeline.</div>
          </div>
          <span class="badge">Input</span>
        </div>
        <div class="column-path">${escapeHtml(transcript.path)}</div>
      </header>
      <div class="column-body markdown">${transcript.html}</div>
    `,
    });
}

function renderRequirementsColumn(requirements) {
    return renderColumn({
        id: 'requirements-column',
        content: `
      <header class="column-header">
        <div class="column-title-row">
          <div>
            <h2 class="pane-title">2. Requirements ${renderAiEnhancementBadge({ promptKey: 'requirements', label: 'AI generated' })}</h2>
            <div class="column-subtitle">Structured needs extracted from the transcript and organized into project, functional, non-functional, and integration views.</div>
          </div>
          <div class="column-header-actions">
            ${renderPaneMenu({
            paneKey: 'requirements',
            items: [
                { type: 'prompt', promptKey: 'requirements', label: 'View prompt file', icon: '</>' },
            ],
        })}
            <span class="badge">${requirements.sections.length}</span>
          </div>
        </div>
        <div class="column-path">${escapeHtml(requirements.path)}</div>
      </header>
      <div class="column-body">
        ${renderRequirementsOutline(requirements.sections)}
        <div class="markdown requirements-markdown">${decorateRequirementsHtml(requirements.html, requirements.sections)}</div>
      </div>
    `,
    });
}

function renderRequirementsOutline(sections) {
    const groups = [];
    let currentGroup = null;

    sections.forEach((section) => {
        if (section.level === 2 || !currentGroup) {
            currentGroup = {
                ...section,
                children: [],
            };
            groups.push(currentGroup);
            return;
        }

        currentGroup.children.push(section);
    });

    return `
      <section class="requirements-outline-panel">
        <div class="requirements-outline-header">
          <h3>Overview</h3>
          <span class="meta-chip">${sections.length} headings</span>
        </div>
        <div class="requirements-outline-list">
          ${groups
            .map(
                (group, index) => `
                <div class="outline-group">
                  <button class="outline-chip outline-chip-primary" data-target-section="${escapeHtml(group.id)}" type="button">
                    <span class="outline-index">${index + 1}</span>
                    <span class="outline-text">${escapeHtml(group.title)}</span>
                  </button>
                  ${group.children.length
                        ? `<div class="outline-children">
                          ${group.children
                            .map(
                                (child) => `
                              <button class="outline-chip outline-chip-secondary" data-target-section="${escapeHtml(child.id)}" type="button">
                                <span class="outline-bullet" aria-hidden="true"></span>
                                <span class="outline-text">${escapeHtml(child.title)}</span>
                              </button>
                            `,
                            )
                            .join('')}
                        </div>`
                        : ''}
                </div>
              `,
            )
            .join('')}
        </div>
      </section>
    `;
}

function renderEpicsColumn(epics, selectedEpic) {
    return renderColumn({
        id: 'epics-column',
        content: `
      <header class="column-header">
        <div class="column-title-row">
          <div>
            <h2 class="pane-title">3. Epics ${renderAiEnhancementBadge({ promptKey: 'epics', label: 'AI generated' })}</h2>
            <div class="column-subtitle">Strategic workstreams derived from the requirements set.</div>
          </div>
          <div class="column-header-actions">
            ${renderPaneMenu({
            paneKey: 'epics',
            items: [
                { type: 'prompt', promptKey: 'epics', label: 'View prompt file', icon: '</>' },
                { type: 'link', href: `${githubRepoBaseUrl}/milestones`, label: 'View on GitHub', icon: '🐱', title: 'Open GitHub milestones for epics' },
            ],
        })}
            <span class="badge">${epics.length}</span>
          </div>
        </div>
      </header>
      <div class="column-body">
        <div class="list">
          ${epics
                .map((epic) => {
                    const isSelected = selectedEpic?.id === epic.id;
                    return `
                <button class="card interactive epic-card ${isSelected ? 'selected' : ''}" data-id="${epic.id}" type="button">
                  <div class="card-header">
                    <span class="badge">${escapeHtml(epic.id)}</span>
                    <span class="meta-chip">${escapeHtml(epic.priority)}</span>
                  </div>
                  <h3 class="card-title">${escapeHtml(epic.title)}</h3>
                  <p class="card-copy">${escapeHtml(epic.description)}</p>
                  <div class="meta-row">
                    <span class="meta-chip">${epic.featureCount} features</span>
                    <span class="meta-chip">${epic.userStoryCount} stories</span>
                    <span class="meta-chip">Size ${escapeHtml(epic.estimated_size)}</span>
                  </div>
                  <div class="tag-row">${epic.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
                </button>
              `;
                })
                .join('')}
        </div>
      </div>
    `,
    });
}

function renderFeaturesColumn(features, selectedFeature, selectedEpic) {
    if (!selectedEpic) {
        return renderEmptyColumn('features-column', '4. Features', 'Select an epic to see its features.');
    }

    return renderColumn({
        id: 'features-column',
        content: `
      <header class="column-header">
        <div class="column-title-row">
          <div>
            <h2 class="pane-title">4. Features ${renderAiEnhancementBadge({ promptKey: 'features', label: 'AI generated' })}</h2>
            <div class="column-subtitle">Feature breakdown for ${escapeHtml(selectedEpic.id)} — ${escapeHtml(selectedEpic.title)}.</div>
          </div>
          <div class="column-header-actions">
            ${renderPaneMenu({
            paneKey: 'features',
            items: [
                { type: 'prompt', promptKey: 'features', label: 'View prompt file', icon: '</>' },
                { type: 'link', href: `${githubRepoBaseUrl}/issues?q=${encodeURIComponent('is:issue [FEATURE]')}`, label: 'View on GitHub', icon: '🐱', title: 'Open GitHub issues filtered to features' },
            ],
        })}
            <span class="badge">${features.length}</span>
          </div>
        </div>
      </header>
      <div class="column-body">
        ${features.length
                ? `<div class="list">${features
                    .map((feature) => {
                        const isSelected = selectedFeature?.id === feature.id;
                        return `
                    <button class="card interactive feature-card ${isSelected ? 'selected' : ''}" data-id="${feature.id}" type="button">
                      <div class="card-header">
                        <span class="badge">${escapeHtml(feature.id)}</span>
                        <span class="meta-chip">${escapeHtml(feature.priority)}</span>
                      </div>
                      <h3 class="card-title">${escapeHtml(feature.title)}</h3>
                      <p class="card-copy">${escapeHtml(feature.description)}</p>
                      <div class="meta-row">
                        <span class="meta-chip">${escapeHtml(feature.user_persona)}</span>
                        <span class="meta-chip">${feature.userStoryCount} stories</span>
                        <span class="meta-chip">Spec ${feature.hasSpec ? 'available' : 'missing'}</span>
                      </div>
                      <div class="tag-row">${feature.linked_requirements
                                .map((requirement) => `<span class="tag">${escapeHtml(requirement)}</span>`)
                                .join('')}</div>
                    </button>
                  `;
                    })
                    .join('')}</div>`
                : '<div class="empty-state">No features were found for the selected epic.</div>'
            }
      </div>
    `,
    });
}

function renderStoriesColumn(stories, selectedStory, selectedFeature) {
    if (!selectedFeature) {
        return renderEmptyColumn('stories-column', '5. User Stories', 'Select a feature to see its delivery stories.');
    }

    return renderColumn({
        id: 'stories-column',
        content: `
      <header class="column-header">
        <div class="column-title-row">
          <div>
            <h2 class="pane-title">5. User Stories ${renderAiEnhancementBadge({ promptKey: 'stories', label: 'AI generated' })}</h2>
            <div class="column-subtitle">Delivery-ready stories for ${escapeHtml(selectedFeature.id)} — ${escapeHtml(selectedFeature.title)}.</div>
          </div>
          <div class="column-header-actions">
            ${renderPaneMenu({
            paneKey: 'stories',
            items: [
                { type: 'prompt', promptKey: 'stories', label: 'View prompt file', icon: '</>' },
                { type: 'link', href: `${githubRepoBaseUrl}/issues?q=${encodeURIComponent('is:issue [STORY]')}`, label: 'View on GitHub', icon: '🐱', title: 'Open GitHub issues filtered to user stories' },
            ],
        })}
            <span class="badge">${stories.length}</span>
          </div>
        </div>
      </header>
      <div class="column-body">
        ${stories.length
                ? `<div class="list">${stories
                    .map((story) => {
                        const isSelected = selectedStory?.id === story.id;
                        return `
                    <button class="card interactive story-card ${isSelected ? 'selected' : ''}" data-id="${story.id}" type="button">
                      <div class="card-header">
                        <span class="badge">${escapeHtml(story.id)}</span>
                        <span class="meta-chip">${story.story_points} pts</span>
                      </div>
                      <h3 class="card-title">${escapeHtml(story.title)}</h3>
                      <p class="card-copy">${escapeHtml(story.user_story)}</p>
                      <div class="meta-row">
                        <span class="meta-chip">${story.taskCount} tasks</span>
                        <span class="meta-chip">${story.acceptanceCriteriaCount} AC</span>
                        <span class="meta-chip">${escapeHtml(story.priority)}</span>
                      </div>
                      <div class="tag-row">${story.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
                    </button>
                  `;
                    })
                    .join('')}</div>`
                : '<div class="empty-state">No user stories were found for the selected feature.</div>'
            }
      </div>
    `,
    });
}

function renderDetailColumn(selectedFeature, selectedStory, selectedSpec) {
    return renderColumn({
        id: 'detail-column',
        content: `
      <header class="column-header">
        <div class="column-title-row">
          <div>
            <h2 class="pane-title">6. Feature Spec ${renderAiEnhancementBadge({ promptKey: 'detail', label: 'AI generated' })}</h2>
            <div class="column-subtitle">Implementation context, selected story focus, and the full spec document.</div>
          </div>
          <div class="column-header-actions">
            ${renderAssignButton()}
            ${renderPaneMenu({
            paneKey: 'detail',
            items: [
                { type: 'prompt', promptKey: 'detail', label: 'View prompt file', icon: '</>' },
            ],
        })}
          </div>
        </div>
        <div class="column-path">${escapeHtml(selectedFeature ? (selectedSpec?.path || 'No spec file found for this feature yet') : 'Select a feature to review its implementation detail and spec markdown.')}</div>
      </header>
      <div class="column-body">
        ${selectedFeature ? `<div class="feature-detail">
          <section class="detail-section">
            <h3>${escapeHtml(selectedFeature.id)} — ${escapeHtml(selectedFeature.title)}</h3>
            <p class="card-copy">${escapeHtml(selectedFeature.description)}</p>
            <div class="meta-row">
              <span class="meta-chip">Persona ${escapeHtml(selectedFeature.user_persona)}</span>
              <span class="meta-chip">Priority ${escapeHtml(selectedFeature.priority)}</span>
              <span class="meta-chip">Size ${escapeHtml(selectedFeature.estimated_size)}</span>
            </div>
            <div class="tag-row">${selectedFeature.linked_requirements
                    .map((requirement) => `<span class="tag">${escapeHtml(requirement)}</span>`)
                    .join('')}</div>
          </section>
          ${renderSelectedStoryDetail(selectedStory)}
          ${renderSpecDetail(selectedSpec)}
        </div>` : '<div class="empty-state">Select a feature to review its implementation detail and spec markdown.</div>'}
      </div>
    `,
    });
}

function renderPaneMenu({ paneKey, items }) {
    return `
      <div class="pane-menu-shell">
        <button class="header-icon-button pane-menu-trigger" data-pane-menu-toggle="${escapeHtml(paneKey)}" type="button" title="Open pane menu" aria-label="Open pane menu" aria-haspopup="menu" aria-expanded="${state.activePaneMenuKey === paneKey ? 'true' : 'false'}">
          <span class="header-icon-symbol" aria-hidden="true">⋯</span>
        </button>
        ${state.activePaneMenuKey === paneKey ? renderPaneMenuItems(items) : ''}
      </div>
    `;
}

function renderAiEnhancementBadge({ promptKey = null, label = 'AI generated', interactive = true } = {}) {
    const iconMarkup = '<span class="ai-enhancement-icon" aria-hidden="true">✨</span>';
    const textMarkup = `<span>${escapeHtml(label)}</span>`;

    if (!interactive || !promptKey) {
        return `
      <span class="ai-enhancement-badge ai-enhancement-badge-static" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">
        ${iconMarkup}
        ${textMarkup}
      </span>
    `;
    }

    return `
      <button class="ai-enhancement-badge" data-menu-prompt-key="${escapeHtml(promptKey)}" type="button" title="View prompt file" aria-label="View prompt file for ${escapeHtml(label).toLowerCase()} stage">
        ${iconMarkup}
        ${textMarkup}
      </button>
    `;
}

function renderPaneMenuItems(items) {
    return `
      <div class="pane-menu" role="menu">
        ${items.map((item) => renderPaneMenuItem(item)).join('')}
      </div>
    `;
}

function renderPaneMenuItem(item) {
    if (item.type === 'prompt') {
        return `
          <button class="pane-menu-item" data-menu-prompt-key="${escapeHtml(item.promptKey)}" type="button" role="menuitem">
            <span class="pane-menu-item-icon code-symbol" aria-hidden="true">${escapeHtml(item.icon)}</span>
            <span class="pane-menu-item-text">${escapeHtml(item.label)}</span>
          </button>
        `;
    }

    return `
      <a class="pane-menu-item pane-menu-link" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer" title="${escapeHtml(item.title || item.label)}" aria-label="${escapeHtml(item.title || item.label)}" role="menuitem">
        <span class="pane-menu-item-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
        <span class="pane-menu-item-text">${escapeHtml(item.label)}</span>
        <span class="pane-menu-item-trailing" aria-hidden="true">↗</span>
      </a>
    `;
}

function renderAssignButton() {
    const selectedCount = state.selectedAssignees.length;

    return `
      <div class="assign-shell">
        <button class="assign-button" id="toggle-assign-menu" type="button" aria-haspopup="menu" aria-expanded="${state.isAssignMenuOpen ? 'true' : 'false'}">
          <span>Assign</span>
          ${selectedCount ? `<span class="assign-count">${selectedCount}</span>` : ''}
          <span class="assign-caret" aria-hidden="true">▾</span>
        </button>
        ${state.isAssignMenuOpen ? renderAssignMenu() : ''}
      </div>
    `;
}

function renderAssignMenu() {
    return `
      <section class="assign-menu" id="assign-menu" role="menu" aria-label="Assign reviewers">
        <div class="assign-menu-header">
          <strong>Assign</strong>
          <span class="subtle">Select one or more assignees</span>
        </div>
        <div class="assign-menu-list">
          ${assigneeOptions
            .map((option) => {
                const isSelected = state.selectedAssignees.includes(option.id);
                return `
                <label class="assign-option" for="assignee-${escapeHtml(option.id)}">
                  <input id="assignee-${escapeHtml(option.id)}" class="assign-checkbox" data-assignee-id="${escapeHtml(option.id)}" type="checkbox" ${isSelected ? 'checked' : ''} />
                  <span class="assign-avatar" aria-hidden="true">${escapeHtml(option.avatar)}</span>
                  <span class="assign-meta">
                    <span class="assign-name">${escapeHtml(option.name)}</span>
                    <span class="assign-subtitle">${escapeHtml(option.subtitle)}</span>
                  </span>
                </label>
              `;
            })
            .join('')}
        </div>
      </section>
    `;
}

function renderPromptModal() {
    if (!state.activePromptKey) {
        return '';
    }

    const promptFile = state.data?.promptFiles?.[state.activePromptKey];
    if (!promptFile) {
        return `
      <div class="modal-overlay" id="prompt-modal-overlay" role="presentation">
        <section class="modal-card prompt-modal-card" id="prompt-modal" role="dialog" aria-modal="true" aria-labelledby="prompt-modal-title">
          <button class="modal-close" id="close-prompt-modal" type="button" aria-label="Close dialog">✕</button>
          <div class="modal-hero prompt-modal-hero">
            <div class="modal-hero-icon" aria-hidden="true">&lt;/&gt;</div>
            <div>
              <span class="kicker">Prompt file</span>
              <h2 id="prompt-modal-title">Prompt file unavailable</h2>
              <p>
                The selected prompt file is not available in the current app data. Refresh or restart the local app to load the latest prompt mappings.
              </p>
            </div>
          </div>
        </section>
      </div>
    `;
    }

    const promptGitHubUrl = `${githubRepoBaseUrl}/blob/main/${promptFile.path}`;
    const promptDescription =
        state.activePromptKey === 'publishGithub' || state.activePromptKey === 'publishAzureDevOps'
            ? 'This prompt will instruct the agents to leverage MCP servers to publish the backlog.'
            : "This is the prompt used to generate the selected pane's output. Review it locally before rerunning or adapting the stage.";

    return `
      <div class="modal-overlay" id="prompt-modal-overlay" role="presentation">
        <section class="modal-card prompt-modal-card" id="prompt-modal" role="dialog" aria-modal="true" aria-labelledby="prompt-modal-title">
          <button class="modal-close" id="close-prompt-modal" type="button" aria-label="Close dialog">✕</button>
          <div class="modal-hero prompt-modal-hero">
            <div class="modal-hero-icon" aria-hidden="true">&lt;/&gt;</div>
            <div>
              <span class="kicker">Prompt file</span>
              <h2 id="prompt-modal-title">${escapeHtml(promptFile.title)}</h2>
              <p>
                ${escapeHtml(promptDescription)}
              </p>
            </div>
          </div>
          <div class="prompt-file-meta-row">
            <div class="prompt-file-meta">${escapeHtml(promptFile.path)}</div>
            <a class="pane-menu-item pane-menu-link prompt-modal-link" href="${escapeHtml(promptGitHubUrl)}" target="_blank" rel="noreferrer" title="View on GitHub" aria-label="View prompt file on GitHub">
              <span class="pane-menu-item-icon" aria-hidden="true">🐱</span>
              <span class="pane-menu-item-text">View on GitHub</span>
              <span class="pane-menu-item-trailing" aria-hidden="true">↗</span>
            </a>
          </div>
          <div class="prompt-content-shell">
            <pre class="prompt-content"><code>${escapeHtml(promptFile.markdown)}</code></pre>
          </div>
        </section>
      </div>
    `;
}

function renderAgentPreviewModal() {
    if (!state.isAgentPreviewOpen) {
        return '';
    }

    return `
      <div class="modal-overlay" id="agent-preview-modal-overlay" role="presentation">
        <section class="modal-card agent-preview-modal-card" id="agent-preview-modal" role="dialog" aria-modal="true" aria-labelledby="agent-preview-modal-title">
          <button class="modal-close" id="close-agent-preview-modal" type="button" aria-label="Close dialog">✕</button>
          <div class="modal-hero">
            <div class="modal-hero-icon" aria-hidden="true">🤖</div>
            <div>
              <span class="kicker">GitHub Coding Agent</span>
              <h2 id="agent-preview-modal-title">Assigned to GitHub Copilot coding agent</h2>
              <p>
                This preview highlights the handoff experience shown when the feature spec is assigned to the coding agent.
              </p>
            </div>
          </div>
          <figure class="modal-image-frame">
            <img class="modal-image" src="https://github.blog/wp-content/uploads/2025/09/GitHub-Copilot-Changelog-Sept-25-2025-1.webp?fit=2048%2C1075" alt="Large preview of the GitHub Coding Agent assignment experience" />
          </figure>
        </section>
      </div>
    `;
}

function renderSelectedStoryDetail(selectedStory) {
    if (!selectedStory) {
        return `
      <section class="detail-section">
        <h4>Story focus</h4>
        <p class="card-copy">Choose a user story to highlight its tasks and acceptance criteria alongside the spec.</p>
      </section>
    `;
    }

    return `
    <section class="detail-section story-detail">
      <div>
        <h4>${escapeHtml(selectedStory.id)} — ${escapeHtml(selectedStory.title)}</h4>
        <p class="card-copy">${escapeHtml(selectedStory.user_story)}</p>
      </div>
      <div class="meta-row">
        <span class="meta-chip">${selectedStory.story_points} story points</span>
        <span class="meta-chip">${escapeHtml(selectedStory.priority)}</span>
      </div>
      <div>
        <h4>Acceptance criteria</h4>
        <ul class="detail-list">
          ${selectedStory.acceptance_criteria.map((criterion) => `<li>${escapeHtml(criterion)}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h4>Tasks</h4>
        <ul class="detail-list">
          ${selectedStory.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}
        </ul>
      </div>
    </section>
  `;
}

function renderSpecDetail(selectedSpec) {
    if (!selectedSpec) {
        return `
      <section class="detail-section">
        <h4>Spec document</h4>
        <p class="card-copy">No spec markdown exists yet for this feature. Once the file appears in <strong>stages/03-backlog/specs</strong>, it will render here after a refresh.</p>
      </section>
    `;
    }

    return `
    <section class="detail-section">
      <h4>${escapeHtml(selectedSpec.title)}</h4>
      <div class="markdown">${selectedSpec.html}</div>
    </section>
  `;
}

function renderEmptyColumn(id, title, message) {
    return renderColumn({
        id,
        content: `
      <header class="column-header">
        <div class="column-title-row">
          <div>
            <h2>${title}</h2>
          </div>
          <span class="badge">—</span>
        </div>
      </header>
      <div class="column-body empty-state">${message}</div>
  `,
    });
}

function renderColumn({ id, content }) {
    return `
  <section class="column" id="${id}" style="--column-width: ${getPaneWidth(id)}px;">
    ${content}
    <div class="column-resizer" data-resize-column="${id}" role="separator" aria-orientation="vertical" aria-label="Resize pane"></div>
  </section>
  `;
}

function getPaneWidth(id) {
    return clampWidth(state.paneWidths[id] || defaultPaneWidths[id] || 380);
}

function bindPaneResizers() {
    document.querySelectorAll('[data-resize-column]').forEach((handle) => {
        handle.addEventListener('pointerdown', (event) => {
            const columnId = handle.dataset.resizeColumn;
            const column = document.getElementById(columnId);
            if (!column) {
                return;
            }

            event.preventDefault();
            const startX = event.clientX;
            const startWidth = column.getBoundingClientRect().width;

            handle.setPointerCapture?.(event.pointerId);
            document.body.classList.add('is-resizing');

            const onPointerMove = (moveEvent) => {
                const nextWidth = clampWidth(startWidth + moveEvent.clientX - startX);
                state.paneWidths[columnId] = nextWidth;
                column.style.setProperty('--column-width', `${nextWidth}px`);
            };

            const stopResize = () => {
                document.body.classList.remove('is-resizing');
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', stopResize);
                window.removeEventListener('pointercancel', stopResize);
                persistPaneWidths();
            };

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', stopResize);
            window.addEventListener('pointercancel', stopResize);
        });
    });
}

function bindRequirementsOutline() {
    const requirementsColumn = document.getElementById('requirements-column');
    if (!requirementsColumn) {
        return;
    }

    const columnBody = requirementsColumn.querySelector('.column-body');
    requirementsColumn.querySelectorAll('[data-target-section]').forEach((button) => {
        button.addEventListener('click', () => {
            const sectionId = button.dataset.targetSection;
            const target = requirementsColumn.querySelector(`#${CSS.escape(sectionId)}`);
            if (!target || !columnBody) {
                return;
            }

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest',
            });
        });
    });
}

function bindPromptActions() {
    document.querySelectorAll('[data-menu-prompt-key], [data-prompt-modal-key]').forEach((button) => {
        button.addEventListener('click', () => {
            state.activePromptKey = button.dataset.menuPromptKey || button.dataset.promptModalKey;
            state.activePaneMenuKey = null;
            render();
        });
    });

    document.getElementById('close-prompt-modal')?.addEventListener('click', closePromptModal);
    document.getElementById('prompt-modal-overlay')?.addEventListener('click', (event) => {
        if (event.target.id === 'prompt-modal-overlay') {
            closePromptModal();
        }
    });
}

function renderPublishActions() {
    return `
      <div class="summary-actions">
        <button class="pane-menu-item publish-action-button" data-prompt-modal-key="publishGithub" type="button" title="Show GitHub publish prompt" aria-label="Show GitHub publish prompt">
          <span class="pane-menu-item-icon" aria-hidden="true">
            <img class="publish-action-icon" src="${escapeHtml(githubPublishIconAsset)}" alt="" />
          </span>
          <span class="pane-menu-item-text">GitHub</span>
          <span class="pane-menu-item-trailing" aria-hidden="true">↗</span>
        </button>
        <button class="pane-menu-item publish-action-button" data-prompt-modal-key="publishAzureDevOps" type="button" title="Show Azure DevOps publish prompt" aria-label="Show Azure DevOps publish prompt">
          <span class="pane-menu-item-icon" aria-hidden="true">
            <img class="publish-action-icon" src="${escapeHtml(azureDevOpsPublishIconAsset)}" alt="" />
          </span>
          <span class="pane-menu-item-text">DevOps</span>
          <span class="pane-menu-item-trailing" aria-hidden="true">↗</span>
        </button>
        <button class="pane-menu-item publish-action-button" data-publish-info-target="jira" type="button" title="Publish backlog on Jira" aria-label="Publish backlog on Jira">
          <span class="pane-menu-item-icon" aria-hidden="true">
            <img class="publish-action-icon" src="${escapeHtml(jiraPublishIconAsset)}" alt="" />
          </span>
          <span class="pane-menu-item-text">Jira</span>
          <span class="pane-menu-item-trailing" aria-hidden="true">↗</span>
        </button>
      </div>
    `;
}

function renderPublishInfoModal() {
    if (state.activePublishInfoTarget !== 'jira') {
        return '';
    }

    return `
      <div class="modal-overlay" id="publish-info-modal-overlay" role="presentation">
        <section class="modal-card prompt-modal-card" id="publish-info-modal" role="dialog" aria-modal="true" aria-labelledby="publish-info-modal-title">
          <button class="modal-close" id="close-publish-info-modal" type="button" aria-label="Close dialog">✕</button>
          <div class="modal-hero prompt-modal-hero">
            <div class="modal-hero-icon" aria-hidden="true">🌀</div>
            <div>
              <span class="kicker">Publish Backlog</span>
              <h2 id="publish-info-modal-title">Jira publishing</h2>
              <p>
                Jira publishing is not configured in this demo yet, but this button is reserved for a future Jira backlog publishing flow.
              </p>
            </div>
          </div>
        </section>
      </div>
    `;
}

function bindAssignMenu() {
    document.getElementById('toggle-assign-menu')?.addEventListener('click', () => {
        state.activePaneMenuKey = null;
        state.isAssignMenuOpen = !state.isAssignMenuOpen;
        render();
    });

    document.querySelectorAll('[data-assignee-id]').forEach((input) => {
        input.addEventListener('change', () => {
            toggleAssignee(input.dataset.assigneeId);
        });
    });
}

function bindAgentPreviewModal() {
    document.getElementById('close-agent-preview-modal')?.addEventListener('click', closeAgentPreviewModal);
    document.getElementById('agent-preview-modal-overlay')?.addEventListener('click', (event) => {
        if (event.target.id === 'agent-preview-modal-overlay') {
            closeAgentPreviewModal();
        }
    });
}

function bindPaneMenus() {
    document.querySelectorAll('[data-pane-menu-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const paneKey = button.dataset.paneMenuToggle;
            state.isAssignMenuOpen = false;
            state.activePaneMenuKey = state.activePaneMenuKey === paneKey ? null : paneKey;
            render();
        });
    });
}

function bindGlobalInteractions() {
    if (!hasBoundGlobalKeyboardHandler) {
        document.addEventListener('keydown', handleGlobalKeydown);
        hasBoundGlobalKeyboardHandler = true;
    }

    if (!hasBoundGlobalClickHandler) {
        document.addEventListener('click', handleGlobalClick);
        hasBoundGlobalClickHandler = true;
    }
}

function handleGlobalKeydown(event) {
    if (event.key !== 'Escape') {
        return;
    }

    if (state.isAgentPreviewOpen) {
        closeAgentPreviewModal();
        return;
    }

    if (state.activePublishInfoTarget) {
        closePublishInfoModal();
        return;
    }

    if (state.activePromptKey) {
        closePromptModal();
        return;
    }

    if (state.activePaneMenuKey) {
        state.activePaneMenuKey = null;
        render();
        return;
    }

    if (state.isAssignMenuOpen) {
        state.isAssignMenuOpen = false;
        render();
    }
}

function handleGlobalClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    const clickedPaneMenu = target.closest('.pane-menu-shell');
    const clickedAssignShell = target.closest('.assign-shell');

    if (state.activePaneMenuKey && !clickedPaneMenu) {
        state.activePaneMenuKey = null;
        render();
        return;
    }

    if (state.isAssignMenuOpen && !clickedAssignShell) {
        state.isAssignMenuOpen = false;
        render();
    }
}

function bindPublishInfoActions() {
    document.querySelectorAll('[data-publish-info-target]').forEach((button) => {
        button.addEventListener('click', () => {
            state.activePublishInfoTarget = button.dataset.publishInfoTarget;
            state.activePaneMenuKey = null;
            render();
        });
    });

    document.getElementById('close-publish-info-modal')?.addEventListener('click', closePublishInfoModal);
    document.getElementById('publish-info-modal-overlay')?.addEventListener('click', (event) => {
        if (event.target.id === 'publish-info-modal-overlay') {
            closePublishInfoModal();
        }
    });
}

function closePromptModal() {
    if (!state.activePromptKey) {
        return;
    }

    state.activePromptKey = null;
    state.activePaneMenuKey = null;
    render();
}

function closePublishInfoModal() {
    if (!state.activePublishInfoTarget) {
        return;
    }

    state.activePublishInfoTarget = null;
    render();
}
function closeAgentPreviewModal() {
    if (!state.isAgentPreviewOpen) {
        return;
    }

    state.isAgentPreviewOpen = false;
    render();
}

function toggleAssignee(assigneeId) {
    if (!assigneeId) {
        return;
    }

    const isSelected = state.selectedAssignees.includes(assigneeId);

    if (isSelected) {
        state.selectedAssignees = state.selectedAssignees.filter((id) => id !== assigneeId);
    } else {
        state.selectedAssignees = [...state.selectedAssignees, assigneeId];
    }

    if (assigneeId === 'github-coding-agent' && !isSelected) {
        state.isAssignMenuOpen = false;
        state.activePaneMenuKey = null;
        state.activePromptKey = null;
        state.isAgentPreviewOpen = true;
    }

    render();
}

function decorateRequirementsHtml(html, sections) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const firstHeading = doc.body.querySelector('h1');
    if (firstHeading?.textContent?.trim() === 'Requirements Document') {
        firstHeading.remove();
    }
    const headings = [...doc.body.querySelectorAll('h2, h3')];

    headings.forEach((heading, index) => {
        const section = sections[index];
        if (!section) {
            return;
        }

        heading.id = section.id;
        heading.classList.add('section-anchor');
    });

    return doc.body.innerHTML;
}

function loadPaneWidths() {
    try {
        return JSON.parse(window.localStorage.getItem('stageVisualizerPaneWidths') || '{}');
    } catch {
        return {};
    }
}

function persistPaneWidths() {
    window.localStorage.setItem('stageVisualizerPaneWidths', JSON.stringify(state.paneWidths));
}

function clampWidth(width) {
    return Math.max(minPaneWidth, Math.min(maxPaneWidth, Math.round(width)));
}

function summaryPill(value, label) {
    return `
    <div class="summary-pill">
      <strong>${escapeHtml(String(value))}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function getAssetPath(fileName) {
    return new URL(`./assets/${fileName}`, document.baseURI).toString();
}

function getDataEndpoint() {
    return document.querySelector('meta[name="scopilot-data-endpoint"]')?.getAttribute('content') || '/api/stages';
}

function formatDateTime(value) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
