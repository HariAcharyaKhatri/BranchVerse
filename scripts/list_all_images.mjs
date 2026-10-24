import fs from 'node:fs';
import path from 'node:path';

function findPngs(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === '__MACOSX') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      findPngs(full, list);
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(e.name)) {
      list.push(full);
    }
  }
  return list;
}

const all = findPngs(path.resolve('temp_downloads'));
console.log(`Total image files found: ${all.length}`);
all.slice(0, 40).forEach(p => console.log(' -', path.relative(path.resolve('temp_downloads'), p)));
