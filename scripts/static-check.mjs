import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['src', 'scripts'];
const files = [];

for (const root of roots) collect(root);

let failed = false;
for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
    if (result.status !== 0) failed = true;
}

if (failed) {
    process.exitCode = 1;
} else {
    console.log(`Syntax check passed for ${files.length} JavaScript files.`);
}

function collect(dir) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
            collect(full);
        } else if (/\.(js|mjs)$/i.test(entry)) {
            files.push(full);
        }
    }
}
