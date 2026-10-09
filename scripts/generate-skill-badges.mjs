import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Static badges keep the profile independent of image services at render time.
// Logos come from Simple Icons via Shields and from Lobe Icons for AI brands.
const badges = [
  { id: 'python', label: 'PYTHON', color: '3776AB', logo: 'python' },
  { id: 'typescript', label: 'TYPESCRIPT', color: '3178C6', logo: 'typescript' },
  { id: 'nextjs', label: 'NEXT.JS', color: '111111', logo: 'nextdotjs' },
  { id: 'pytorch', label: 'PYTORCH', color: 'B9341B', logo: 'pytorch' },
  { id: 'docker', label: 'DOCKER', color: '008EBC', logo: 'docker' },
  { id: 'fastapi', label: 'FASTAPI', color: '007F83', logo: 'fastapi' },
  { id: 'mongodb', label: 'MONGODB', color: '3A862B', logo: 'mongodb' },
  { id: 'azure', label: 'AZURE', color: '0078D4', lobe: 'azure' },
  { id: 'claude', label: 'CLAUDE', color: 'C96A4E', lobe: 'claude' },
  { id: 'openai', label: 'OPENAI', color: '4B3290', lobe: 'openai' },
  { id: 'langchain', label: 'LANGCHAIN', color: '205052', lobe: 'langchain' },
  { id: 'langfuse', label: 'LANGFUSE', color: 'C8102E', lobe: 'langfuse' },
  { id: 'databricks', label: 'DATABRICKS', color: 'D42D17', logo: 'databricks' },
];

const outputDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/skills');
await mkdir(outputDir, { recursive: true });

async function getText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.text();
}

for (const badge of badges) {
  let logo = badge.logo;
  if (badge.lobe) {
    const icon = await getText(
      `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${badge.lobe}.svg`,
    );
    logo = `data:image/svg+xml;base64,${Buffer.from(icon.replaceAll('currentColor', '#fff')).toString('base64')}`;
  }

  const url = new URL(`https://img.shields.io/badge/${encodeURIComponent(badge.label)}-${badge.color}`);
  url.search = new URLSearchParams({ style: 'for-the-badge', logo, logoColor: 'white' });
  const svg = await getText(url);
  if (!svg.includes('<image ')) throw new Error(`Missing logo in ${badge.id} badge`);
  await writeFile(path.join(outputDir, `${badge.id}.svg`), svg);
  process.stdout.write(`${badge.id}\n`);
}
