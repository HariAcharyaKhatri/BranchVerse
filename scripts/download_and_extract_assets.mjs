import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const TEMP_DIR = path.resolve('temp_downloads');
const _ASSETS_DIR = path.resolve('public/assets');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

async function downloadFile(url, destPath) {
  console.log(`Downloading ${url} ...`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
  console.log(`Saved ${(buffer.byteLength / 1024).toFixed(1)} KB -> ${destPath}`);
}

async function run() {
  console.log('--- Step 1: Downloading legitimate CC0 and CC-BY Anime Visual Novel Assets ---');

  const downloads = [
    // Visual Novel Style Backgrounds
    {
      url: 'https://opengameart.org/sites/default/files/visual%20novel%20style%20backgrounds.zip',
      name: 'vn_style_bgs.zip',
      type: 'zip'
    },
    // Character Sprites (CC0)
    {
      url: 'https://opengameart.org/sites/default/files/character_5.zip',
      name: 'character_falling_air.zip',
      type: 'zip'
    },
    // Kuudere Character Sprites (CC-BY 4.0)
    {
      url: 'https://opengameart.org/sites/default/files/kuudere_lisadikaprio.zip',
      name: 'kuudere_sprites.zip',
      type: 'zip'
    },
    // Cyberpunk Street Environment (CC-BY 3.0)
    {
      url: 'https://opengameart.org/sites/default/files/cyberpunk-street-files.zip',
      name: 'cyberpunk_street.zip',
      type: 'zip'
    },
    // Sci-Fi Background (CC0)
    {
      url: 'https://opengameart.org/sites/default/files/sci_fi_bg_freebie_ask4asset.com_.zip',
      name: 'scifi_bg.zip',
      type: 'zip'
    },
    // Mixed Fantasy Backgrounds (CC0)
    { url: 'https://opengameart.org/sites/default/files/d5_by_olracadejup-d4ohcil.jpg', name: 'fantasy_temple.jpg', type: 'file' },
    { url: 'https://opengameart.org/sites/default/files/d8_by_olracadejup-d4ohcv3.jpg', name: 'fantasy_citadel.jpg', type: 'file' },
    { url: 'https://opengameart.org/sites/default/files/d12_by_olracadejup-d4ohdnf.jpg', name: 'fantasy_woods.jpg', type: 'file' },
    { url: 'https://opengameart.org/sites/default/files/d15_by_olracadejup-d4ohdt8.jpg', name: 'fantasy_canyon.jpg', type: 'file' },
    { url: 'https://opengameart.org/sites/default/files/d20_by_olracadejup-d4ohdvm.jpg', name: 'fantasy_valley.jpg', type: 'file' },
    { url: 'https://opengameart.org/sites/default/files/d24_by_olracadejup-d4ohe4u.jpg', name: 'fantasy_shrine.jpg', type: 'file' },
    { url: 'https://opengameart.org/sites/default/files/d27_by_olracadejup-d4ohe8m.jpg', name: 'fantasy_mountains.jpg', type: 'file' },
    // School / Interiors / Forest
    { url: 'https://opengameart.org/sites/default/files/entrance_-_brightly_lit.png', name: 'school_hallway_day.png', type: 'file' },
    { url: 'https://opengameart.org/sites/default/files/entrance_-_dark_night.png', name: 'school_hallway_night.png', type: 'file' },
    { url: 'https://opengameart.org/sites/default/files/audi_scaled_1.png', name: 'school_auditorium.png', type: 'file' },
    { url: 'https://opengameart.org/sites/default/files/environment_forestbackground.png', name: 'forest_mystic.png', type: 'file' },
    { url: 'https://opengameart.org/sites/default/files/environment_forest_evening.png', name: 'forest_dusk.png', type: 'file' }
  ];

  for (const item of downloads) {
    const dest = path.join(TEMP_DIR, item.name);
    if (!fs.existsSync(dest)) {
      try {
        await downloadFile(item.url, dest);
      } catch (err) {
        console.warn(`Warning downloading ${item.name}: ${err.message}`);
      }
    } else {
      console.log(`Already downloaded: ${item.name}`);
    }
  }

  console.log('\n--- Step 2: Extracting archives ---');
  const zips = fs.readdirSync(TEMP_DIR).filter(f => f.endsWith('.zip'));
  for (const zip of zips) {
    const zipPath = path.join(TEMP_DIR, zip);
    const extractTo = path.join(TEMP_DIR, path.basename(zip, '.zip'));
    if (!fs.existsSync(extractTo)) {
      fs.mkdirSync(extractTo, { recursive: true });
      try {
        console.log(`Extracting ${zip} -> ${extractTo} ...`);
        execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractTo}' -Force"`, { stdio: 'inherit' });
      } catch (err) {
        console.error(`Failed to extract ${zip}:`, err.message);
      }
    }
  }

  console.log('\nDone with download & extraction phase.');
}

run().catch(console.error);
