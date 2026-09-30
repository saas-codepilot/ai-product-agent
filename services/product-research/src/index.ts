import type { Candidate, ProductClues } from '@ai-product-agent/types';

export interface ResearchProvider { readonly name: string; search(clues: ProductClues): Promise<Candidate[]>; }
export class DevelopmentResearchProvider implements ResearchProvider {
  readonly name = 'development-provider';
  async search(_clues: ProductClues): Promise<Candidate[]> { return []; }
}
export { WikimediaCommonsProvider } from './wikimedia.ts';
export function createResearchQuery(clues: ProductClues): string[] {
  return [clues.brand, clues.model, clues.productType, ...clues.visibleText, ...clues.distinctiveCharacteristics].filter(Boolean) as string[];
}
