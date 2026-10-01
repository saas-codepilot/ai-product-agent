import type { Candidate, ProductClues } from '@ai-product-agent/types';
import type { ResearchProvider } from './index.js';

type SearchResponse={query?:{search?:Array<{pageid:number;title:string;snippet?:string}>}};
type InfoResponse={query?:{pages?:Record<string,{imageinfo?:Array<{url?:string;descriptionurl?:string;extmetadata?:Record<string,{value?:string}>}>}>}};
export class WikimediaCommonsProvider implements ResearchProvider {
 readonly name='wikimedia-commons';
 readonly kind='public-api' as const;
 async search(clues:ProductClues):Promise<Candidate[]> {
  const query=[clues.brand,clues.model,clues.productType,...clues.visibleText].filter(Boolean).join(' ').trim();
  if(!query)return [];
  const params=new URLSearchParams({action:'query',list:'search',srsearch:query,srnamespace:'6',srlimit:'5',format:'json',origin:'*'});
  const search=await fetch(`https://commons.wikimedia.org/w/api.php?${params}`).then(r=>{if(!r.ok)throw new Error(`Wikimedia search failed (${r.status})`);return r.json() as Promise<SearchResponse>});
  const hits=search.query?.search??[]; if(!hits.length)return [];
  const infoParams=new URLSearchParams({action:'query',pageids:hits.map(h=>String(h.pageid)).join('|'),prop:'imageinfo',iiprop:'url|extmetadata',format:'json',origin:'*'});
  const info=await fetch(`https://commons.wikimedia.org/w/api.php?${infoParams}`).then(r=>r.json() as Promise<InfoResponse>);
  return hits.map((hit,index)=>{const meta=info.query?.pages?.[String(hit.pageid)]?.imageinfo?.[0];const source=`https://commons.wikimedia.org/wiki/${encodeURIComponent(hit.title.replaceAll(' ','_'))}`;const excerpt=meta?.extmetadata?.ImageDescription?.value?.replace(/<[^>]+>/g,'').slice(0,500)??hit.snippet?.replace(/<[^>]+>/g,'');return {id:crypto.randomUUID(),title:hit.title.replace(/^File:/,''),sourceName:'Wikimedia Commons',sourceUrl:source,productUrl:source,imageUrl:meta?.url,provider:this.name,providerProductId:String(hit.pageid),specifications:{},matchingSignals:[`Matched query terms: ${query}`],confidence:Math.max(35,60-index*5),status:'verified',evidence:[{sourceName:'Wikimedia Commons',sourceUrl:source,excerpt,capturedAt:new Date().toISOString()}]};});
 }
}
