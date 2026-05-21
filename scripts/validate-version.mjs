import { readFileSync } from 'node:fs';

const expected = process.argv[2] || 'v0.7.1';
const checks = [
    {
        file: 'src/config.js',
        test: (text) => text.includes(`export const GAME_VERSION = '${expected}'`)
            || text.includes(`export const GAME_VERSION = "${expected}"`),
        message: `central GAME_VERSION must be ${expected}`,
    },
    {
        file: 'src/main.js',
        test: (text) => text.includes('window.GAME_VERSION = GAME_VERSION'),
        message: 'window.GAME_VERSION assignment must remain present',
    },
    {
        file: 'index.html',
        test: (text) => text.includes(expected),
        message: `index.html fallback/menu version must mention ${expected}`,
    },
    {
        file: 'README.md',
        test: (text) => text.includes(expected),
        message: `README.md must mention ${expected}`,
    },
    {
        file: 'TESTING.md',
        test: (text) => text.includes(expected),
        message: `TESTING.md must mention ${expected}`,
    },
    {
        file: 'progress.md',
        test: (text) => text.includes(`Current Version: ${expected}`),
        message: `progress.md Current Version must be ${expected}`,
    },
    {
        file: 'RELEASE_NOTES.md',
        test: (text) => text.includes(`## ${expected} - Pending`),
        message: `RELEASE_NOTES.md must contain a ${expected} Pending entry`,
    },
    {
        file: 'BALANCE.md',
        test: (text) => text.includes(expected),
        message: `BALANCE.md must mention ${expected}`,
    },
    {
        file: 'manifest.webmanifest',
        test: (text) => text.includes('Crater Command') && text.includes('Crater'),
        message: 'manifest.webmanifest must contain Crater Command PWA names',
    },
];

const failures = [];
for (const check of checks) {
    const text = readFileSync(check.file, 'utf8');
    if (!check.test(text)) failures.push(`${check.file}: ${check.message}`);
}

if (failures.length) {
    console.error(`Version validation failed for ${expected}:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log(`Version validation passed for ${expected}.`);
