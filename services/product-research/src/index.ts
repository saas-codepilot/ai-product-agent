import type { Candidate, ProductClues } from '@ai-product-agent/types';
import { WikimediaCommonsProvider } from './wikimedia.ts';
import { WikipediaProvider } from './wikipedia.ts';
import { EbayBrowseProvider, type EbayProviderOptions } from './ebay.ts';
import { OpenFoodFactsProvider, type OpenFoodFactsProviderOptions } from './openfoodfacts.ts';
import { PrintfulCatalogProvider } from './printful.ts';

export type ResearchProviderStatus = 'configured'|'unavailable'|'not-configured';
export type ResearchSearchMode = 'text'|'image';
export interface ResearchProviderCapabilities { configured:boolean; status:ResearchProviderStatus; searchModes:ResearchSearchMode[]; coverage:string; fields:string[]; credentials:string[]; accessRestrictions:string; sourceAttribution:string; lastCheckedAt?:string; }
export class ResearchProviderError extends Error { readonly code:'RESEARCH_PROVIDER_UNAVAILABLE'|'RESEARCH_PROVIDER_NOT_CONFIGURED'; constructor(code:'RESEARCH_PROVIDER_UNAVAILABLE'|'RESEARCH_PROVIDER_NOT_CONFIGURED',message:string){super(message);this.name='ResearchProviderError';this.code=code;} }
export interface ResearchProvider { readonly name: string; readonly kind?: 'public-api'|'official-api'|'development'|'unavailable'; readonly status?: ResearchProviderStatus; readonly capabilities?: ResearchProviderCapabilities; search(clues: ProductClues, query?:string): Promise<Candidate[]>; retrieve?(productId: string): Promise<Candidate|undefined>; }
export class UnavailableResearchProvider implements ResearchProvider {
  readonly kind = 'unavailable' as const;
  readonly status:ResearchProviderStatus;
  readonly name: string;
  private readonly reason: string;
  constructor(name: string, reason: string, status:ResearchProviderStatus='unavailable') { this.name = name; this.reason = reason; this.status=status; }
  async search(_clues: ProductClues): Promise<Candidate[]> { throw new ResearchProviderError(this.status==='not-configured'?'RESEARCH_PROVIDER_NOT_CONFIGURED':'RESEARCH_PROVIDER_UNAVAILABLE',`${this.name} provider ${this.status==='not-configured'?'is not configured':'is unavailable'}: ${this.reason}`); }
}
export class DevelopmentResearchProvider implements ResearchProvider {
  readonly name = 'development-provider';
  readonly status='configured' as const;
  async search(_clues: ProductClues): Promise<Candidate[]> { return []; }
}
export function describeResearchProvider(provider:ResearchProvider,lastCheckedAt=new Date().toISOString()):ResearchProviderCapabilities { const status=provider.status??(provider.kind==='unavailable'?'unavailable':'configured'); const common={configured:status==='configured',status,lastCheckedAt}; if(provider.name==='ebay-browse'||provider.name==='ebay')return {...common,searchModes:['text'],coverage:'General eBay marketplace listings; credentials and marketplace access required.',fields:['title','canonical listing URL','image','price','currency','condition'],credentials:['EBAY_CLIENT_ID','EBAY_CLIENT_SECRET'],accessRestrictions:'Official Browse API access and OAuth credentials; no anonymous access assumed.',sourceAttribution:'eBay Browse API'}; if(provider.name==='printful-catalog')return {...common,searchModes:['text'],coverage:'Printful print-on-demand catalog only; not a general marketplace.',fields:['title','catalog URL','image','brand','model','variant count','currency when supplied'],credentials:[],accessRestrictions:'Official catalog endpoint; catalog data does not guarantee consumer prices or marketplace listings.',sourceAttribution:'Printful Catalog API'}; if(provider.name==='openfoodfacts')return {...common,searchModes:['text'],coverage:'Food and packaged-food products only.',fields:['title','product URL','image','brand','categories'],credentials:[],accessRestrictions:'Public API with descriptive User-Agent and responsible request volume.',sourceAttribution:'Open Food Facts API'}; if(provider.name==='wikimedia-commons'||provider.name==='wikipedia')return {...common,searchModes:['text'],coverage:'Public reference/media content; not commercial product listings.',fields:['title','source URL','image when supplied','snippet'],credentials:[],accessRestrictions:'Public API usage policies; no uploaded-image reverse search.',sourceAttribution:provider.name==='wikipedia'?'Wikipedia API':'Wikimedia Commons API'}; return {...common,searchModes:[],coverage:'No external catalog; development fallback only.',fields:[],credentials:[],accessRestrictions:'No external provider configured.',sourceAttribution:provider.name}; }
export { WikimediaCommonsProvider } from './wikimedia.ts';
export { WikipediaProvider } from './wikipedia.ts';
export { EbayBrowseProvider } from './ebay.ts';
export { OpenFoodFactsProvider } from './openfoodfacts.ts';
export { PrintfulCatalogProvider } from './printful.ts';
export { rankCandidates } from './matching.ts';
export { deduplicateCandidates, normalizeProductUrl } from './dedupe.ts';
export { MultiProviderResearchService } from './multi.ts';
export { matchCandidateImages } from './visual.ts';
export function createResearchQuery(clues: ProductClues): string[] {
  const clean = [clues.brand, clues.model, clues.productType, ...clues.visibleText, ...clues.distinctiveCharacteristics]
    .map(value => value?.trim())
    .filter((value): value is string => Boolean(value));
  const variants = [
    [clues.brand, clues.model, clues.productType],
    [clues.productType, ...clues.visibleText],
    [clues.productType, ...clues.distinctiveCharacteristics],
    clean
  ].map(query => query.filter((value): value is string => Boolean(value?.trim())).join(' ').trim());
  return [...new Set(variants.filter(Boolean))];
}
export function createResearchProviders(configuration:string,options:{ebay?:EbayProviderOptions;openFoodFacts?:OpenFoodFactsProviderOptions}={}):ResearchProvider[]{
 const names=configuration.split(',').map(name=>name.trim().toLowerCase()).filter(Boolean);
 if(names.includes('development'))return [new DevelopmentResearchProvider()];
 if(!names.length)return [new DevelopmentResearchProvider()];
 const providers: ResearchProvider[]=names.map(name=>name==='ebay'?(options.ebay?.clientId&&options.ebay.clientSecret?new EbayBrowseProvider(options.ebay):new UnavailableResearchProvider('ebay','requires EBAY_CLIENT_ID and EBAY_CLIENT_SECRET','not-configured')):name==='openfoodfacts'?new OpenFoodFactsProvider(options.openFoodFacts):name==='printful'?new PrintfulCatalogProvider():name==='wikipedia'?new WikipediaProvider():name==='wikimedia'?new WikimediaCommonsProvider():new UnavailableResearchProvider(name,'provider is not configured','not-configured'));
 return providers;
}
