import type { Candidate, ProductClues } from '@ai-product-agent/types';
import type { ResearchProvider } from './index.ts';

interface PrintfulProduct { id?: number; type_name?: string; title?: string; brand?: string | null; model?: string | null; image?: string; currency?: string; variant_count?: number; is_discontinued?: boolean; }
interface PrintfulResponse { code?: number; result?: unknown; }
export interface PrintfulProviderOptions { endpoint?: string; fetch?: typeof globalThis.fetch; }
const DEFAULT_ENDPOINT = 'https://api.printful.com/products';

const tokens=(value:string|undefined)=>new Set((value??'').toLowerCase().split(/[^a-z0-9]+/).filter(token=>token.length>2));

export class PrintfulCatalogProvider implements ResearchProvider {
  readonly name='printful-catalog';
  readonly kind='official-api' as const;
  private readonly endpoint:string;
  private readonly fetcher:typeof globalThis.fetch;
  constructor(options:PrintfulProviderOptions={}) { this.endpoint=options.endpoint??DEFAULT_ENDPOINT; this.fetcher=options.fetch??globalThis.fetch; }
  async search(clues:ProductClues,queryOverride?:string):Promise<Candidate[]> {
    const queryTokens=new Set((queryOverride??[clues.brand,clues.model,clues.productType,...clues.visibleText,...clues.distinctiveCharacteristics].filter(Boolean).join(' ')).split(/\s+/).flatMap(value=>[...tokens(value)]));
    if(!queryTokens.size)return [];
    const url=new URL(this.endpoint); url.searchParams.set('limit','100');
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),8000); let response:Response;
    try { response=await this.fetcher(url,{headers:{accept:'application/json','user-agent':'ai-product-agent/0.1 (https://github.com/saas-codepilot/ai-product-agent)'},signal:controller.signal}); } catch(error) { throw new Error(`Printful catalog request failed (${url}): ${error instanceof Error?error.message:String(error)}`); } finally { clearTimeout(timer); }
    if(!response.ok)throw new Error(`Printful catalog request failed (${response.status}) (${url})`);
    let data:PrintfulResponse; try { data=await response.json() as PrintfulResponse; } catch(error) { throw new Error(`Printful catalog returned malformed JSON (${url}): ${error instanceof Error?error.message:String(error)}`); }
    if(!Array.isArray(data.result))throw new Error(`Printful catalog returned malformed response (${url})`);
    return data.result.flatMap((raw,index)=>{const product=raw as PrintfulProduct;if(!product.id||!product.title)return[];const haystack=new Set([...tokens(product.title),...tokens(product.type_name),...tokens(product.brand??undefined),...tokens(product.model??undefined)]);const overlap=[...queryTokens].filter(token=>haystack.has(token));if(!overlap.length)return[];const source=`${this.endpoint.replace(/\/$/,'')}/${product.id}`;return[{id:crypto.randomUUID(),title:product.title,sourceName:'Printful Catalog',sourceUrl:source,productUrl:source,imageUrl:product.image,brand:product.brand??undefined,specifications:{...(product.type_name?{type:product.type_name}:{}),...(product.model?{model:product.model}:{}),...(product.variant_count!==undefined?{variantCount:String(product.variant_count)}:{}),...(product.is_discontinued!==undefined?{discontinued:String(product.is_discontinued)}:{})},matchingSignals:[`Text search: ${[...overlap].join(', ')}`],confidence:Math.min(90,55+overlap.length*10-index),status:'verified' as const,provider:this.name,providerProductId:String(product.id),providerMetadata:{providerKind:this.kind,catalog:'print-on-demand',imageSearch:'not_supported'},evidence:[{sourceName:'Printful Catalog',sourceUrl:source,excerpt:product.title,capturedAt:new Date().toISOString()}],currency:product.currency,matchMethod:'text_search' as const} satisfies Candidate];});
  }
}
