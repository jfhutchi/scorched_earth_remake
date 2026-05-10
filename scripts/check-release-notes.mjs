import { readFileSync } from 'node:fs';

const expected = process.argv[2] || 'v0.7.0';
const text = readFileSync('RELEASE_NOTES.md', 'utf8');
const headings = [...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
const first = headings[0] || '';

if (first !== `${expected} - Pending`) {
    console.error(`RELEASE_NOTES.md top entry must be "## ${expected} - Pending". Found: "${first || 'none'}"`);
    process.exit(1);
}

console.log(`Release notes top entry is ${expected} - Pending.`);
