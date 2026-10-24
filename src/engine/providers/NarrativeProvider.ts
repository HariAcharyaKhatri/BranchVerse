import { NarrativePromptContext } from '../narrative/NarrativeContextBuilder';
import { NarrativeProposal } from '../narrative/NarrativeSchema';

export interface NarrativeProvider {
  readonly name: string;
  readonly isLocal: boolean;

  generateNarrative(context: NarrativePromptContext): Promise<NarrativeProposal>;
}
