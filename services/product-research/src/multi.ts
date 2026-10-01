import type { Candidate, ProductClues } from '@ai-product-agent/types';
import type { ResearchProvider } from './index.ts';
import { deduplicateCandidates } from './dedupe.ts';
export class MultiProviderResearchService {
  private readonly providers:ResearchProvider[];
  constructor(providers:ResearchProvider[]) { this.providers=providers; }
  async search(clues:ProductClues):Promise<Candidate[]> { const settled=await Promise.allSettled(this.providers.map(p=>p.search(clues))); const all:Candidate[]=[]; settled.forEach((r,i)=>{if(r.status==='fulfilled') all.push(...r.value.map(c=>({...c,provider:c.provider??this.providers[i].name,providerMetadata:{...c.providerMetadata,providerKind:this.providers[i].kind??'public-api'}})));}); return deduplicateCandidates(all); }
}
