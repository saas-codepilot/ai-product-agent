import type { Candidate, ProductClues } from '@ai-product-agent/types';
import type { ResearchProvider } from './index.ts';

interface OpenFoodFactsProduct { code?: string; product_name?: string; brands?: string; categories?: string; image_front_url?: string; url?: string; }
interface OpenFoodFactsSearchResponse { count?: number; products?: unknown; }
export interface OpenFoodFactsProviderOptions { userAgent?: string; endpoint?: string; fetch?: typeof globalThis.fetch; }
const DEFAULT_ENDPOINT = 'https://world.openfoodfacts.org/cgi/search.pl';
const DEFAULT_USER_AGENT = 'ai-product-agent/0.1 (https://github.com/saas-codepilot/ai-product-agent)';

export class OpenFoodFactsProvider implements ResearchProvider {
  readonly name = 'openfoodfacts';
  readonly kind = 'official-api' as const;
  private readonly options: { userAgent: string; endpoint: string; fetch: typeof globalThis.fetch };
  constructor(options: OpenFoodFactsProviderOptions = {}) { this.options = { userAgent: options.userAgent ?? DEFAULT_USER_AGENT, endpoint: options.endpoint ?? DEFAULT_ENDPOINT, fetch: options.fetch ?? globalThis.fetch }; }
  async search(clues: ProductClues,queryOverride?:string): Promise<Candidate[]> {
    const query = queryOverride??[clues.brand, clues.model, clues.productType, ...clues.visibleText, ...clues.distinctiveCharacteristics].filter(Boolean).join(' ').trim();
    if (!query) return [];
    const url = new URL(this.options.endpoint);
    url.searchParams.set('search_terms', query); url.searchParams.set('search_simple', '1'); url.searchParams.set('action', 'process'); url.searchParams.set('json', '1'); url.searchParams.set('page_size', '10'); url.searchParams.set('fields', 'code,product_name,brands,categories,image_front_url,url');
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8_000); let response: Response;
    try { response = await this.options.fetch(url, { headers: { 'user-agent': this.options.userAgent, accept: 'application/json' }, signal: controller.signal }); } catch (error) { throw new Error(`Open Food Facts search request failed (${url}): ${error instanceof Error ? error.message : String(error)}`); } finally { clearTimeout(timer); }
    if (!response.ok) throw new Error(`Open Food Facts search request failed (${response.status}) (${url})`);
    let data: OpenFoodFactsSearchResponse; try { data = await response.json() as OpenFoodFactsSearchResponse; } catch (error) { throw new Error(`Open Food Facts search returned malformed JSON (${url}): ${error instanceof Error ? error.message : String(error)}`); }
    if (!Array.isArray(data.products)) throw new Error(`Open Food Facts search returned malformed response (${url})`);
    return data.products.flatMap((raw, index) => { const product = raw as OpenFoodFactsProduct; if (!product.code || !product.product_name) return []; const source = product.url ?? `https://world.openfoodfacts.org/product/${encodeURIComponent(product.code)}`; return [{ id: crypto.randomUUID(), title: product.product_name, sourceName: 'Open Food Facts', sourceUrl: source, productUrl: source, imageUrl: product.image_front_url, brand: product.brands?.split(',')[0]?.trim() || undefined, specifications: product.categories ? { categories: product.categories } : {} as Record<string,string>, matchingSignals: [`Text search: ${query}`], confidence: Math.max(35, 65 - index * 3), status: 'verified' as const, provider: this.name, providerProductId: product.code, providerMetadata: { providerKind: this.kind, catalog: 'food' }, evidence: [{ sourceName: 'Open Food Facts', sourceUrl: source, excerpt: product.product_name, capturedAt: new Date().toISOString() }], matchMethod: 'text_search' as const } satisfies Candidate]; });
  }
}
