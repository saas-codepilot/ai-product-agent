import type { Candidate, ProductClues } from '@ai-product-agent/types';

export interface ResearchProvider { readonly name: string; readonly kind?: 'public-api'|'official-api'|'development'; search(clues: ProductClues): Promise<Candidate[]>; retrieve?(productId: string): Promise<Candidate|undefined>; }
export class DevelopmentResearchProvider implements ResearchProvider {
  readonly name = 'development-provider';
  async search(_clues: ProductClues): Promise<Candidate[]> { return []; }
}
export { WikimediaCommonsProvider } from './wikimedia.ts';
export { rankCandidates } from './matching.ts';
export { deduplicateCandidates, normalizeProductUrl } from './dedupe.ts';
export { MultiProviderResearchService } from './multi.ts';
export function createResearchQuery(clues: ProductClues): string[] {
  return [clues.brand, clues.model, clues.productType, ...clues.visibleText, ...clues.distinctiveCharacteristics].filter(Boolean) as string[];
}
