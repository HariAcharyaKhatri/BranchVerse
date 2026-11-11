import { WorldDefinition } from '../types/world';

export const WORLD_CATALOG: WorldDefinition[] = [
  {
    id: 'aethelgard',
    name: 'Aethelgard High Realm',
    primaryGenreId: 'fantasy',
    synopsis: 'A continent of floating crystal citadels, whispering elderwoods, and slumbering colossal dragons guarded by the Silver Vanguard.',
    imagePath: '/assets/worlds/kingdoms/aethelgard-high-realm.jpg',
    coverImage: '/assets/worlds/kingdoms/aethelgard-high-realm.jpg',
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
    imagePath: '/assets/worlds/environments/neokyoto-megalopolis.png',
    coverImage: '/assets/worlds/environments/neokyoto-megalopolis.png',
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
    imagePath: '/assets/worlds/environments/kunlun-mist-peaks.jpg',
    coverImage: '/assets/worlds/environments/kunlun-mist-peaks.jpg',
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
  },
  {
    id: 'arcane_lumina',
    name: 'Grand Arcane Citadel of Lumina',
    primaryGenreId: 'school_life',
    synopsis: 'A continent-sized magical academy of soaring sapphire spires, celestial observatories, and infinite libraries where prodigies compete in planar duels.',
    imagePath: '/assets/worlds/castles/royal-citadel.jpg',
    coverImage: '/assets/worlds/castles/royal-citadel.jpg',
    locations: [
      { id: 'lumina_grand_hall', name: 'The Sovereign Lecture Hall', type: 'academy', description: 'Vast enchanted amphitheater where Archmagi unveil forbidden cosmic arcana.', dangerLevel: 'Safe' },
      { id: 'astronomers_pinnacle', name: 'The Starfall Observatory', type: 'citadel', description: 'Telescopic spires charting planetary mana surges and celestial alignments.', dangerLevel: 'Moderate' },
      { id: 'forbidden_archives', name: 'Vault of Prohibited Grimoires', type: 'dungeon', description: 'Subterranean labyrinth of living books that whisper maddening cosmic truths.', dangerLevel: 'Hazardous' }
    ],
    factions: [
      { id: 'lumina_council', name: 'High Arcane Council', alignment: 'Lawful Neutral', description: 'Academic regents governing curriculum, dueling rules, and magical research ethics.' },
      { id: 'astral_scholars', name: 'Astral Seekers Guild', alignment: 'Chaotic Good', description: 'Student researchers pushing boundaries into multi-dimensional teleportation.' }
    ],
    magicSystem: {
      id: 'lumina_arcana',
      name: 'Scholastic High Magic',
      source: 'Planar mana leyline wells and mathematical geometry',
      rules: ['Spells require precise structural calculations or runic syllogisms.', 'Unlicensed spell synthesis in dormitories triggers immediate ward arrest.'],
      limitations: ['Overloading personal mana matrix causes temporal disorientation.']
    },
    races: ['Human Prodigy', 'High Elf Scholar', 'Homunculus Vessel', 'Gnome Tinkerer'],
    classes: ['Spellblade Student', 'High Arcanist', 'Rune Engineer', 'Alchemy Researcher'],
    powerSystems: ['Leyline Geometry', 'Element Infusion', 'Planar Evocation'],
    commonWeapons: ['Apprentice Focal Wand', 'Starlight Grimoire', 'Silver Pen-Blade'],
    commonAbilities: ['Aura Shield', 'Blink Step', 'Elemental Bolt', 'Mana Siphon'],
    threats: ['Rogue Grimoire Horrors', 'Challenger Duels', 'Forbidden Ritual Accidents']
  },
  {
    id: 'sylvaneth_elderwood',
    name: 'Sylvaneth Primordial Elderwood',
    primaryGenreId: 'adventure',
    synopsis: 'An ancient bioluminescent forest empire ruled by beastkin tribes, guardian spirits, and mile-wide World Trees that cradle entire treetop settlements.',
    imagePath: '/assets/worlds/forests/whisperwood-mystic.png',
    coverImage: '/assets/worlds/forests/whisperwood-mystic.png',
    locations: [
      { id: 'world_tree_yggdra', name: 'Heart of Yggdra', type: 'sanctuary', description: 'Colossal emerald tree pulsing with raw life mana and elder spirit voices.', dangerLevel: 'Safe' },
      { id: 'fangs_canopy', name: 'Predator’s Ridge', type: 'wasteland', description: 'Mist-draped tree canopy where giant wolves and avian beasts contest territorial supremacy.', dangerLevel: 'Hazardous' },
      { id: 'hollow_roots', name: 'The Sunless Hollow Roots', type: 'dungeon', description: 'Bioluminescent root caverns holding ancient spirit slumber chambers.', dangerLevel: 'Lethal' }
    ],
    factions: [
      { id: 'beastkin_conclave', name: 'United Beastkin Conclave', alignment: 'Neutral Good', description: 'Tribal chieftains protecting the sacred canopy from external kingdom expansion.' },
      { id: 'spirit_wardens', name: 'Emerald Spirit Wardens', alignment: 'True Neutral', description: 'Ancient shamans attuned to elemental wildlife and natural mana flows.' }
    ],
    magicSystem: {
      id: 'wild_totem',
      name: 'Primal Totemic Shamanism',
      source: 'Heartbeat of the World Tree and ancestral spirits',
      rules: ['Power is granted through mutual spiritual pacts with the natural order.', 'Defiling elder saplings permanently revokes shamanic gifts.'],
      limitations: ['Inert within heavily polluted industrial or dead-zone environments.']
    },
    races: ['Wolfkin', 'Foxkin', 'Catfolk', 'Wood Elf', 'Fairy Spirit'],
    classes: ['Primal Ranger', 'Totem Shaman', 'Beast Tamer', 'Canopy Stalker'],
    powerSystems: ['Spirit Beast Awakening', 'Photosynthetic Regeneration', 'Nature Camouflage'],
    commonWeapons: ['Ironwood Recurve Bow', 'Bone Fang Daggers', 'Living Vine Staff'],
    commonAbilities: ['Primal Dash', 'Thorn Entangle', 'Beast Roar', 'Spirit Bond'],
    threats: ['Corrupted Wood Blights', 'Human Poaching Guilds', 'Frenzied Primal Titans']
  },
  {
    id: 'elysian_zenith',
    name: 'Elysian Heavens & Divine Zenith',
    primaryGenreId: 'fantasy',
    synopsis: 'Radiant sanctuaries floating above the celestial clouds where golden paladins train under the gaze of archangels and holy pantheons.',
    imagePath: '/assets/worlds/celestial/celestial-shrine.jpg',
    coverImage: '/assets/worlds/celestial/celestial-shrine.jpg',
    locations: [
      { id: 'seraphic_throne', name: 'The Aureate Throne Chamber', type: 'citadel', description: 'Gilded palace where divine archangels deliberate cosmic balances.', dangerLevel: 'Safe' },
      { id: 'sea_of_stars', name: 'The Cloud Sea of Starlight', type: 'sanctuary', description: 'Vast astral clouds where pure celestial souls rest and recharge spiritual halos.', dangerLevel: 'Safe' },
      { id: 'abyssal_gate', name: 'The Sealed Gate of Tartarus', type: 'dungeon', description: 'Adamantine barrier chained with holy decrees preventing infernal breaching.', dangerLevel: 'Lethal' }
    ],
    factions: [
      { id: 'seraphic_host', name: 'The Seraphic Host', alignment: 'Lawful Good', description: 'Four-winged celestial warriors enforcing cosmic justice and soul transmigrations.' },
      { id: 'dawn_inquisitors', name: 'Dawn Inquisitors', alignment: 'Lawful Neutral', description: 'Vigilant paladins hunting demonic corruptions across all mortal spheres.' }
    ],
    magicSystem: {
      id: 'divine_grace',
      name: 'Holy Celestial Radiance',
      source: 'Pure stellar luminescence and divine covenants',
      rules: ['Channels blinding purification and restoration through benevolent intentions.', 'Malicious cruelty immediately shatters celestial covenants.'],
      limitations: ['Power is bounded by moral oaths and divine mandates.']
    },
    races: ['Angel Seraph', 'Sun-Touched Mortal', 'Fallen Penitent', 'Holy Revenant'],
    classes: ['Divine Paladin', 'Celestial Cleric', 'Solar Herald', 'Seraphic Guardian'],
    powerSystems: ['Radiant Sanctification', 'Heavenly Judgement', 'Aura Purification'],
    commonWeapons: ['Sunsteel Greatsword', 'Radiant Kite Shield', 'Morningstar of Dawn'],
    commonAbilities: ['Divine Aegis', 'Holy Smite', 'Resurrection Light', 'Wings of Dawn'],
    threats: ['Abyssal Infiltrators', 'Fallen Celestial Zealots', 'Cosmic Eclipse Beings']
  },
  {
    id: 'valgora_scorch',
    name: 'Infernal Scorchlands of Valgora',
    primaryGenreId: 'fantasy',
    synopsis: 'A volcanic underworld realm of molten magma falls, dark iron citadels, and demon warlords competing in brutal gladiatorial dominance.',
    imagePath: '/assets/worlds/demonic/abyssal-canyon.jpg',
    coverImage: '/assets/worlds/demonic/abyssal-canyon.jpg',
    locations: [
      { id: 'iron_keep_valgora', name: 'Obsidian Dread Keep', type: 'citadel', description: 'Colossal iron castle overlooking crimson rivers of burning brimstone.', dangerLevel: 'Hazardous' },
      { id: 'gladiator_canyon', name: 'The Blood Pit of Fangs', type: 'wasteland', description: 'Natural magma amphitheater where champions battle for demonic fiefdoms.', dangerLevel: 'Hazardous' },
      { id: 'soul_furnace', name: 'The Crucible of Broken Pacts', type: 'dungeon', description: 'Subterranean forge where warlock weapons are quenched in damned fires.', dangerLevel: 'Lethal' }
    ],
    factions: [
      { id: 'valgora_war_clans', name: 'Dread Clan of Valgora', alignment: 'Chaotic Evil', description: 'Brutal demonic berserkers seeking conquest across the multi-planar rifts.' },
      { id: 'ashen_pact_cabal', name: 'The Ashen Warlocks', alignment: 'Neutral Evil', description: 'Soul merchants trading hellfire enhancements for mortal years.' }
    ],
    magicSystem: {
      id: 'infernal_fire',
      name: 'Hellfire & Blood Pacts',
      source: 'Planar subterranean magma veins and soul contracts',
      rules: ['Every enhancement demands an exact blood tribute or binding oath.', 'Hellfire burns until extinguished by holy starlight or divine intervention.'],
      limitations: ['Vulnerable to pure celestial purification and cold void arts.']
    },
    races: ['Demon Fiend', 'Tiefling Warlock', 'Hellfire Orc', 'Vampire Lord'],
    classes: ['Infernal Berserker', 'Blood Mage', 'Doom Knight', 'Pactbinder'],
    powerSystems: ['Hellfire Ignition', 'Blood Sacrifice Surge', 'Demonic Metamorphosis'],
    commonWeapons: ['Spiked Obsidian Greataxe', 'Blood-Chained Scythe', 'Hellfire Brand'],
    commonAbilities: ['Brimstone Burst', 'Hellish Ward', 'Blood Boil', 'Infernal Leap'],
    threats: ['Colossal Magma Wurms', 'Betraying Pact Demons', 'Celestial Inquisitor Strikes']
  },
  {
    id: 'endless_abyss',
    name: 'The Endless Labyrinth & Black Rift',
    primaryGenreId: 'fantasy',
    synopsis: 'An unfathomable underground megadungeon descending thousands of floors into forgotten titan vaults, monster hives, and ancient relic chambers.',
    imagePath: '/assets/worlds/dungeons/black-rift-mines.png',
    coverImage: '/assets/worlds/dungeons/black-rift-mines.png',
    locations: [
      { id: 'delvers_haven', name: 'Floor 1: Delver’s Crossroads', type: 'sanctuary', description: 'Frontier outpost built inside a hollow stalagmite cavern with blacksmiths and taverns.', dangerLevel: 'Safe' },
      { id: 'sunken_catacombs', name: 'Floor 15: The Sunken Crypts', type: 'dungeon', description: 'Flooded stone labyrinths inhabited by restless skeletal legions and siren spectres.', dangerLevel: 'Moderate' },
      { id: 'deep_rift_core', name: 'Floor 50: The Titan’s Spine', type: 'dungeon', description: 'Massive cavern of pure void crystals where ancient dungeon bosses awaken.', dangerLevel: 'Lethal' }
    ],
    factions: [
      { id: 'delvers_syndicate', name: 'Grand Delvers Syndicate', alignment: 'Neutral Good', description: 'Pioneer guild charting safe routes, mapping resource nodes, and rescuing trapped teams.' },
      { id: 'dungeon_core_keepers', name: 'Keepers of the Core', alignment: 'Lawful Neutral', description: 'Sentient living dungeon defenders testing mortals with brutal puzzles and boss trials.' }
    ],
    magicSystem: {
      id: 'dungeon_mana',
      name: 'Ambient Dungeon Leylines',
      source: 'The pulsating crystalline heart of the Living Labyrinth',
      rules: ['Defeating monsters drops crystallized mana cores usable for instant skill growth.', 'Floor traps adapt dynamically to party composition and strategies.'],
      limitations: ['No escape teleportation allowed during active boss arena lockouts.']
    },
    races: ['Human Pioneer', 'Dwarf Excavator', 'Goblin Scout', 'Skeleton Revenant', 'Slime Sovereign'],
    classes: ['Dungeon Delver', 'Shield Guardian', 'Trap Breaker', 'Shadow Rogue', 'Monster Cook'],
    powerSystems: ['Monster Core Absorption', 'Dungeon Map Sense', 'Item Appraisal'],
    commonWeapons: ['Heavy Tower Shield', 'Mining Mattock', 'Short Hook-Blade', 'Flash Bombs'],
    commonAbilities: ['Threat Perception', 'Fortress Wall', 'Ambush Strike', 'Instant Forage'],
    threats: ['Roaming Floor Bosses', 'Mimic Chests', 'Floor Wide Cave-Ins', 'Void Beast Swarms']
  },
  {
    id: 'valen_republic',
    name: 'Valen Free Republic & Trade Coast',
    primaryGenreId: 'adventure',
    synopsis: 'A sunlit, prosperous maritime valley of merchant fleets, bountiful vineyards, bustling canal markets, and welcoming countryside taverns.',
    imagePath: '/assets/worlds/kingdoms/valen-valley.jpg',
    coverImage: '/assets/worlds/kingdoms/valen-valley.jpg',
    locations: [
      { id: 'valen_port', name: 'Port Valen Harbor', type: 'kingdom', description: 'Vibrant harbor filled with merchant galleons, fish markets, and sea songs.', dangerLevel: 'Safe' },
      { id: 'golden_valley', name: 'The Sunlit Vineyards', type: 'village', description: 'Rolling green hills where farmers harvest magical grapes and hops for world-famous brews.', dangerLevel: 'Safe' },
      { id: 'corsair_cove', name: 'The Smuggler’s Grotto', type: 'wasteland', description: 'Hidden coastal sea caves where maritime pirates trade exotic contraband.', dangerLevel: 'Hazardous' }
    ],
    factions: [
      { id: 'merchant_league', name: 'Hanseatic Trade League', alignment: 'Lawful Neutral', description: 'Wealthy merchant guild controlling shipping rights, grain prices, and maritime banking.' },
      { id: 'coast_watch', name: 'Free Mariners Guild', alignment: 'Chaotic Good', description: 'Free-spirited sailors defending trade lanes from sea serpents and corsairs.' }
    ],
    magicSystem: {
      id: 'tide_harvest',
      name: 'Tidal & Agrarian Enchantment',
      source: 'Ocean currents and fertile earth leylines',
      rules: ['Enhances agricultural yields, wind sails, trade contracts, and craftsmanship.', 'Strict maritime laws enforce peaceful barter in harbor waters.'],
      limitations: ['Lacks massive destructive offensive potential compared to high battle realms.']
    },
    races: ['Human Free Citizen', 'Halfling Brewer', 'Merfolk Trader', 'Dwarf Mason'],
    classes: ['Merchant Prince', 'Master Farmer', 'Ship Captain', 'Blacksmith Artisan', 'Gourmet Cook'],
    powerSystems: ['Trade Arbitrage Eye', 'Agricultural Blessing', 'Wind Navigation'],
    commonWeapons: ['Cutlass Sabre', 'Harpoon Spear', 'Blacksmith Hammer', 'Coin Whip'],
    commonAbilities: ['Appraisal Glance', 'Tidal Shield', 'Bargaining Stance', 'Feast Restoration'],
    threats: ['Tidal Sea Serpents', 'Pirate Armada Raids', 'Corrupt Trade Monopoly Enforcers']
  },
  {
    id: 'ironspire_engine',
    name: 'Steam-Gilded Empire of Ironspire',
    primaryGenreId: 'fantasy',
    synopsis: 'A sprawling city of brass cogwheels, steam boilers, armored airships, and magitech conduits where inventor guilds shape the industrial era.',
    imagePath: '/assets/worlds/environments/cyber-sublevel-lab.jpg',
    coverImage: '/assets/worlds/environments/cyber-sublevel-lab.jpg',
    locations: [
      { id: 'gear_plaza', name: 'The Grand Chronometer Plaza', type: 'citadel', description: 'Gleaming brass square dominated by a ten-story clockwork tower that regulates the city steam grid.', dangerLevel: 'Safe' },
      { id: 'aeronaut_docks', name: 'Zeppelin Sky Docks', type: 'sanctuary', description: 'Towering iron mooring towers where armored steam airships embark on trans-continental voyages.', dangerLevel: 'Moderate' },
      { id: 'sub_foundry', name: 'The Molten Under-Foundry', type: 'dungeon', description: 'Subterranean boilers where workers and automatons smelt adamantine ore under extreme steam heat.', dangerLevel: 'Hazardous' }
    ],
    factions: [
      { id: 'guild_of_engineers', name: 'Imperial Guild of Mechanists', alignment: 'Lawful Neutral', description: 'Master engineers holding patents on steam engines, clockwork automata, and airships.' },
      { id: 'brass_laborers', name: 'The Brass Union', alignment: 'Chaotic Good', description: 'Industrial labor reformers and inventors crafting unauthorized magitech innovations.' }
    ],
    magicSystem: {
      id: 'steam_magitech',
      name: 'Steam Pneumatics & Runic Gears',
      source: 'High-pressure steam boilers channeled through enchanted copper conduits',
      rules: ['Every mechanical apparatus requires precise gear calibration and steam pressure regulation.', 'Overheating boilers without relief valves triggers devastating explosions.'],
      limitations: ['Ineffective without fuel water and coal/mana heating cores.']
    },
    races: ['Human Engineer', 'Dwarf Steam-Smith', 'Gnome Clockmaker', 'Living Automaton Golem'],
    classes: ['Arcane Mechanist', 'Zeppelin Gunner', 'Clockwork Artificer', 'Steam Paladin'],
    powerSystems: ['Pneumatic Overdrive', 'Automaton Remote Control', 'Kinetic Spring Loading'],
    commonWeapons: ['Steam Rifle', 'Pneumatic Power Gauntlet', 'Wrench-Blade', 'Molten Rivet Gun'],
    commonAbilities: ['Pressure Burst', 'Automaton Deploy', 'Steam Veil', 'Armor Overclock'],
    threats: ['Rogue Steam Automatons', 'Boiler Catastrophes', 'Industrial Sabotage Gangs']
  },
  {
    id: 'tribulation_pagoda',
    name: 'Ancestral Pagoda of Tribulations',
    primaryGenreId: 'cultivation',
    synopsis: 'A mystical mountain peak where nine tiers of heavenly lightning strike ancient bronze bells, testing martial cultivators pursuing the Supreme Dao.',
    imagePath: '/assets/worlds/celestial/ancestral-pagoda.jpg',
    coverImage: '/assets/worlds/celestial/ancestral-pagoda.jpg',
    locations: [
      { id: 'bronze_bell_steps', name: 'The Nine-Thousand Steps of Will', type: 'academy', description: 'Steep granite stair where ambient spiritual gravity multiplies with each ascending level.', dangerLevel: 'Safe' },
      { id: 'lightning_terrace', name: 'Heavenly Tribulation Terrace', type: 'sanctuary', description: 'Open platform where purple celestial lightning strikes to temper meridians.', dangerLevel: 'Moderate' },
      { id: 'demon_subduing_crypt', name: 'Demon-Subduing Vault', type: 'dungeon', description: 'Underground chamber beneath the pagoda sealing primordial chaos fiends.', dangerLevel: 'Lethal' }
    ],
    factions: [
      { id: 'pagoda_guardians', name: 'Nine Heavens Guardian Monks', alignment: 'Lawful Good', description: 'Vow-bound martial ascetics preserving the sacred lightning formation.' },
      { id: 'wandering_daoists', name: 'Daoist Pill Fraternity', alignment: 'True Neutral', description: 'Alchemical hermits gathering thunder-kissed herbs from storm precipices.' }
    ],
    magicSystem: {
      id: 'thunder_dao',
      name: 'Nine Heavens Thunder Tempering',
      source: 'Atmospheric cosmic lightning grounded through ancestral jade pagoda formations',
      rules: ['Cultivator absorbs lightning directly into their meridians to forge diamond bones.', 'Failing to maintain inner serenity leads to spiritual backlash and heart demons.'],
      limitations: ['Requires immense spiritual willpower to withstand tribulation pain.']
    },
    races: ['Martial Ascetic', 'Thunder Spirit', 'Draconic Cultivator', 'Human Pill Alchemist'],
    classes: ['Vajra Body Refiner', 'Thunder Swordmaster', 'Daoist Shaman', 'Pagoda Abbot'],
    powerSystems: ['Lightning Meridian Infusion', 'Golden Bell Armor', 'Dragon-Tiger Roar'],
    commonWeapons: ['Thunderbolt Spear', 'Bronze Staff', 'Heavy Iron Cestus', 'Spiritual Dao Saber'],
    commonAbilities: ['Nine Heavens Thunder Slash', 'Vajra Body Shield', 'Step of Thunder', 'Qi Cleansing'],
    threats: ['Tribulation Backlash', 'Escaping Sealed Primordial Fiends', 'Rival Demonic Sect Saboteurs']
  },
  {
    id: 'shadow_undercity',
    name: 'District Zero Shadow Syndicate',
    primaryGenreId: 'cyberpunk',
    synopsis: 'The rain-soaked subterranean foundation beneath towering skyscrapers where black market cyber-clinics, rogue AI brokers, and street samurai thrive.',
    imagePath: '/assets/worlds/environments/undercity-haven.png',
    coverImage: '/assets/worlds/environments/undercity-haven.png',
    locations: [
      { id: 'neon_crossroads', name: 'Neon Slums Bazaar', type: 'wasteland', description: 'Dense market alley glowing with holo-graffiti and noodle stalls beneath dripping pipelines.', dangerLevel: 'Moderate' },
      { id: 'rogue_hub_zero', name: 'Zero Point Speakeasy', type: 'sanctuary', description: 'Secure underground bar shielded against corporate surveillance drones and satellite telemetry.', dangerLevel: 'Safe' },
      { id: 'abandoned_subways', name: 'The Sub-Level Rail Tunnels', type: 'dungeon', description: 'Flooded subway transit lines inhabited by cyber-psychos and rogue combat drones.', dangerLevel: 'Hazardous' }
    ],
    factions: [
      { id: 'district_zero_pack', name: 'The Shadow Runners Pact', alignment: 'Chaotic Good', description: 'Brotherhood of street samurai, rogue fixers, and medics defending the disenfranchised.' },
      { id: 'black_market_cartel', name: 'Night City Syndicate', alignment: 'Neutral Evil', description: 'Ruthless syndicate trafficking prohibited military cyberware and illicit data shards.' }
    ],
    magicSystem: {
      id: 'subnet_hacking',
      name: 'Overclocked Sub-Net Infiltration',
      source: 'Pirated neural decks spliced directly into the city power grid',
      rules: ['Quickhacks can disrupt electronic weapon targeting and drone optics remotely.', 'Overheating cyberware causes fatal neuro-thermal brain stroke.'],
      limitations: ['Completely disabled inside absolute Faraday EMP isolation rooms.']
    },
    races: ['Street Cyborg', 'Chrome Enhanced Human', 'Glitch Synthetic', 'Underground Hacker'],
    classes: ['Street Samurai', 'Ghost Infiltrator', 'Doc Kuro Medic', 'Sub-Net Hacker', 'Heavy Enforcer'],
    powerSystems: ['Thermal Blade Boost', 'Optical Ghost Camouflage', 'Neural Overclocking'],
    commonWeapons: ['Mono-Filament Wire', 'Silenced Smart Pistol', 'Thermal Katana', 'EMP Grenades'],
    commonAbilities: ['Shadow Cloak', 'System Overload', 'Reflex Acceleration', 'Bio-Monitor Reboot'],
    threats: ['Megacorp Death Squads', 'Cyber-Psychosis Outbreaks', 'Rogue AI Stalkers']
  }
];
