import type { Candidate, ProductClues } from '@ai-product-agent/types';
import type { ResearchProvider } from './index.js';

type SearchResponse={query?:{search?:Array<{pageid:number;title:string;snippet?:string}>}};
type InfoResponse={query?:{pages?:Record<string,{imageinfo?:Array<{url?:string;descriptionurl?:string;extmetadata?:Record<string,{value?:string}>}>}>}};
async function fetchJson<T>(url:string,stage:string):Promise<T>{let response:Response;try{response=await fetch(url);}catch(error){const cause=(error as any)?.cause;const detail=error instanceof Error?error.message:String(error);throw new Error(`Wikimedia ${stage} request failed (${url}): ${detail}${cause?.code?` [${cause.code}]`:''}`);}if(!response.ok)throw new Error(`Wikimedia ${stage} request failed (${response.status}) (${url})`);try{return await response.json() as T;}catch(error){const detail=error instanceof Error?error.message:String(error);throw new Error(`Wikimedia ${stage} returned malformed JSON (${url}): ${detail}`);}}
export class WikimediaCommonsProvider implements ResearchProvider {
 readonly name='wikimedia-commons';
 readonly kind='public-api' as const;
 async search(clues:ProductClues,queryOverride?:string):Promise<Candidate[]> {
  const query=queryOverride??[clues.brand,clues.model,clues.productType,...clues.visibleText].filter(Boolean).join(' ').trim();
  if(!query)return [];
  const params=new URLSearchParams({action:'query',list:'search',srsearch:query,srnamespace:'6',srlimit:'5',format:'json',origin:'*'});
  const searchUrl=`https://commons.wikimedia.org/w/api.php?${params}`,search=await fetchJson<SearchResponse>(searchUrl,'search');
  if(!search.query||!Array.isArray(search.query.search))throw new Error(`Wikimedia search returned malformed response (${searchUrl})`);
  const hits=search.query.search; if(!hits.length)return [];
  const infoParams=new URLSearchParams({action:'query',pageids:hits.map(h=>String(h.pageid)).join('|'),prop:'imageinfo',iiprop:'url|extmetadata',format:'json',origin:'*'});
  const infoUrl=`https://commons.wikimedia.org/w/api.php?${infoParams}`,info=await fetchJson<InfoResponse>(infoUrl,'metadata');
  if(!info.query||!info.query.pages||typeof info.query.pages!=='object')throw new Error(`Wikimedia metadata returned malformed response (${infoUrl})`);
  return hits.map((hit,index)=>{const meta=info.query?.pages?.[String(hit.pageid)]?.imageinfo?.[0];const source=`https://commons.wikimedia.org/wiki/${encodeURIComponent(hit.title.replaceAll(' ','_'))}`;const excerpt=meta?.extmetadata?.ImageDescription?.value?.replace(/<[^>]+>/g,'').slice(0,500)??hit.snippet?.replace(/<[^>]+>/g,'');return {id:crypto.randomUUID(),title:hit.title.replace(/^File:/,''),sourceName:'Wikimedia Commons',sourceUrl:source,productUrl:source,imageUrl:meta?.url,provider:this.name,providerProductId:String(hit.pageid),specifications:{},matchingSignals:[`Matched query terms: ${query}`],confidence:Math.max(35,60-index*5),status:'verified',evidence:[{sourceName:'Wikimedia Commons',sourceUrl:source,excerpt,capturedAt:new Date().toISOString()}]};});
 }
}
