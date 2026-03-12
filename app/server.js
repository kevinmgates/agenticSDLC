import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadStageData } from './lib/stage-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 4173);

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
