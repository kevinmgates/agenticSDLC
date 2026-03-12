import express from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const app = express();
const port = Number(process.env.PORT || 4173);

marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false,
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/stages', async (_req, res) => {
    try {
        const data = await loadStageData();
        res.json(data);
    } catch (error) {
        console.error('Failed to load stage data:', error);
        res.status(500).json({
            error: 'Failed to load stage data.',
            details: error instanceof Error ? error.message : String(error),
        });
    }
});

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`SDLC stage visualizer running at http://localhost:${port}`);
});

async function loadStageData() {
    const transcriptPath = path.join(workspaceRoot, 'stages', '01-transcript', 'meeting-transcript.md');
    const requirementsPath = path.join(workspaceRoot, 'stages', '02-requirements', 'requirements.md');
    const epicsPath = path.join(workspaceRoot, 'stages', '03-backlog', 'epics.json');
    const featuresPath = path.join(workspaceRoot, 'stages', '03-backlog', 'features.json');
    const userStoriesPath = path.join(workspaceRoot, 'stages', '03-backlog', 'user-stories.json');
    const specsDir = path.join(workspaceRoot, 'stages', '03-backlog', 'specs');

    const [transcriptMarkdown, requirementsMarkdown, epics, features, userStories, specs] = await Promise.all([
        readText(transcriptPath),
        readText(requirementsPath),
        readJson(epicsPath),
        readJson(featuresPath),
        readJson(userStoriesPath),
        readSpecs(specsDir),
    ]);

    const featuresByEpic = groupBy(features, 'epic_id');
    const storiesByFeature = groupBy(userStories, 'feature_id');
    const specByFeatureId = Object.fromEntries(specs.map((spec) => [spec.featureId, spec]));

    const enrichedEpics = epics.map((epic) => ({
        ...epic,
        featureCount: (featuresByEpic[epic.id] || []).length,
        userStoryCount: (featuresByEpic[epic.id] || []).reduce(
            (count, feature) => count + (storiesByFeature[feature.id] || []).length,
            0,
        ),
    }));

    const enrichedFeatures = features.map((feature) => ({
        ...feature,
        userStoryCount: (storiesByFeature[feature.id] || []).length,
        hasSpec: Boolean(specByFeatureId[feature.id]),
        specTitle: specByFeatureId[feature.id]?.title || null,
        specPath: specByFeatureId[feature.id]?.path || null,
    }));

    const enrichedStories = userStories.map((story) => ({
        ...story,
        taskCount: story.tasks.length,
        acceptanceCriteriaCount: story.acceptance_criteria.length,
    }));

    return {
        generatedAt: new Date().toISOString(),
        workspaceRoot,
        summary: {
            transcriptWords: countWords(transcriptMarkdown),
            requirementWords: countWords(requirementsMarkdown),
            epicCount: enrichedEpics.length,
            featureCount: enrichedFeatures.length,
            userStoryCount: enrichedStories.length,
            specCount: specs.length,
        },
        transcript: {
            title: 'Transcript',
            path: relativeToWorkspace(transcriptPath),
            markdown: transcriptMarkdown,
            html: marked.parse(transcriptMarkdown),
        },
        requirements: {
            title: 'Requirements',
            path: relativeToWorkspace(requirementsPath),
            markdown: requirementsMarkdown,
            html: marked.parse(requirementsMarkdown),
            sections: extractSections(requirementsMarkdown),
        },
        epics: enrichedEpics,
        features: enrichedFeatures,
        userStories: enrichedStories,
        specs,
    };
}

async function readText(filePath) {
    return fs.readFile(filePath, 'utf8');
}

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function readSpecs(specsDir) {
    const entries = await fs.readdir(specsDir, { withFileTypes: true });
    const files = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b));

    const specs = await Promise.all(
        files.map(async (fileName) => {
            const filePath = path.join(specsDir, fileName);
            const markdown = await readText(filePath);
            const featureId = fileName.match(/^(FEAT-\d{3})/)?.[1] || null;
            const title = markdown.match(/^#\s+Spec:\s+(.+)$/m)?.[1] || fileName;

            return {
                featureId,
                title,
                fileName,
                path: relativeToWorkspace(filePath),
                markdown,
                html: marked.parse(markdown),
            };
        }),
    );

    return specs;
}

function extractSections(markdown) {
    return markdown
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^##\s+/.test(line) || /^###\s+/.test(line))
        .map((line) => {
            const level = line.startsWith('###') ? 3 : 2;
            const title = line.replace(/^###?\s+/, '');
            return {
                id: title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, ''),
                level,
                title,
            };
        });
}

function groupBy(items, key) {
    return items.reduce((groups, item) => {
        const value = item[key];
        groups[value] ||= [];
        groups[value].push(item);
        return groups;
    }, {});
}

function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function relativeToWorkspace(targetPath) {
    return path.relative(workspaceRoot, targetPath).split(path.sep).join('/');
}
