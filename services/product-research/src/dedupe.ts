import type { Candidate } from '@ai-product-agent/types';

export function normalizeProductUrl(value: string): string {
  try { const url = new URL(value); url.hash=''; ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','ref'].forEach(k=>url.searchParams.delete(k)); return url.toString().replace(/\/$/,'').toLowerCase(); } catch { return value.trim().toLowerCase(); }
}
const normalizedTitle=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean).join(' ');
function sameProduct(a:Candidate,b:Candidate):boolean {
  if (normalizeProductUrl(a.productUrl)===normalizeProductUrl(b.productUrl)) return true;
  if (a.provider&&b.provider&&a.providerProductId&&a.provider===b.provider&&a.providerProductId===b.providerProductId) return true;
  const brand=(a.brand??'').toLowerCase(), other=(b.brand??'').toLowerCase();
  const modelA=a.specifications.model??'', modelB=b.specifications.model??'';
  return !!brand&&brand===other&&!!modelA&&modelA.toLowerCase()===modelB.toLowerCase()&&normalizedTitle(a.title)===normalizedTitle(b.title);
}
export function deduplicateCandidates(candidates:Candidate[]):Candidate[] {
  const result:Candidate[]=[];
  for (const candidate of candidates) { const existing=result.find(item=>sameProduct(item,candidate)); if (!existing) { result.push({...candidate,provenance:candidate.provenance??[{provider:candidate.provider??candidate.sourceName,sourceUrl:candidate.sourceUrl,productId:candidate.providerProductId}]}); continue; } existing.provenance=Array.from(new Map([...(existing.provenance??[]),...(candidate.provenance??[{provider:candidate.provider??candidate.sourceName,sourceUrl:candidate.sourceUrl,productId:candidate.providerProductId}])].map(p=>[`${p.provider}:${p.sourceUrl}`,p])).values()); existing.evidence=[...existing.evidence,...candidate.evidence].filter((e,i,a)=>a.findIndex(x=>x.sourceUrl===e.sourceUrl&&x.excerpt===e.excerpt)===i); existing.matchingSignals=Array.from(new Set([...existing.matchingSignals,...candidate.matchingSignals])); existing.confidence=Math.max(existing.confidence,candidate.confidence); }
  return result;
}
