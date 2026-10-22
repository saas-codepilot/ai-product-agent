import type { Candidate, ProductClues } from '@ai-product-agent/types';
import type { ResearchProvider } from './index.js';

type SearchResponse={query?:{search?:Array<{pageid:number;title:string;snippet?:string}>}};

export class WikipediaProvider implements ResearchProvider {
 readonly name='wikipedia';
 readonly kind='public-api' as const;
 async search(clues:ProductClues,queryOverride?:string):Promise<Candidate[]> {
  const query=queryOverride??[clues.brand,clues.model,clues.productType,...clues.visibleText,...clues.distinctiveCharacteristics].filter(Boolean).join(' ').trim();
  if(!query)return [];
  const params=new URLSearchParams({action:'query',list:'search',srsearch:query,srnamespace:'0',srlimit:'5',format:'json',origin:'*'});
  const url=`https://en.wikipedia.org/w/api.php?${params}`;
  let response:Response;try{response=await fetch(url);}catch(error){const cause=(error as any)?.cause;const detail=error instanceof Error?error.message:String(error);throw new Error(`Wikipedia search request failed (${url}): ${detail}${cause?.code?` [${cause.code}]`:''}`);}if(!response.ok)throw new Error(`Wikipedia search request failed (${response.status}) (${url})`);
  let data:SearchResponse;try{data=await response.json() as SearchResponse;}catch(error){const detail=error instanceof Error?error.message:String(error);throw new Error(`Wikipedia search returned malformed JSON (${url}): ${detail}`);}
  if(!data.query||!Array.isArray(data.query.search))throw new Error(`Wikipedia search returned malformed response (${url})`);
  return data.query.search.map((hit,index)=>{const source=`https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replaceAll(' ','_'))}`;return {id:crypto.randomUUID(),title:hit.title,sourceName:'Wikipedia',sourceUrl:source,productUrl:source,provider:this.name,providerProductId:String(hit.pageid),specifications:{},matchingSignals:[`Text clue search: ${query}`],confidence:Math.max(30,55-index*5),status:'inferred',evidence:[{sourceName:'Wikipedia',sourceUrl:source,excerpt:hit.snippet?.replace(/<[^>]+>/g,'').slice(0,500),capturedAt:new Date().toISOString()}]};});
 }
}
