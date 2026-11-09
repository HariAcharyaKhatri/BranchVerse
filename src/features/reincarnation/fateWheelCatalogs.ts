import { FateWheelCategoryDefinition } from './reincarnationTypes';

const RAW_CATEGORIES: FateWheelCategoryDefinition[] = [
  {
    id: 'world_type',
    name: 'World Genre & Setting',
    description: 'Determines the cosmic rules, civilization era, and metaphysical essence of your new reality.',
    options: [
      {
        id: 'high_fantasy',
        label: 'High Fantasy Realm',
        description: 'Floating citadels, ancient leylines, slumbering dragons, and knightly orders.',
        data: {
          genre: 'High Fantasy',
          era: 'Feudal Magic Renaissance',
          magicSystem: 'Runic Mana Leylines',
          majorConflicts: 'Void Rift Invasions & Dragon Lords',
        },
      },
      {
        id: 'eastern_cultivation',
        label: 'Eastern Cultivation Realm',
        description: 'Floating jade pagodas, immortal sects, sword intent, and heavenly tribulations.',
        data: {
          genre: 'Eastern Cultivation',
          era: 'Immortal Dao Era',
          magicSystem: 'Spiritual Qi Meridians & Golden Core',
          majorConflicts: 'Righteous vs Demonic Sect Feuds',
        },
      },
      {
        id: 'cyberpunk_arcana',
        label: 'Cyberpunk Arcana Megalopolis',
        description: 'Vertical neon metropolis with cyber-implants, demon-core reactors, and rogue fixers.',
        data: {
          genre: 'Cyberpunk Noir',
          era: 'Late 21st Century Cyber-Arcana',
          magicSystem: 'Neuro-Magic Quantum ICE',
          majorConflicts: 'Megacorp Monopolies vs Street Hacktivists',
        },
      },
      {
        id: 'dark_fantasy',
        label: 'Dark Fantasy & Eldritch Wilds',
        description: 'A perilous frontier where humanity clings to walled sanctuaries against ancient horrors.',
        data: {
          genre: 'Dark & Gritty',
          era: 'Grim Twilight of Empires',
          magicSystem: 'Blood Sorcery & Warded Relics',
          majorConflicts: 'Creeping Abyssal Miasma & Ancient Curses',
        },
      },
      {
        id: 'steampunk_empire',
        label: 'Steampunk Magic Empire',
        description: 'Brass airships, clockwork automatons, alchemical steam conduits, and aristocratic guilds.',
        data: {
          genre: 'Steampunk Fantasy',
          era: 'Industrial Aether Era',
          magicSystem: 'Alchemical Vapor Conduction',
          majorConflicts: 'Guild Rivalries & High-Altitude Piracy',
        },
      },
      {
        id: 'kingdom_diplomacy',
        label: 'Kingdom Building & Diplomacy',
        description: 'A vast fertile continent divided among rival duchies, merchant leagues, and crown wars.',
        data: {
          genre: 'Epic Saga',
          era: 'High Feudal Diplomacy',
          magicSystem: 'Subtle Blessing Charms & Sovereign Aura',
          majorConflicts: 'Succession Crises & Continental Trade Wars',
        },
      },
    ],
  },
  {
    id: 'race',
    name: 'Race & Bloodline',
    description: 'The physical form, ancestral lineage, and innate traits your soul will inhabit.',
    options: [
      {
        id: 'human',
        label: 'Adaptive Human',
        description: 'Limitless potential, versatile ingenuity, and unmatched resilience.',
        data: {
          race: 'Human',
          innateTraits: ['Versatile Adaptability', 'Iron Will'],
          lifespan: '80 - 100 years',
        },
      },
      {
        id: 'high_elf',
        label: 'High Elf Noble',
        description: 'Astral grace, centuries of lifespan, and inborn resonance with pure mana.',
        data: {
          race: 'High Elf',
          innateTraits: ['Ancestral Mana Pool', 'Harmonic Resonance'],
          lifespan: '800+ years',
        },
      },
      {
        id: 'dragonkin',
        label: 'Dragonkin Heir',
        description: 'Carriers of wyrm blood, reinforced draconic scales, and elemental breath.',
        data: {
          race: 'Dragonkin',
          innateTraits: ['Draconic Scales', 'Breath Channel'],
          lifespan: '600+ years',
        },
      },
      {
        id: 'dark_elf',
        label: 'Shadow Dark Elf',
        description: 'Subterranean nocturnal grace, silent movement, and venom tolerance.',
        data: {
          race: 'Dark Elf',
          innateTraits: ['Shadowstep', 'Night Vision'],
          lifespan: '600+ years',
        },
      },
      {
        id: 'beastkin',
        label: 'Beastkin (Apex Feral)',
        description: 'Heightened predatory senses, explosive agility, and primal instincts.',
        data: {
          race: 'Beastkin',
          innateTraits: ['Apex Senses', 'Primal Burst'],
          lifespan: '100+ years',
        },
      },
      {
        id: 'vampire_noble',
        label: 'Vampiric Aristocrat',
        description: 'Nocturnal majesty, accelerated tissue regeneration, and mesmerizing charm.',
        data: {
          race: 'Vampire Noble',
          innateTraits: ['Blood Vitality', 'Mesmerizing Presence'],
          lifespan: 'Ageless',
        },
      },
    ],
  },
  {
    id: 'origin',
    name: 'Social Origin & Family Background',
    description: 'The social standing, inheritance, and household circumstances into which you awaken.',
    options: [
      {
        id: 'imperial_royalty',
        label: 'Imperial Royal Household',
        description: 'Born as a legitimate scion to an imperial throne; immense wealth and political vipers.',
        data: {
          socialStatus: 'Imperial Royalty',
          familyStatus: 'Royal Crown Lineage',
          wealth: 'Opulent Treasury',
          socialPosition: 'Crown Prince / High Scion',
        },
      },
      {
        id: 'high_nobility',
        label: 'Grand Ducal Noble Clan',
        description: 'Heir to an ancestral provincial fortress with loyal retainers and military banners.',
        data: {
          socialStatus: 'High Nobility',
          familyStatus: 'Ancient Ducal House',
          wealth: 'Ancestral Estates & Silver',
          socialPosition: 'Young Lord / Lady',
        },
      },
      {
        id: 'merchant_dynasty',
        label: 'Trans-Continental Merchant Dynasty',
        description: 'Children of trade guild masters, wealthy vaults, ledger magic, and maritime caravans.',
        data: {
          socialStatus: 'Wealthy Merchant Guild',
          familyStatus: 'Gildenguard Syndicate',
          wealth: 'Abundant Gold Cache',
          socialPosition: 'Syndicate Successor',
        },
      },
      {
        id: 'wandering_nomad',
        label: 'Free Adventurer & Frontier Nomad',
        description: 'Unfettered by courts and titles; inherited exceptional maps, camp lore, and wilderness freedom.',
        data: {
          socialStatus: 'Free Adventurer',
          familyStatus: 'Independent Pioneer Band',
          wealth: 'Modest Trail Provisions & Cart',
          socialPosition: 'Frontier Ranger / Explorer',
        },
      },
      {
        id: 'arcane_sanctuary',
        label: 'Archmage Sanctuary Ward',
        description: 'Raised within a secluded crystalline high tower among spell scrolls, familiars, and grimoires.',
        data: {
          socialStatus: 'Tower Apprentice',
          familyStatus: 'Elder Mage Sanctuary',
          wealth: 'Rare Spell Materials & Laboratory',
          socialPosition: 'Senior Disciple',
        },
      },
      {
        id: 'humble_village',
        label: 'Borderland Village Artisan',
        description: 'Grounded upbringing in a quiet river vale, uncorrupted by corrupt nobility or royal greed.',
        data: {
          socialStatus: 'Respected Commoner Artisan',
          familyStatus: 'Honorable Village Smithy',
          wealth: 'Modest Silver & Handcrafted Gear',
          socialPosition: 'Free Journeyman',
        },
      },
    ],
  },
  {
    id: 'abilities',
    name: 'Inherent Gift & Magic Affinity',
    description: 'The metaphysical affinities, rare soul blessings, and unique combat or arcane gifts you retain.',
    options: [
      {
        id: 'solar_flame',
        label: 'Solar Dawnfire & Radiant Smite',
        description: 'Purifying cosmic flames that burn away corruption, ward allies, and incinerate dark curses.',
        data: {
          magicAffinity: ['Solar Flame', 'Radiance'],
          specialAbilities: ['Dawnfire Pillar', 'Solar Aegis', 'Sunburst Cleave'],
          talents: ['Purification Resonance', 'Blazing Presence'],
        },
      },
      {
        id: 'starlight_chronos',
        label: 'Starlight Phase & Chrono-Blink',
        description: 'Bending space and brief moments of time; instantaneous dimensional blinking and trajectory sight.',
        data: {
          magicAffinity: ['Starlight', 'Chrono-Spatial'],
          specialAbilities: ['Starlight Blink', 'Momentum Reversal', 'Temporal Decryption'],
          talents: ['Dimensional Anchor Mastery', 'Hyper-Speed Perception'],
        },
      },
      {
        id: 'tempest_lightning',
        label: 'Tempest Roar & Sky Lightning',
        description: 'Command over crackling ionized storms, electrical speed surges, and atmospheric thunder.',
        data: {
          magicAffinity: ['Lightning', 'Wind'],
          specialAbilities: ['Arc Lightning Flash', 'Tempest Overcharge', 'Thunderclap Dash'],
          talents: ['High Reflex Discharge', 'Storm Magnetism'],
        },
      },
      {
        id: 'abyssal_shadow',
        label: 'Abyssal Void & Umbral Threads',
        description: 'Weaving darkness into solid blades, merging with physical shadows, and absorbing malevolent spells.',
        data: {
          magicAffinity: ['Void', 'Shadow'],
          specialAbilities: ['Shadowmeld', 'Umbral Spikes', 'Void Ward'],
          talents: ['Stealth Assimilation', 'Curse Immunity'],
        },
      },
      {
        id: 'verdant_life',
        label: 'Verdant Anima & Elder Beast Speech',
        description: 'Communion with flora, rapid organic regeneration, and telepathic kinship with magical beasts.',
        data: {
          magicAffinity: ['Life', 'Earth'],
          specialAbilities: ['Verdant Overgrowth', 'Beast Tongue', 'Barkskin Surge'],
          talents: ['Cellular Regeneration', 'Wilderness Harmonization'],
        },
      },
      {
        id: 'all_mana_affinity',
        label: 'All-Element Mana Conduit',
        description: 'Extremely rare omni-resonance allowing simultaneous casting across primal elemental domains.',
        data: {
          magicAffinity: ['Fire', 'Water', 'Earth', 'Air'],
          specialAbilities: ['Elemental Cascade', 'Mana Shield Overdrive', 'Spell Inversion'],
          talents: ['Infinite Mana Decryption', 'Spell Form Mimicry'],
        },
      },
    ],
  },
  {
    id: 'story_direction',
    name: 'Story Tone & Ambition',
    description: 'The thematic core, narrative pacing, and dramatic stakes that will govern your chronicle.',
    options: [
      {
        id: 'kingdom_conquest',
        label: 'Kingdom Building & Continental Sovereignty',
        description: 'Rise from humble beginnings to unify warring factions, build cities, and establish an enduring dynasty.',
        data: {
          primaryThemes: ['Kingdom Building', 'Strategy', 'Diplomacy'],
          tone: 'Grand Strategic Epic',
        },
      },
      {
        id: 'exploration_mystery',
        label: 'Frontier Exploration & Ancient Mysteries',
        description: 'Uncharted wilderness, lost civilization ruins, cosmic anomalies, and forgotten divine artifacts.',
        data: {
          primaryThemes: ['Exploration', 'Ancient Lore', 'Adventure'],
          tone: 'Mysterious & Wonder-Filled',
        },
      },
      {
        id: 'dark_survival',
        label: 'Grim Survival & Resistance',
        description: 'A desperate struggle against overwhelming odds, corrupt councils, and encroaching horrors.',
        data: {
          primaryThemes: ['Survival', 'Resistance', 'Grit'],
          tone: 'Dark & Gritty High-Stakes',
        },
      },
      {
        id: 'noble_romance',
        label: 'Court Intrigue, Magic & Romantic Bonds',
        description: 'Passionate allegiances, masquerade balls, covert betrayals, and deep interpersonal dynamics.',
        data: {
          primaryThemes: ['Political Intrigue', 'Romance', 'Drama'],
          tone: 'Intriguing & Emotionally Rich',
        },
      },
      {
        id: 'heroic_ascension',
        label: 'Heroic Ascension & Multiverse Champion',
        description: 'Overcome trials of combat and arcane trials to protect realms from dimensional collapse.',
        data: {
          primaryThemes: ['Heroic Ascension', 'Combat', 'Valor'],
          tone: 'High Fantasy Heroic',
        },
      },
      {
        id: 'whimsical_slice_of_life',
        label: 'Cozy Arcane Crafting & Slice of Life',
        description: 'Tavern keeping, potion brewing, whimsical companions, and comforting day-to-day discoveries.',
        data: {
          primaryThemes: ['Crafting', 'Cozy Slice of Life', 'Friendship'],
          tone: 'Heartwarming & Lighthearted',
        },
      },
    ],
  },
];

// Dual Array + Named Property Record export
export const FATE_WHEEL_CATEGORIES: any = [...RAW_CATEGORIES];
FATE_WHEEL_CATEGORIES.world_type = RAW_CATEGORIES[0];
FATE_WHEEL_CATEGORIES.race = RAW_CATEGORIES[1];
FATE_WHEEL_CATEGORIES.origin = RAW_CATEGORIES[2];
FATE_WHEEL_CATEGORIES.abilities = RAW_CATEGORIES[3];
FATE_WHEEL_CATEGORIES.story_direction = RAW_CATEGORIES[4];
