import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadStageData } from '../lib/stage-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const publicDir = path.join(appRoot, 'public');
const outputDir = path.join(appRoot, 'static');

await buildStaticSite();

async function buildStaticSite() {
    const sourceData = await loadStageData();
    const data = {
        ...sourceData,
        workspaceRoot: '.',
    };

    await fs.rm(outputDir, { recursive: true, force: true });
    await fs.cp(publicDir, outputDir, { recursive: true });
    await fs.mkdir(path.join(outputDir, 'data'), { recursive: true });

    await fs.writeFile(
        path.join(outputDir, 'data', 'stages.json'),
        JSON.stringify(data, null, 2),
        'utf8',
    );

    const sourceHtml = await fs.readFile(path.join(publicDir, 'index.html'), 'utf8');
    const staticHtml = sourceHtml
        .replace('</title>', '</title>\n    <meta name="scopilot-data-endpoint" content="./data/stages.json" />')
        .replace('href="/styles.css"', 'href="./styles.css"')
        .replace('src="/app.js"', 'src="./app.js"');

    await Promise.all([
        fs.writeFile(path.join(outputDir, 'index.html'), staticHtml, 'utf8'),
        fs.writeFile(path.join(outputDir, '404.html'), staticHtml, 'utf8'),
        fs.writeFile(path.join(outputDir, '.nojekyll'), '', 'utf8'),
    ]);

    console.log(`Static Scopilot site generated at ${outputDir}`);
}
