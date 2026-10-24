import fs from 'node:fs';
import path from 'node:path';

const TEMP = path.resolve('temp_downloads');
const PUBLIC_ASSETS = path.resolve('public/assets');
const PUBLIC_DATA = path.resolve('public/data');

// Ensure destination directories
const dirs = [
  'characters/protagonists',
  'characters/supporting',
  'characters/antagonists',
  'backgrounds/fantasy',
  'backgrounds/cyberpunk',
  'backgrounds/cultivation',
  'backgrounds/forest',
  'backgrounds/school',
  'backgrounds/battle',
  'items',
  'placeholders'
];

dirs.forEach(d => {
  const full = path.join(PUBLIC_ASSETS, d);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

if (!fs.existsSync(PUBLIC_DATA)) fs.mkdirSync(PUBLIC_DATA, { recursive: true });

function copyAsset(srcRelative, destRelative) {
  const src = path.join(TEMP, srcRelative);
  const dest = path.join(PUBLIC_ASSETS, destRelative);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${srcRelative} -> ${destRelative}`);
    return true;
  } else {
    console.warn(`File not found: ${src}`);
    return false;
  }
}

// 1. Copy Characters
// Falling Air pack (CC0)
copyAsset('character_falling_air/cha 1/pl1.png', 'characters/protagonists/hari_default.png');
copyAsset('character_falling_air/cha 1/image/pl1 serious.png', 'characters/protagonists/hari_serious.png');
copyAsset('character_falling_air/cha 1/image/pl1 angry.png', 'characters/protagonists/hari_angry.png');
copyAsset('character_falling_air/cha 1/image/pl1 happy.png', 'characters/protagonists/hari_happy.png');

copyAsset('character_falling_air/cha 2/pl2.png', 'characters/protagonists/aria_default.png');
copyAsset('character_falling_air/cha 2/image/pl2 serious.png', 'characters/protagonists/aria_serious.png');
copyAsset('character_falling_air/cha 2/image/pl2 happy.png', 'characters/protagonists/aria_happy.png');

copyAsset('character_falling_air/cha 3/pl3.png', 'characters/supporting/mentor_shen.png');
copyAsset('character_falling_air/cha 4/pl4.png', 'characters/supporting/ronald_guard.png');
copyAsset('character_falling_air/cha 5/pl5.png', 'characters/antagonists/masked_commander.png');

// Kuudere pack (CC-BY 4.0 by LisadiKaprio)
copyAsset('kuudere_sprites/KUUDERE LisadiKaprio/HEAD UP/NORMAL/kuudere normal uniform.png', 'characters/protagonists/kuudere_default.png');
copyAsset('kuudere_sprites/KUUDERE LisadiKaprio/HEAD UP/SMILE/kuudere smile uniform.png', 'characters/protagonists/kuudere_smile.png');
copyAsset('kuudere_sprites/KUUDERE LisadiKaprio/HEAD DOWN/SERIOUS/kuudere serious jacket.png', 'characters/supporting/nyx_fixer.png');

// 2. Copy Backgrounds
// Fantasy (CC0 by olracadejup)
copyAsset('fantasy_citadel.jpg', 'backgrounds/fantasy/aethelgard_citadel.jpg');
copyAsset('fantasy_temple.jpg', 'backgrounds/fantasy/crystal_temple.jpg');
copyAsset('fantasy_canyon.jpg', 'backgrounds/fantasy/canyon_frontier.jpg');
copyAsset('fantasy_mountains.jpg', 'backgrounds/fantasy/highland_mountains.jpg');
copyAsset('fantasy_valley.jpg', 'backgrounds/fantasy/fantasy_valley.jpg');
copyAsset('fantasy_shrine.jpg', 'backgrounds/cultivation/ancestral_shrine.jpg');
copyAsset('fantasy_woods.jpg', 'backgrounds/cultivation/kunlun_mist.jpg');

// Cyberpunk (CC-BY by ansimuz & ask4asset)
copyAsset('cyberpunk_street/cyberpunk-street-files/PNG/cyberpunk-street.png', 'backgrounds/cyberpunk/neokyoto_neon_street.png');
copyAsset('scifi_bg/sci_fi_bg1.jpg', 'backgrounds/cyberpunk/cyber_sublevel_lab.jpg');
copyAsset('vn_style_bgs/bar.png', 'backgrounds/cyberpunk/undercity_bar.png');

// Forest / Nature
copyAsset('forest_mystic.png', 'backgrounds/forest/whisperwood_mystic.png');
copyAsset('forest_dusk.png', 'backgrounds/forest/whisperwood_dusk.png');

// School / Slice of Life
copyAsset('school_hallway_day.png', 'backgrounds/school/academy_hallway_day.png');
copyAsset('school_hallway_night.png', 'backgrounds/school/academy_hallway_night.png');
copyAsset('school_auditorium.png', 'backgrounds/school/academy_auditorium.png');

// Battle / Adventure
copyAsset('vn_style_bgs/outside.png', 'backgrounds/battle/ruined_battleground.png');
copyAsset('vn_style_bgs/green room.png', 'backgrounds/battle/tavern_haven.png');

// 3. Create SVG placeholders
const placeholderSceneSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0d14"/>
      <stop offset="50%" stop-color="#111726"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <radialGradient id="portal" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#312e81" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="600" cy="337" r="300" fill="url(#portal)"/>
  <g fill="none" stroke="#6366f1" stroke-width="2" opacity="0.4">
    <path d="M450 480 L600 200 L750 480 M525 340 L675 340"/>
    <circle cx="600" cy="200" r="16" fill="#f59e0b" stroke="#fbbf24" stroke-width="3"/>
    <circle cx="450" cy="480" r="12" fill="#6366f1"/>
    <circle cx="750" cy="480" r="12" fill="#38bdf8"/>
  </g>
  <text x="600" y="560" fill="#94a3b8" font-family="sans-serif" font-size="22" font-weight="600" text-anchor="middle" letter-spacing="4">BRANCHVERSE CHRONICLE</text>
</svg>`;

const placeholderAvatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
  <defs>
    <linearGradient id="avbg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0a0d14"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="32" fill="url(#avbg)"/>
  <circle cx="200" cy="180" r="70" fill="#312e81" stroke="#6366f1" stroke-width="4"/>
  <path d="M100 420 C100 300, 300 300, 300 420" fill="#312e81" stroke="#6366f1" stroke-width="4"/>
  <circle cx="200" cy="180" r="30" fill="#f59e0b" opacity="0.8"/>
  <text x="200" y="470" fill="#94a3b8" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">HERO AVATAR</text>
</svg>`;

fs.writeFileSync(path.join(PUBLIC_ASSETS, 'placeholders/default_scene.svg'), placeholderSceneSvg);
fs.writeFileSync(path.join(PUBLIC_ASSETS, 'placeholders/default_avatar.svg'), placeholderAvatarSvg);

// 4. Create Assets Manifest
const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  characters: [
    {
      id: 'hari_swordsman',
      name: 'Hari (Blademaster)',
      category: 'protagonists',
      gender: 'Male',
      defaultPath: '/assets/characters/protagonists/hari_default.png',
      expressions: {
        normal: '/assets/characters/protagonists/hari_default.png',
        serious: '/assets/characters/protagonists/hari_serious.png',
        angry: '/assets/characters/protagonists/hari_angry.png',
        happy: '/assets/characters/protagonists/hari_happy.png'
      },
      tags: ['swordsman', 'warrior', 'hero', 'white-hair', 'blade'],
      genres: ['fantasy', 'anime', 'action', 'cultivation'],
      creator: 'FALLiNG_AiR',
      source: 'https://opengameart.org/content/visual-novel-character-sprite',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'aria_spellblade',
      name: 'Aria (Spellblade)',
      category: 'protagonists',
      gender: 'Female',
      defaultPath: '/assets/characters/protagonists/aria_default.png',
      expressions: {
        normal: '/assets/characters/protagonists/aria_default.png',
        serious: '/assets/characters/protagonists/aria_serious.png',
        happy: '/assets/characters/protagonists/aria_happy.png'
      },
      tags: ['spellblade', 'mage', 'heroine', 'sorceress'],
      genres: ['fantasy', 'anime', 'school_life', 'isekai'],
      creator: 'FALLiNG_AiR',
      source: 'https://opengameart.org/content/visual-novel-character-sprite',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'kuudere_scholar',
      name: 'Rei / Kuudere',
      category: 'protagonists',
      gender: 'Female',
      defaultPath: '/assets/characters/protagonists/kuudere_default.png',
      expressions: {
        normal: '/assets/characters/protagonists/kuudere_default.png',
        smile: '/assets/characters/protagonists/kuudere_smile.png'
      },
      tags: ['scholar', 'student', 'calm', 'kuudere', 'netrunner'],
      genres: ['school_life', 'anime', 'cyberpunk', 'mystery', 'romance'],
      creator: 'LisadiKaprio',
      source: 'https://opengameart.org/content/kuudere-visual-novel-sprite',
      license: 'Creative Commons Attribution 4.0 International (CC-BY 4.0)'
    },
    {
      id: 'mentor_shen',
      name: 'Master Shen',
      category: 'supporting',
      defaultPath: '/assets/characters/supporting/mentor_shen.png',
      tags: ['mentor', 'master', 'elder', 'cultivator', 'monk'],
      genres: ['cultivation', 'fantasy', 'action'],
      creator: 'FALLiNG_AiR',
      source: 'https://opengameart.org/content/visual-novel-character-sprite',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'captain_ronald',
      name: 'Captain Ronald',
      category: 'supporting',
      defaultPath: '/assets/characters/supporting/ronald_guard.png',
      tags: ['captain', 'knight', 'vanguard', 'soldier', 'guard'],
      genres: ['fantasy', 'action'],
      creator: 'FALLiNG_AiR',
      source: 'https://opengameart.org/content/visual-novel-character-sprite',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'nyx_fixer',
      name: 'Fixer Nyx',
      category: 'supporting',
      defaultPath: '/assets/characters/supporting/nyx_fixer.png',
      tags: ['fixer', 'informant', 'cyberpunk', 'broker'],
      genres: ['cyberpunk', 'mystery', 'action'],
      creator: 'LisadiKaprio',
      source: 'https://opengameart.org/content/kuudere-visual-novel-sprite',
      license: 'CC-BY 4.0'
    },
    {
      id: 'masked_commander',
      name: 'Masked Commander',
      category: 'antagonists',
      defaultPath: '/assets/characters/antagonists/masked_commander.png',
      tags: ['boss', 'antagonist', 'masked', 'commander', 'void'],
      genres: ['fantasy', 'cyberpunk', 'cultivation'],
      creator: 'FALLiNG_AiR',
      source: 'https://opengameart.org/content/visual-novel-character-sprite',
      license: 'CC0 1.0 Universal (Public Domain)'
    }
  ],
  backgrounds: [
    {
      id: 'bg_aethelgard_citadel',
      title: 'Aethelgard Silver Citadel',
      path: '/assets/backgrounds/fantasy/aethelgard_citadel.jpg',
      category: 'fantasy',
      tags: ['citadel', 'palace', 'kingdom', 'throne', 'silver_spire'],
      worlds: ['aethelgard'],
      genres: ['fantasy', 'mythology', 'adventure'],
      creator: 'olracadejup',
      source: 'https://opengameart.org/content/mixed-fantasy-backgrounds',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'bg_crystal_temple',
      title: 'Runic Crystal Temple',
      path: '/assets/backgrounds/fantasy/crystal_temple.jpg',
      category: 'fantasy',
      tags: ['temple', 'sanctuary', 'magic', 'ruins'],
      worlds: ['aethelgard', 'kunlun'],
      genres: ['fantasy', 'cultivation'],
      creator: 'olracadejup',
      source: 'https://opengameart.org/content/mixed-fantasy-backgrounds',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'bg_highland_mountains',
      title: 'Highland Peaks & Vale',
      path: '/assets/backgrounds/fantasy/highland_mountains.jpg',
      category: 'fantasy',
      tags: ['mountain', 'peaks', 'valen', 'frontier', 'travel'],
      worlds: ['aethelgard', 'kunlun'],
      genres: ['fantasy', 'action', 'adventure'],
      creator: 'olracadejup',
      source: 'https://opengameart.org/content/mixed-fantasy-backgrounds',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'bg_canyon_frontier',
      title: 'Canyon Frontier Pass',
      path: '/assets/backgrounds/fantasy/canyon_frontier.jpg',
      category: 'fantasy',
      tags: ['canyon', 'pass', 'rocks', 'desert', 'wasteland'],
      worlds: ['aethelgard'],
      genres: ['fantasy', 'post_apocalyptic', 'action'],
      creator: 'olracadejup',
      source: 'https://opengameart.org/content/mixed-fantasy-backgrounds',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'bg_whisperwood_mystic',
      title: 'The Whisperwood Sanctuary',
      path: '/assets/backgrounds/forest/whisperwood_mystic.png',
      category: 'forest',
      tags: ['forest', 'woods', 'whisperwood', 'trees', 'nature'],
      worlds: ['aethelgard'],
      genres: ['fantasy', 'supernatural', 'adventure'],
      creator: 'Tamara Ramsay (ramtam)',
      source: 'https://opengameart.org/content/forest-background-art',
      license: 'CC-BY-SA 3.0'
    },
    {
      id: 'bg_whisperwood_dusk',
      title: 'Whisperwood at Dusk',
      path: '/assets/backgrounds/forest/whisperwood_dusk.png',
      category: 'forest',
      tags: ['forest', 'dusk', 'evening', 'night', 'flame'],
      worlds: ['aethelgard'],
      genres: ['fantasy', 'horror', 'mystery'],
      creator: 'Tamara Ramsay (ramtam)',
      source: 'https://opengameart.org/content/forest-background-art',
      license: 'CC-BY-SA 3.0'
    },
    {
      id: 'bg_neokyoto_neon_street',
      title: 'Neo-Kyoto District 4 Underbelly',
      path: '/assets/backgrounds/cyberpunk/neokyoto_neon_street.png',
      category: 'cyberpunk',
      tags: ['city', 'cyberpunk', 'neon', 'rain', 'street', 'shinjuku'],
      worlds: ['neokyoto'],
      genres: ['cyberpunk', 'scifi', 'action'],
      creator: 'ansimuz',
      source: 'https://opengameart.org/content/cyberpunk-street-environment',
      license: 'CC-BY 3.0'
    },
    {
      id: 'bg_cyber_sublevel_lab',
      title: 'Arakawa Biotech Sub-Level',
      path: '/assets/backgrounds/cyberpunk/cyber_sublevel_lab.jpg',
      category: 'cyberpunk',
      tags: ['lab', 'vault', 'cyberdeck', 'scifi', 'tech', 'araka_tower'],
      worlds: ['neokyoto'],
      genres: ['cyberpunk', 'scifi'],
      creator: 'ask4asset.com',
      source: 'https://opengameart.org/content/sci-fi-background',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'bg_undercity_bar',
      title: 'Underground Runner Lounge',
      path: '/assets/backgrounds/cyberpunk/undercity_bar.png',
      category: 'cyberpunk',
      tags: ['bar', 'club', 'lounge', 'tavern', 'fixer'],
      worlds: ['neokyoto', 'aethelgard'],
      genres: ['cyberpunk', 'slice_of_life', 'anime'],
      creator: 'potat0',
      source: 'https://opengameart.org/content/visual-novel-style-backgrounds',
      license: 'CC-BY 3.0'
    },
    {
      id: 'bg_ancestral_shrine',
      title: 'Kunlun Ancestral Shrine',
      path: '/assets/backgrounds/cultivation/ancestral_shrine.jpg',
      category: 'cultivation',
      tags: ['shrine', 'pagoda', 'temple', 'daoist', 'kunlun', 'azure_peak'],
      worlds: ['kunlun'],
      genres: ['cultivation', 'mythology', 'martial_arts'],
      creator: 'olracadejup',
      source: 'https://opengameart.org/content/mixed-fantasy-backgrounds',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'bg_kunlun_mist',
      title: 'Mount Kunlun Misty Ridge',
      path: '/assets/backgrounds/cultivation/kunlun_mist.jpg',
      category: 'cultivation',
      tags: ['mountain', 'mist', 'cloud', 'qi', 'thunder'],
      worlds: ['kunlun'],
      genres: ['cultivation', 'martial_arts'],
      creator: 'olracadejup',
      source: 'https://opengameart.org/content/mixed-fantasy-backgrounds',
      license: 'CC0 1.0 Universal (Public Domain)'
    },
    {
      id: 'bg_academy_hallway_day',
      title: 'High School Hallway (Day)',
      path: '/assets/backgrounds/school/academy_hallway_day.png',
      category: 'school',
      tags: ['school', 'academy', 'hallway', 'day', 'classroom'],
      worlds: ['aethelgard', 'neokyoto'],
      genres: ['school_life', 'anime', 'comedy', 'romance'],
      creator: 'Gunnar Klingen (Uncle Mugen)',
      source: 'https://opengameart.org/content/hallway-daynight-background-for-visual-novels',
      license: 'CC-BY 3.0'
    },
    {
      id: 'bg_academy_hallway_night',
      title: 'High School Hallway (Night)',
      path: '/assets/backgrounds/school/academy_hallway_night.png',
      category: 'school',
      tags: ['school', 'hallway', 'night', 'mystery', 'spooky'],
      worlds: ['aethelgard', 'neokyoto'],
      genres: ['mystery', 'horror', 'supernatural', 'school_life'],
      creator: 'Gunnar Klingen (Uncle Mugen)',
      source: 'https://opengameart.org/content/hallway-daynight-background-for-visual-novels',
      license: 'CC-BY 3.0'
    },
    {
      id: 'bg_academy_auditorium',
      title: 'Academy Grand Auditorium',
      path: '/assets/backgrounds/school/academy_auditorium.png',
      category: 'school',
      tags: ['auditorium', 'stage', 'hall', 'tournament', 'ceremony'],
      worlds: ['aethelgard'],
      genres: ['school_life', 'anime'],
      creator: 'Gunnar Klingen (Uncle Mugen)',
      source: 'https://opengameart.org/content/visual-novel-background-auditorium',
      license: 'CC-BY 3.0'
    },
    {
      id: 'bg_ruined_battleground',
      title: 'Ruined Outer Battleground',
      path: '/assets/backgrounds/battle/ruined_battleground.png',
      category: 'battle',
      tags: ['battle', 'ruins', 'flames', 'combat', 'war'],
      worlds: ['aethelgard', 'kunlun', 'neokyoto'],
      genres: ['action', 'fantasy', 'war'],
      creator: 'potat0',
      source: 'https://opengameart.org/content/visual-novel-style-backgrounds',
      license: 'CC-BY 3.0'
    }
  ]
};

fs.writeFileSync(path.join(PUBLIC_DATA, 'assets-manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Manifest written to public/data/assets-manifest.json (${manifest.characters.length} characters, ${manifest.backgrounds.length} backgrounds)`);

// 5. Write CREDITS.md
const creditsMd = `# BranchVerse — Art & Asset Attribution

BranchVerse features legitimate free anime and visual novel artwork licensed under **Creative Commons (CC0 / CC-BY)**.

---

## 1. Character Sprites & Expressions

- **Visual Novel Character Sprites (Hari, Aria, Master Shen, Captain Ronald, Masked Commander)**
  - **Creator:** FALLiNG_AiR
  - **Source:** [OpenGameArt.org](https://opengameart.org/content/visual-novel-character-sprite)
  - **License:** CC0 1.0 Universal (Public Domain Dedication)
  - **Usage:** Character portraits, emotional expressions (normal, serious, happy, angry).

- **Kuudere Visual Novel Sprite (Rei / Kuudere & Fixer Nyx)**
  - **Creator:** LisadiKaprio
  - **Source:** [OpenGameArt.org](https://opengameart.org/content/kuudere-visual-novel-sprite)
  - **License:** Creative Commons Attribution 4.0 International ([CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/))
  - **Usage:** Protagonist avatar options and cyberpunk underground fixer.

---

## 2. Background Environments

- **Mixed Fantasy Backgrounds (Aethelgard Citadel, Crystal Temple, Highland Peaks, Canyons, Ancestral Shrines)**
  - **Creator:** olracadejup
  - **Source:** [OpenGameArt.org](https://opengameart.org/content/mixed-fantasy-backgrounds)
  - **License:** CC0 1.0 Universal (Public Domain Dedication)

- **Cyberpunk Street Parallax & Underbelly**
  - **Creator:** ansimuz
  - **Source:** [OpenGameArt.org](https://opengameart.org/content/cyberpunk-street-environment)
  - **License:** Creative Commons Attribution 3.0 Unported ([CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/))

- **Futuristic Sci-Fi Lab / Vault Interior**
  - **Creator:** ask4asset.com
  - **Source:** [OpenGameArt.org](https://opengameart.org/content/sci-fi-background)
  - **License:** CC0 1.0 Universal (Public Domain Dedication)

- **Forest Background Art (The Whisperwood)**
  - **Creator:** Tamara Ramsay (ramtam) & Bertram
  - **Source:** [OpenGameArt.org](https://opengameart.org/content/forest-background-art)
  - **License:** Creative Commons Attribution-ShareAlike 3.0 ([CC-BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/))

- **Visual Novel Hallway (Day & Night) & Auditorium**
  - **Creator:** Gunnar Klingen (Uncle Mugen / Mugenjohncel)
  - **Source:** [OpenGameArt.org](https://opengameart.org/content/hallway-daynight-background-for-visual-novels)
  - **License:** Creative Commons Attribution 3.0 Unported ([CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/))

- **Visual Novel Style Bar & Ruined Battleground**
  - **Creator:** potat0
  - **Source:** [OpenGameArt.org](https://opengameart.org/content/visual-novel-style-backgrounds)
  - **License:** Creative Commons Attribution 3.0 Unported ([CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/))

---

*All art assets are hosted locally inside \`public/assets/\` to ensure zero runtime dependency on external image hosting services.*
`;

fs.writeFileSync(path.resolve('CREDITS.md'), creditsMd);
console.log('Attribution written to CREDITS.md');

// 6. Clean up temporary download archives
try {
  fs.rmSync(TEMP, { recursive: true, force: true });
  console.log('Cleaned up temporary archive directory.');
} catch (err) {
  console.warn('Could not remove temp_downloads:', err.message);
}
