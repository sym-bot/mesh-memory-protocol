import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(join(root, 'artifact-manifest.json'), 'utf8'));

if (manifest.sourceRepository !== 'https://github.com/sym-bot/meshcognition-website') {
  throw new Error(`Unexpected normative source: ${manifest.sourceRepository}`);
}

for (const [relativePath, expected] of Object.entries(manifest.files)) {
  const bytes = await readFile(join(root, relativePath));
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== expected) {
    throw new Error(`${relativePath} differs from the normative source: expected ${expected}, got ${actual}`);
  }
  JSON.parse(bytes.toString('utf8'));
}

console.log(`Verified ${Object.keys(manifest.files).length} mirrored MMP ${manifest.specificationVersion} artifacts`);
