import { FixedOpeningScene } from './reincarnationTypes';

export interface CanonSceneData {
  id: FixedOpeningScene;
  title: string;
  location: string;
  timestampHint: string;
  paragraphs: string[];
  ambientVisual: string;
  nextPrompt: string;
}

export const CANON_ANGEL = {
  name: 'Seraphina',
  title: 'Divine Herald of the Multiverse',
  epithet: 'Guardian of Transmigration & Rebirth',
  description: 'A radiant angelic presence crowned with a luminous golden halo, draped in starlight silk, and possessing four folded prismatic wings of celestial light.',
  dialogueStyle: 'Serene, compassionate, noble, and deeply attentive.',
  portraitPath: '/assets/characters/angel/celestial-seraphina-angel.svg',
  crestPath: '/assets/characters/angel/angel-crest.svg',
  initialGreeting: 'Welcome, lost soul, mortal traveler of Earth. The storms of your former world have settled, yet your thread is not ended. Before we speak of the infinite horizons awaiting you... tell me, what should I call you?',
  nameInquiry: 'Before we speak of the infinite horizons awaiting you... tell me, what is your name?',
  farewellBlessing: 'May your will carve constellations across the firmament, and may your deeds echo with honor across the tapestry of worlds. Go forth, and live truly.',
};

export const FIXED_OPENING_CANON: Record<FixedOpeningScene, CanonSceneData> = {
  previous_life: {
    id: 'previous_life',
    title: 'The Previous Life: The Last Night',
    location: 'Earth • Late Night Quiet',
    timestampHint: '03:14 AM • Cold Autumn Tempest',
    paragraphs: [
      'The rhythmic drumming of rain against the window was the only sound keeping the silence of the night at bay. Streetlights filtered through the glass, casting watery amber ripples across an unfinished project lying before you.',
      'For years, you had poured your heart into creating, striving, and dreaming of worlds beyond the reach of ordinary horizons. There was so much left undone—promises whispered to the future, journeys waiting for the right moment.',
      'A profound, peaceful exhaustion slowly enveloped your chest. The ticking clock on the wall seemed to slow, its mechanical rhythm fading into a gentle whisper. You closed your eyes, exhaling a quiet breath as the mortal world slipped away, the familiar world slips away into quiet dark.',
    ],
    ambientVisual: 'rain_window',
    nextPrompt: 'Step into the silence...',
  },
  transition: {
    id: 'transition',
    title: 'The Transition: Beyond the Veil',
    location: 'Between Worlds • The Astral Drift',
    timestampHint: 'Timeless • Non-Euclidean Expanse',
    paragraphs: [
      'There was no coldness. No pain. Only an astonishing weightlessness as physical gravity unraveled its grip on your consciousness.',
      'Around you, memories of your earthly existence drifted as iridescent ribbons of light—laughter, rainy mornings, quiet triumphs, and unfulfilled hopes—each thread weaving into a tapestry of silver and gold.',
      'You rose through towering auroras of deep midnight purple and starlight cyan. The boundaries of matter and mortality melted into pure harmony as a distant celestial light beckoned.',
    ],
    ambientVisual: 'astral_stream',
    nextPrompt: 'Awaken in the unknown...',
  },
  afterlife_awakening: {
    id: 'afterlife_awakening',
    title: 'Awakening in the Afterlife',
    location: 'The Nexus of Divine Grace',
    timestampHint: 'The Sanctuary of Transition',
    paragraphs: [
      'Consciousness returned not with a jolt, but like a morning tide gently washing over silver sands.',
      'Beneath your feet stretched a vast, mirror-smooth plane of crystallized obsidian, reflecting billions of swirling nebulae and constellations you had never seen in earthly skies.',
      'You lifted your hands. They were woven of luminous starlight, tranquil and free of any physical frailty. A serene warmth radiated from the center of this sacred sanctuary—a quiet certainty that this was not an end, but a magnificent threshold in The Nexus of Divine Grace.',
    ],
    ambientVisual: 'obsidian_nexus',
    nextPrompt: 'Look toward the descending light...',
  },
  angel_arrival: {
    id: 'angel_arrival',
    title: 'Arrival Before the Divine Angel',
    location: 'The Throne of Rebirth',
    timestampHint: 'The Divine Encounter',
    paragraphs: [
      'A chime like crystal bells resonated through the expanse. A pillar of warm golden dawn parted the obsidian reflections.',
      'Descending upon wings of feathered starlight and iridescent prismatic light, a majestic celestial figure manifested before you. A halo of starlight crowned her serene countenance, and her eyes held the depth of ancient galaxies.',
      'Her gaze rested upon you with boundless compassion and quiet honor. Gently folding her wings, she stepped forward onto the obsidian floor, her voice like a melodious song in the quiet.',
    ],
    ambientVisual: 'angel_manifestation',
    nextPrompt: 'Speak with the Divine Angel...',
  },
};

export const CANON_OPENING_SCENES: Array<{
  id: FixedOpeningScene;
  order: number;
  title: string;
  narrativeText: string;
  atmosphere: string;
  visualCues: string;
}> = [
  {
    id: 'previous_life',
    order: 1,
    title: FIXED_OPENING_CANON.previous_life.title,
    narrativeText: FIXED_OPENING_CANON.previous_life.paragraphs.join('\n\n'),
    atmosphere: FIXED_OPENING_CANON.previous_life.timestampHint,
    visualCues: 'Quiet late-night storm outside, mechanical clock ticks slowing, familiar world slips away into peaceful darkness.',
  },
  {
    id: 'transition',
    order: 2,
    title: FIXED_OPENING_CANON.transition.title,
    narrativeText: FIXED_OPENING_CANON.transition.paragraphs.join('\n\n'),
    atmosphere: FIXED_OPENING_CANON.transition.timestampHint,
    visualCues: 'Weightlessness, memories as iridescent ribbons of light, passing through violet and gold auroras.',
  },
  {
    id: 'afterlife_awakening',
    order: 3,
    title: FIXED_OPENING_CANON.afterlife_awakening.title,
    narrativeText: FIXED_OPENING_CANON.afterlife_awakening.paragraphs.join('\n\n'),
    atmosphere: FIXED_OPENING_CANON.afterlife_awakening.timestampHint,
    visualCues: 'Mirror-like crystallized obsidian reflecting nebulae, infinite silence and peace, The Nexus of Divine Grace.',
  },
  {
    id: 'angel_arrival',
    order: 4,
    title: FIXED_OPENING_CANON.angel_arrival.title,
    narrativeText: FIXED_OPENING_CANON.angel_arrival.paragraphs.join('\n\n'),
    atmosphere: FIXED_OPENING_CANON.angel_arrival.timestampHint,
    visualCues: 'Cascades of golden dawn, halo of celestial geometry, Seraphina manifests with wings of feathered starlight.',
  },
];
