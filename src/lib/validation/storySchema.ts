import { z } from 'zod';

export const CharacterAppearanceSchema = z.object({
  hair: z.string().default(''),
  eyes: z.string().default(''),
  clothing: z.string().default(''),
  distinguishingFeatures: z.string().default(''),
});

export const CharacterRelationshipSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['ally', 'rival', 'mentor', 'enemy', 'family']),
  trust: z.number().min(-100).max(100).default(0),
  description: z.string().optional(),
});

export const MoralAlignmentSchema = z.enum([
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
]);

export const HeroProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  age: z.string().default('20'),
  gender: z.string().default('Unknown'),
  appearance: CharacterAppearanceSchema,
  personality: z.array(z.string()).default([]),
  race: z.string().default('Human'),
  species: z.string().optional(),
  origin: z.string().default('Unknown Village'),
  backstory: z.string().default(''),
  skills: z.array(z.string()).default([]),
  powers: z.array(z.string()).default([]),
  weapons: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  powerLevel: z.number().min(1).max(100).default(10),
  goals: z.array(z.string()).default([]),
  motivations: z.array(z.string()).default([]),
  fears: z.array(z.string()).default([]),
  secrets: z.array(z.string()).default([]),
  alignment: MoralAlignmentSchema.default('True Neutral'),
  relationships: z.array(CharacterRelationshipSchema).default([]),
  createdAt: z.number().default(() => Date.now()),
});

export const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  description: z.string().default(''),
  category: z.enum(['weapon', 'consumable', 'artifact', 'key_item', 'material']),
  effectDescription: z.string().optional(),
});

export const QuestSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  giver: z.string().default('Unknown'),
  objective: z.string().min(1),
  status: z.enum(['active', 'completed', 'failed']),
  rewardDescription: z.string().optional(),
});

export const StoryStateSchema = z.object({
  health: z.number().min(0).max(100).optional().default(100),
  maxHealth: z.number().optional().default(100),
  stamina: z.number().min(0).max(100).default(100),
  powerLevel: z.number().default(10),
  inventory: z.array(InventoryItemSchema).default([]),
  activeQuests: z.array(QuestSchema).default([]),
  worldFlags: z.record(z.string(), z.union([z.boolean(), z.string(), z.number()])).default({}),
  npcTrust: z.record(z.string(), z.number()).default({}),
  statusEffects: z.array(z.string()).default([]),
  timelineStep: z.number().default(1),
  currentLocation: z.string().default('Starting Area'),
  isGameOver: z.boolean().default(false),
  endingType: z.enum(['victory', 'tragedy', 'open', 'secret']).optional(),
});

export const ChoiceOptionSchema = z.object({
  choiceId: z.string(),
  text: z.string().min(1),
  consequenceHint: z.string().optional(),
  riskLevel: z.enum(['safe', 'moderate', 'perilous']).optional(),
  requiredItem: z.string().optional(),
  requiredStamina: z.number().optional(),
  stateImpact: StoryStateSchema.partial().optional(),
  nextSceneId: z.string().optional(),
});

export const StoryDialogueSchema = z.object({
  speaker: z.string(),
  text: z.string(),
  emotion: z.enum(['calm', 'furious', 'mysterious', 'terrified', 'warm']).optional(),
});

export const StoryTurnSchema = z.object({
  turnId: z.string(),
  chapterNumber: z.number(),
  sceneTitle: z.string(),
  narrativeText: z.string(),
  dialogues: z.array(StoryDialogueSchema).optional(),
  ambientVisual: z.string().optional(),
  choices: z.array(ChoiceOptionSchema).default([]),
  selectedChoiceId: z.string().optional(),
  customActionText: z.string().optional(),
  outcomeText: z.string().optional(),
  stateDelta: z.object({
    healthChange: z.number().optional(),
    staminaChange: z.number().optional(),
    itemsAdded: z.array(InventoryItemSchema).optional(),
    itemsRemoved: z.array(z.string()).optional(),
    questsUpdated: z.array(z.string()).optional(),
    trustChanges: z.record(z.string(), z.number()).optional(),
  }).optional(),
  timestamp: z.number(),
});

export const SupportedLanguageSchema = z.enum(['en', 'hi', 'es', 'fr', 'ja', 'ko']);

export const StorySettingsSchema = z.object({
  tone: z.enum(['Anime Shonen', 'Epic Fantasy', 'Dark & Gritty', 'Cyberpunk Noir', 'Lighthearted Isekai']),
  pacing: z.enum(['Fast-paced Action', 'Balanced Narrative', 'Deep Lore Exploration']),
  difficulty: z.enum(['Adventurer (Standard)', 'Heroic (Tactical)', 'Hardcore Iron (Unforgiving)']),
  storyLanguage: SupportedLanguageSchema.default('en').optional(),
});

export const StoryDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  createdAt: z.number(),
  updatedAt: z.number(),
  hero: HeroProfileSchema,
  genres: z.array(z.string()).min(1),
  worldId: z.string(),
  worldName: z.string(),
  settings: StorySettingsSchema,
  state: StoryStateSchema,
  turns: z.array(StoryTurnSchema),
  status: z.enum(['active', 'completed', 'archived']),
  version: z.number().default(1),
  generationMode: z.enum(['demo', 'ai']).default('demo'),
  storyLanguage: SupportedLanguageSchema.default('en'),
});

export const BackupEnvelopeSchema = z.object({
  app: z.literal('BranchVerse'),
  version: z.number(),
  exportedAt: z.number(),
  storyCount: z.number(),
  stories: z.array(StoryDocumentSchema),
});
