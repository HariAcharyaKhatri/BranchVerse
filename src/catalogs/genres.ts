import { GenreDefinition } from '../types/world';

export const GENRE_CATALOG: GenreDefinition[] = [
  {
    id: 'fantasy',
    name: 'High Fantasy',
    tagline: 'Ancient kingdoms, dragons, and forbidden spells',
    icon: 'Sparkles',
    description: 'Immerse in sweeping fantasy realms where sorcery pulses through the ley lines and ancient relics await discovery.',
    compatibleWith: ['action', 'mythology', 'romance', 'isekai', 'supernatural'],
    color: '#6366f1'
  },
  {
    id: 'anime',
    name: 'Anime & Manga',
    tagline: 'Passionate vows, explosive battles, and boundless spirit',
    icon: 'Flame',
    description: 'Classic shonen and seinen tropes, dramatic rivals, power awakenings, and emotional character arcs.',
    compatibleWith: ['action', 'martial_arts', 'isekai', 'school_life', 'supernatural'],
    color: '#f97316'
  },
  {
    id: 'isekai',
    name: 'Isekai & Reincarnation',
    tagline: 'Summoned to another world with strange powers',
    icon: 'Compass',
    description: 'Reborn or transported from modern life into a fantastical new universe with unique skills and cheat abilities.',
    compatibleWith: ['fantasy', 'anime', 'comedy', 'action', 'school_life'],
    color: '#06b6d4'
  },
  {
    id: 'cyberpunk',
    name: 'Sci-Fi & Cyberpunk',
    tagline: 'Neon-drenched mega-cities, cyberware, and corporate hegemony',
    icon: 'Cpu',
    description: 'In a rain-slicked metropolis, neural implants, rogue AI, and underground mercenaries collide.',
    compatibleWith: ['action', 'mystery', 'post_apocalyptic', 'supernatural'],
    color: '#ec4899'
  },
  {
    id: 'cultivation',
    name: 'Martial Arts & Cultivation',
    tagline: 'Circulate spiritual Qi, defy the heavens, and transcend mortality',
    icon: 'Zap',
    description: 'Wuxia and Xianxia traditions where martial artists condense golden cores, refine pills, and battle sect patriarchs.',
    compatibleWith: ['fantasy', 'anime', 'action', 'mythology'],
    color: '#eab308'
  },
  {
    id: 'action',
    name: 'Action & Adventure',
    tagline: 'High-stakes chases, perilous expeditions, and narrow escapes',
    icon: 'Sword',
    description: 'Thrilling journeys across uncharted frontiers filled with dynamic combat and daring rescues.',
    compatibleWith: ['fantasy', 'cyberpunk', 'ninja', 'horror', 'anime'],
    color: '#ef4444'
  },
  {
    id: 'mystery',
    name: 'Horror & Mystery',
    tagline: 'Cosmic dread, shadowy investigations, and occult secrets',
    icon: 'Eye',
    description: 'Uncover psychological secrets, investigate cursed villages, and survive what lurks beyond the candlelight.',
    compatibleWith: ['supernatural', 'cyberpunk', 'fantasy', 'action'],
    color: '#a855f7'
  },
  {
    id: 'ninja',
    name: 'Ninja & Samurai',
    tagline: 'Feudal honour, shadow espionage, and unsheathed steel',
    icon: 'Shield',
    description: 'Silent midnight rooftops, forbidden ninjutsu scrolls, and bushido duels under moonlit cherry blossoms.',
    compatibleWith: ['action', 'anime', 'martial_arts', 'supernatural'],
    color: '#14b8a6'
  },
  {
    id: 'supernatural',
    name: 'Supernatural & Urban Occult',
    tagline: 'Modern cities hiding covens, spirits, and exorcists',
    icon: 'Ghost',
    description: 'Spirits and demons walk among ordinary humans, fought by modern spellcasters and phantom investigators.',
    compatibleWith: ['mystery', 'anime', 'romance', 'school_life'],
    color: '#8b5cf6'
  },
  {
    id: 'romance',
    name: 'Romance & Drama',
    tagline: 'Fateful bonds, rivalries turning to passion, and heartfelt vows',
    icon: 'Heart',
    description: 'Emotional stakes, complex love triangles, royal court intrigue, and relationships tested by destiny.',
    compatibleWith: ['fantasy', 'school_life', 'anime', 'historical'],
    color: '#f43f5e'
  },
  {
    id: 'mythology',
    name: 'Mythology & Historical Fantasy',
    tagline: 'Gods walking among men, epic poems, and ancient folklore',
    icon: 'Crown',
    description: 'Norse sagas, Greek pantheons, and Vedic epics come alive with legendary relics and divine intervention.',
    compatibleWith: ['fantasy', 'action', 'cultivation'],
    color: '#f59e0b'
  },
  {
    id: 'school_life',
    name: 'School Life & Comedy',
    tagline: 'Magic academies, club rivalries, and hilarious blunders',
    icon: 'GraduationCap',
    description: 'High school tournaments, eccentric professors, after-school guilds, and lighthearted slice-of-life humor.',
    compatibleWith: ['anime', 'isekai', 'supernatural', 'romance'],
    color: '#10b981'
  },
  {
    id: 'post_apocalyptic',
    name: 'Post-Apocalyptic',
    tagline: 'Scavenging broken ruins after civilization has fallen',
    icon: 'Skull',
    description: 'Wasteland survival, mutant beasts, scarcity of water, and fighting over remnants of old-world technology.',
    compatibleWith: ['cyberpunk', 'action', 'mystery'],
    color: '#78716c'
  }
];
