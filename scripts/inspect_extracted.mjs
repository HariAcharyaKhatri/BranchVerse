import fs from 'node:fs';
import path from 'node:path';

const TEMP = path.resolve('temp_downloads');

function listDir(dir, depth = 0) {
  if (depth > 2) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const indent = '  '.repeat(depth);
    if (e.isDirectory()) {
      console.log(`${indent}[DIR] ${e.name}`);
      listDir(full, depth + 1);
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        const stats = fs.statSync(full);
        console.log(`${indent}- ${e.name} (${(stats.size / 1024).toFixed(1)} KB)`);
      }
    }
  }
}

listDir(TEMP);
