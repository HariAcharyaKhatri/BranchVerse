import fs from 'node:fs';
import path from 'node:path';

const cpDir = path.resolve('temp_downloads/cyberpunk_street/cyberpunk-street-files/PNG');
if (fs.existsSync(cpDir)) {
  fs.readdirSync(cpDir).forEach(f => console.log('CP file:', f));
}
