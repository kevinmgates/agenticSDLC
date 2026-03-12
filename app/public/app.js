const appRoot = document.getElementById('app');

const state = {
    data: null,
    loading: true,
    error: null,
    selectedEpicId: null,
    selectedFeatureId: null,
    selectedStoryId: null,
  isCodingAgentModalOpen: false,
    paneWidths: loadPaneWidths(),
};

let hasBoundModalKeyboardHandler = false;

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

bootstrap();

async function bootstrap() {
    await loadData();
}

async function loadData() {
    state.loading = true;
    state.error = null;
    render();

    try {
        const response = await fetch('/api/stages');
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

    appRoot.innerHTML = `
    <main class="app-shell">
      <section class="hero">
        <article class="hero-card">
          <span class="kicker">Agentic SDLC Visualizer</span>
          <h1>Ship Faster. Start Smarter.</h1>
          <p>AI agents that transform scoping calls into structured backlogs in minutes, not days.</p>
        </article>
        <aside class="summary-card">
          <div>
            <strong>Stage snapshot</strong>
            <div class="subtle">Generated from local files in real time whenever you refresh.</div>
          </div>
          <div class="summary-grid">
            ${summaryPill(data.summary.epicCount, 'Epics')}
            ${summaryPill(data.summary.featureCount, 'Features')}
            ${summaryPill(data.summary.userStoryCount, 'User stories')}
            ${summaryPill(data.summary.specCount, 'Specs')}
          </div>
        </aside>
      </section>

      <section class="columns-shell" id="columns-shell">
        ${renderTranscriptColumn(data.transcript)}
        ${renderRequirementsColumn(data.requirements)}
        ${renderEpicsColumn(data.epics, selectedEpic)}
        ${renderFeaturesColumn(featuresForEpic, selectedFeature, selectedEpic)}
        ${renderStoriesColumn(storiesForFeature, selectedStory, selectedFeature)}
        ${renderDetailColumn(selectedFeature, selectedStory, selectedSpec)}
      </section>
      ${renderCodingAgentModal()}
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
    bindCodingAgentModal();

    if (focusColumnId) {
        scrollColumnIntoView(focusColumnId);
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
            <h2>1. Transcript</h2>
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
            <h2>2. Requirements</h2>
            <div class="column-subtitle">Structured needs extracted from the transcript and organized into project, functional, non-functional, and integration views.</div>
          </div>
          <span class="badge">${requirements.sections.length}</span>
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
            <h2>3. Epics</h2>
            <div class="column-subtitle">Strategic workstreams derived from the requirements set.</div>
          </div>
          <div class="column-header-actions">
            ${renderGithubFilterLink({
                href: `${githubRepoBaseUrl}/milestones`,
                label: 'GitHub',
                title: 'Open GitHub milestones for epics',
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
            <h2>4. Features</h2>
            <div class="column-subtitle">Feature breakdown for ${escapeHtml(selectedEpic.id)} — ${escapeHtml(selectedEpic.title)}.</div>
          </div>
          <div class="column-header-actions">
            ${renderGithubFilterLink({
                href: `${githubRepoBaseUrl}/issues?q=${encodeURIComponent('is:issue [FEATURE]')}`,
                label: 'GitHub',
                title: 'Open GitHub issues filtered to features',
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
            <h2>5. User Stories</h2>
            <div class="column-subtitle">Delivery-ready stories for ${escapeHtml(selectedFeature.id)} — ${escapeHtml(selectedFeature.title)}.</div>
          </div>
          <div class="column-header-actions">
            ${renderGithubFilterLink({
                href: `${githubRepoBaseUrl}/issues?q=${encodeURIComponent('is:issue [STORY]')}`,
                label: 'GitHub',
                title: 'Open GitHub issues filtered to user stories',
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
            <h2>6. Feature Spec</h2>
            <div class="column-subtitle">Implementation context, selected story focus, and the full spec document.</div>
          </div>
          <div class="column-header-actions">
            <button class="agent-button" id="open-coding-agent-modal" type="button" aria-haspopup="dialog" aria-expanded="${state.isCodingAgentModalOpen ? 'true' : 'false'}">
              <span class="agent-button-icon" aria-hidden="true">✦</span>
              <span>Send to GitHub Coding Agent</span>
            </button>
            <span class="badge">${selectedFeature && selectedSpec ? 'Spec' : 'Draft'}</span>
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

function renderGithubFilterLink({ href, label, title }) {
    return `
      <a class="github-filter-link" href="${escapeHtml(href)}" target="_blank" rel="noreferrer" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">
        <span class="github-filter-icon" aria-hidden="true">↗</span>
        <span>${escapeHtml(label)}</span>
      </a>
    `;
}

function renderCodingAgentModal() {
    if (!state.isCodingAgentModalOpen) {
        return '';
    }

    return `
      <div class="modal-overlay" id="coding-agent-modal-overlay" role="presentation">
        <section class="modal-card" id="coding-agent-modal" role="dialog" aria-modal="true" aria-labelledby="coding-agent-modal-title">
          <button class="modal-close" id="close-coding-agent-modal" type="button" aria-label="Close dialog">✕</button>
          <div class="modal-hero">
            <div class="modal-hero-icon" aria-hidden="true">🤖</div>
            <div>
              <span class="kicker">GitHub.com workflow</span>
              <h2 id="coding-agent-modal-title">Run coding agents with a clean handoff</h2>
              <p>
                Use GitHub.com as the control plane: define the work, launch the agent, review the generated branch or pull request, and iterate until it is ready to merge.
              </p>
            </div>
          </div>
          <figure class="modal-image-frame">
            <img
              class="modal-image"
              src="https://github.blog/wp-content/uploads/2025/09/GitHub-Copilot-Changelog-Sept-25-2025-1.webp?fit=2048%2C1075"
              alt="GitHub Coding Agent workflow visual"
            />
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

  function bindCodingAgentModal() {
    document.getElementById('open-coding-agent-modal')?.addEventListener('click', () => {
      state.isCodingAgentModalOpen = true;
      render();
    });

    document.getElementById('close-coding-agent-modal')?.addEventListener('click', closeCodingAgentModal);
    document.getElementById('coding-agent-modal-overlay')?.addEventListener('click', (event) => {
      if (event.target.id === 'coding-agent-modal-overlay') {
        closeCodingAgentModal();
      }
    });

    if (!hasBoundModalKeyboardHandler) {
      document.addEventListener('keydown', handleCodingAgentModalKeydown);
      hasBoundModalKeyboardHandler = true;
    }
  }

  function handleCodingAgentModalKeydown(event) {
    if (event.key === 'Escape' && state.isCodingAgentModalOpen) {
      closeCodingAgentModal();
    }
  }

  function closeCodingAgentModal() {
    if (!state.isCodingAgentModalOpen) {
      return;
    }

    state.isCodingAgentModalOpen = false;
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
