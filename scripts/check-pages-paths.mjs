import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = ['index.html', 'styles.css', 'manifest.webmanifest'];
collectJs('src');

const failures = [];
for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const checks = [
        { pattern: /\b(?:src|href)=["']\/(?!\/)/gi, message: 'root-relative src/href' },
        { pattern: /url\(\s*["']?\/(?!\/)/gi, message: 'root-relative CSS url()' },
        { pattern: /\b(?:src|href)=["']https?:\/\//gi, message: 'runtime external src/href' },
    ];
    for (const check of checks) {
        if (check.pattern.test(text)) failures.push(`${file}: ${check.message}`);
    }
    if (file.endsWith('.webmanifest')) {
        const manifest = JSON.parse(text);
        const pathValues = [
            manifest.start_url,
            manifest.scope,
            ...(Array.isArray(manifest.icons) ? manifest.icons.map((icon) => icon.src) : []),
        ].filter(Boolean);
        for (const value of pathValues) {
            if (/^(?:\/(?!\/)|https?:\/\/)/i.test(value)) {
                failures.push(`${file}: manifest path must be GitHub Pages-relative: ${value}`);
            }
        }
    }
}

if (failures.length) {
    console.error('GitHub Pages path check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('GitHub Pages path check passed.');

function collectJs(dir) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) collectJs(full);
        else if (/\.js$/i.test(entry)) files.push(full);
    }
}
