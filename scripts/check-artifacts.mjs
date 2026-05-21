import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const blockedDirs = new Set([
    'output',
    'outputs',
    'test-results',
    'playwright-report',
    'coverage',
    'screenshots',
    'tmp',
    'temp',
    '.nyc_output',
    'debug-output',
]);

const blockedFilePatterns = [
    /\.trace\.zip$/i,
    /\.trace$/i,
    /\.log$/i,
    /\.har$/i,
    /(?:^|-)screenshot-?.*\.png$/i,
    /^debug-.*\.json$/i,
    /\.webm$/i,
    /\.mp4$/i,
];

const skipDirs = new Set(['.git', 'node_modules']);
const found = [];

scan('.');

if (found.length) {
    console.error('Generated/test artifact check failed:');
    for (const item of found) console.error(`- ${item}`);
    process.exit(1);
}

console.log('No generated/test artifacts found.');

function scan(dir) {
    for (const entry of readdirSync(dir)) {
        if (dir === '.' && skipDirs.has(entry)) continue;
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
            if (blockedDirs.has(entry)) {
                found.push(full);
                continue;
            }
            if (!skipDirs.has(entry)) scan(full);
            continue;
        }
        if (blockedFilePatterns.some((pattern) => pattern.test(entry))) found.push(full);
    }
}
