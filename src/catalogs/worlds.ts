import { WorldDefinition } from '../types/world';

export const WORLD_CATALOG: WorldDefinition[] = [
  {
    id: 'aethelgard',
    name: 'Aethelgard High Realm',
    primaryGenreId: 'fantasy',
    synopsis: 'A continent of floating crystal citadels, whispering elderwoods, and slumbering colossal dragons guarded by the Silver Vanguard.',
    locations: [
      { id: 'silver_spire', name: 'The Silver Spire', type: 'citadel', description: 'Seat of the Archmagi where leylines converge in a pillar of starlight.', dangerLevel: 'Safe' },
      { id: 'whisperwood', name: 'The Whisperwood', type: 'sanctuary', description: 'Ancient bioluminescent forest where spirits offer riddles and forbidden remedies.', dangerLevel: 'Moderate' },
      { id: 'black_rift', name: 'The Black Rift Mines', type: 'dungeon', description: 'Deep subterranean trenches infested with abyssal void-spiders and cursed ore.', dangerLevel: 'Lethal' },
      { id: 'valen_village', name: 'Valen’s Crossing', type: 'village', description: 'A riverside hamlet of blacksmiths, tavern keepers, and passing mercenary bands.', dangerLevel: 'Safe' },
    ],
    factions: [
      { id: 'silver_vanguard', name: 'Silver Vanguard', alignment: 'Lawful Good', description: 'Oathbound knights dedicated to protecting the realm from rift anomalies.' },
      { id: 'shadow_cabal', name: 'The Ashen Cabal', alignment: 'Neutral Evil', description: 'Sorcerers harvesting prohibited void-crystals to defy mortality.' }
    ],
    magicSystem: {
      id: 'mana_runes',
      name: 'Runic Resonance',
      source: 'Crystalline mana nodes in the earth',
      rules: ['Every spell requires an incantation rune etched in mind or stone.', 'Overdrawing mana petrifies the caster’s fingertips.'],
      limitations: ['Dead magic zones render runic artifacts inert.', 'Spells cannot reverse true soul departure.']
    },
    races: ['Human', 'High Elf', 'Dwarf', 'Dragonborn', 'Star-Touched'],
    classes: ['Spellblade', 'Archmage', 'Rune Knight', 'Ranger', 'Acolyte'],
    powerSystems: ['Elemental Sorcery', 'Runic Enchantment', 'Aura Manifestation'],
    commonWeapons: ['Sunforged Longsword', 'Leyline Staff', 'Elven Moonbow', 'Rune Dagger'],
    commonAbilities: ['Starlight Blink', 'Aegis Ward', 'Flame Infusion', 'Mana Siphon'],
    threats: ['Void Harbingers', 'Corrupted Golems', 'Rival Mercenary Guilds']
  },
  {
    id: 'neokyoto',
    name: 'Neo-Kyoto 2099',
    primaryGenreId: 'cyberpunk',
    synopsis: 'A towering vertical megalopolis where megacorporations rule the sky-penthouses while chromed cyber-runners navigate rainy neon back-alleys.',
    locations: [
      { id: 'shinjuku_undercity', name: 'District 4 Underbelly', type: 'wasteland', description: 'Subterranean black markets lit by flickering hologram advertisements and steam pipes.', dangerLevel: 'Hazardous' },
      { id: 'araka_tower', name: 'Arakawa Megacorp Plaza', type: 'citadel', description: 'Gleaming 200-story monolith bristling with corporate counter-ICE and autonomous security drones.', dangerLevel: 'Lethal' },
      { id: 'chiba_clinic', name: 'Doc Kuro’s Cyber Clinic', type: 'sanctuary', description: 'Unlicensed medical haven for patching bullet wounds and installing overclocked sandevistan units.', dangerLevel: 'Safe' }
    ],
    factions: [
      { id: 'arakawa_corp', name: 'Arakawa Heavy Industries', alignment: 'Lawful Evil', description: 'Monopolistic megacorp controlling neural implants and city defense networks.' },
      { id: 'neon_ghosts', name: 'The Neon Ghosts', alignment: 'Chaotic Good', description: 'Underground hacktivist and street samurai collective fighting corporate surveillance.' }
    ],
    magicSystem: {
      id: 'cyberware_ice',
      name: 'Neural Net & Cyberware',
      source: 'Subdermal bioware and neuro-quantum processors',
      rules: ['Implant capacity is limited by human cyber-psychosis threshold.', 'Direct neural deck connection exposes brain to lethal Black ICE.'],
      limitations: ['High-yield EMP bursts disable electronics momentarily.', 'Requires constant immunosuppressant boosters.']
    },
    races: ['Enhanced Human', 'Full-Body Cyborg', 'Android Synthetic', 'Mutant Stalker'],
    classes: ['Street Samurai', 'Netrunner', 'Tech-Doctor', 'Corp Fixer', 'Heavy Enforcer'],
    powerSystems: ['Overclocked Reflexes', 'Neural Quickhacks', 'Subdermal Ballistics'],
    commonWeapons: ['Mantis Thermal Blades', 'Smart Plasma SMG', 'Mono-Wire Filament', 'Heavy Rail Revolver'],
    commonAbilities: ['Sandevistan Time-Dilation', 'Optic Camouflage', 'Sub-Net Breach', 'EMP Burst'],
    threats: ['Black ICE Daemon Stalkers', 'Rogue Security Drones', 'Cyber-Psycho Gangs']
  },
  {
    id: 'kunlun',
    name: 'Mount Kunlun Sects',
    primaryGenreId: 'cultivation',
    synopsis: 'Floating jade peaks where immortal cultivators swallow pills, tame divine beasts, and shatter mountain ranges with a single sword intent.',
    locations: [
      { id: 'azure_peak', name: 'Azure Cloud Sword Pavilion', type: 'academy', description: 'Pinnacle sect where outer disciples sweep steps and inner disciples practice nine-sword formations.', dangerLevel: 'Safe' },
      { id: 'demon_beast_valley', name: 'Ten-Thousand Demon Ravine', type: 'dungeon', description: 'Mist-shrouded gorge populated by millennial spirit serpents and blood-eating ginseng herbs.', dangerLevel: 'Hazardous' },
      { id: 'forbidden_pagoda', name: 'Ancestral Pagoda of Tribulations', type: 'sanctuary', description: 'Ancient nine-tier tower where heavenly lightning strikes testing martial Dao.', dangerLevel: 'Lethal' }
    ],
    factions: [
      { id: 'righteous_sword_sect', name: 'Azure Sword Sect', alignment: 'Lawful Good', description: 'Orthodox Daoist disciples pursuing heavenly harmony and righteous justice.' },
      { id: 'blood_bone_hall', name: 'Blood Bone Cult', alignment: 'Chaotic Evil', description: 'Demonic practitioners refining yin souls into forbidden soul-banners.' }
    ],
    magicSystem: {
      id: 'qi_meridians',
      name: 'Spiritual Qi Cultivation',
      source: 'Heaven and Earth spiritual energy circulated through meridian pathways',
      rules: ['Cultivator must cleanse inner impurities to breakthrough realm bottlenecks.', 'Heart demons during meditation lead to cultivation deviation.'],
      limitations: ['Tribulation lightning tests every major realm transition.', 'Spiritual roots determine elemental affinity.']
    },
    races: ['Human Cultivator', 'Nine-Tailed Fox Spirit', 'Dragon Tribe', 'Demon Heritage'],
    classes: ['Sword Immortal', 'Pill Alchemist', 'Formation Master', 'Body Refiner', 'Beast Tamer'],
    powerSystems: ['Qi Condensation', 'Sword Intent', 'Golden Core Domain', 'Heavenly Tribulation'],
    commonWeapons: ['Flying Jade Sword', 'Spirit Refinement Cauldron', 'Dragon Scale Spear', 'Daoist Whisk'],
    commonAbilities: ['Void Step', 'Nine Heavens Thunder Slash', 'Qi Barrier', 'Golden Core Ignition'],
    threats: ['Demonic Sect Elders', 'Millennial Spirit Beasts', 'Heavenly Tribulation Strikes']
  }
];
