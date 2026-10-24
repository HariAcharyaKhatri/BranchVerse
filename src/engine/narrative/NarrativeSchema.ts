import { z } from 'zod';

export const NarrativeDialogueSchema = z.object({
  speaker: z.string().min(1),
  text: z.string().min(1),
  emotion: z.enum(['calm', 'furious', 'mysterious', 'terrified', 'warm']).optional(),
});

export const NarrativeChoiceProposalSchema = z.object({
  choiceId: z.string().min(1),
  text: z.string().min(3),
  consequenceHint: z.string().optional(),
  riskLevel: z.enum(['safe', 'moderate', 'perilous']).optional(),
  requiredItem: z.string().optional(),
  requiredStamina: z.number().min(0).optional(),
  actionIntent: z.enum([
    'talk',
    'investigate',
    'travel',
    'combat',
    'use_item',
    'trade',
    'persuade',
    'stealth',
    'interact',
    'quest',
    'rest',
    'creative',
  ]).optional(),
});

export const NarrativeProposalSchema = z.object({
  sceneTitle: z.string().min(2),
  narrativeText: z.string().min(10),
  dialogues: z.array(NarrativeDialogueSchema).default([]),
  ambientVisual: z.string().optional(),
  proposedChoices: z.array(NarrativeChoiceProposalSchema).min(2).max(5),
  proposedStateDelta: z.record(z.string(), z.any()).optional(),
  unlockedEndingId: z.string().optional(),
});

export type NarrativeProposal = z.infer<typeof NarrativeProposalSchema>;
