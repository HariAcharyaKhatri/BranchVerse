import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('public/data/assets-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Filter characters to only those whose files actually exist
const validCharacters = [];
for (const char of manifest.characters) {
  const defaultFile = path.resolve('public', char.defaultPath.replace(/^\//, ''));
  if (fs.existsSync(defaultFile)) {
    const validExpressions = {};
    for (const [exp, p] of Object.entries(char.expressions || {})) {
      const expFile = path.resolve('public', p.replace(/^\//, ''));
      if (fs.existsSync(expFile)) {
        validExpressions[exp] = p;
      } else {
        validExpressions[exp] = char.defaultPath;
      }
    }
    char.expressions = validExpressions;
    validCharacters.push(char);
  } else {
    console.warn(`Removing missing character from manifest: ${char.id} (${char.defaultPath})`);
  }
}

// Filter backgrounds to only those whose files actually exist
const validBackgrounds = [];
for (const bg of manifest.backgrounds) {
  const bgFile = path.resolve('public', bg.path.replace(/^\//, ''));
  if (fs.existsSync(bgFile)) {
    validBackgrounds.push(bg);
  } else {
    console.warn(`Removing missing background from manifest: ${bg.id} (${bg.path})`);
  }
}

manifest.characters = validCharacters;
manifest.backgrounds = validBackgrounds;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`Validated manifest: ${manifest.characters.length} characters, ${manifest.backgrounds.length} backgrounds verified on disk!`);
