import { StoryDocument } from '../../types/story';
import { BackupEnvelope } from '../../types/storage';
import { BackupEnvelopeSchema, StoryDocumentSchema } from '../validation/storySchema';
import { storyRepository } from './storyRepository';

export function exportStoryToMarkdown(story: StoryDocument): string {
  const dateStr = new Date(story.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const lines: string[] = [];

  lines.push(`# ${story.title}`);
  lines.push(`*BranchVerse — "Your Choices. Your World. Your Story."*`);
  lines.push(`\n**Hero:** ${story.hero.name} (${story.hero.race}) | **World:** ${story.worldName} | **Date:** ${dateStr}`);
  lines.push(`**Genres:** ${story.genres.join(', ')} | **Status:** ${story.status.toUpperCase()}`);
  lines.push(`\n---\n`);

  lines.push(`## Hero Profile: ${story.hero.name}`);
  lines.push(`- **Origin:** ${story.hero.origin}`);
  lines.push(`- **Appearance:** ${story.hero.appearance.hair}, ${story.hero.appearance.eyes}`);
  lines.push(`- **Clothing:** ${story.hero.appearance.clothing}`);
  lines.push(`- **Personality:** ${story.hero.personality.join(', ')}`);
  lines.push(`- **Weapons:** ${story.hero.weapons.join(', ')}`);
  lines.push(`- **Powers:** ${story.hero.powers.join(', ')}`);
  lines.push(`- **Backstory:** ${story.hero.backstory}`);
  lines.push(`\n---\n`);

  lines.push(`## Chronicle & Narrative Branches\n`);

  story.turns.forEach((turn, idx) => {
    lines.push(`### Chapter ${turn.chapterNumber}: ${turn.sceneTitle}`);
    lines.push(`\n${turn.narrativeText}\n`);

    if (turn.dialogues && turn.dialogues.length > 0) {
      turn.dialogues.forEach(d => {
        lines.push(`> **${d.speaker}**: "${d.text}"`);
      });
      lines.push('');
    }

    if (turn.customActionText) {
      lines.push(`\n*Player Action:*\n> "${turn.customActionText}"\n`);
      if (turn.outcomeText) {
        lines.push(`*Outcome:* ${turn.outcomeText}\n`);
      }
    } else if (turn.selectedChoiceId) {
      const selected = turn.choices.find(c => c.choiceId === turn.selectedChoiceId);
      if (selected) {
        lines.push(`\n*Choice Taken:*\n> **${selected.text}**\n`);
      }
    }

    if (idx < story.turns.length - 1) {
      lines.push(`\n* * *\n`);
    }
  });

  lines.push(`\n---\n`);
  lines.push(`## Final Hero Status`);
  lines.push(`- **Health:** ${story.state.health}/${story.state.maxHealth}`);
  lines.push(`- **Stamina:** ${story.state.stamina}/100`);
  lines.push(`- **Power Level:** ${story.state.powerLevel}/100`);
  lines.push(`- **Current Location:** ${story.state.currentLocation}`);

  lines.push(`\n### Inventory`);
  if (story.state.inventory.length === 0) {
    lines.push(`*(Empty)*`);
  } else {
    story.state.inventory.forEach(item => {
      lines.push(`- **${item.name}** (x${item.quantity}): ${item.description}`);
    });
  }

  lines.push(`\n### Quests`);
  story.state.activeQuests.forEach(q => {
    lines.push(`- [${q.status === 'completed' ? 'x' : ' '}] **${q.title}**: ${q.objective}`);
  });

  return lines.join('\n');
}

export function exportStoriesToJson(stories: StoryDocument[]): string {
  const envelope: BackupEnvelope = {
    app: 'BranchVerse',
    version: 1,
    exportedAt: Date.now(),
    storyCount: stories.length,
    stories
  };

  return JSON.stringify(envelope, null, 2);
}

export async function importStoriesFromJson(jsonString: string): Promise<number> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format: Unable to parse file.');
  }

  let storiesToImport: StoryDocument[] = [];

  // Check if it's a BackupEnvelope
  const envelopeCheck = BackupEnvelopeSchema.safeParse(parsed);
  if (envelopeCheck.success) {
    storiesToImport = envelopeCheck.data.stories;
  } else {
    // Check if it's a single StoryDocument
    const singleStoryCheck = StoryDocumentSchema.safeParse(parsed);
    if (singleStoryCheck.success) {
      storiesToImport = [singleStoryCheck.data];
    } else {
      // Gather validation error details safely across Zod versions
      const issues = (envelopeCheck.error as any)?.issues || (envelopeCheck.error as any)?.errors || [];
      const errorMsg = issues.length > 0 
        ? issues.map((e: any) => `${e.path?.join('.') || 'field'}: ${e.message}`).slice(0, 3).join('; ')
        : 'Schema mismatch';
      throw new Error(`Data validation failed: Not a valid BranchVerse story archive. (${errorMsg})`);
    }
  }

  if (storiesToImport.length === 0) {
    throw new Error('Archive contains 0 stories.');
  }

  // Save each story into IndexedDB
  for (const story of storiesToImport) {
    await storyRepository.saveStory(story);
  }

  return storiesToImport.length;
}
