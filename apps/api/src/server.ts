import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { config } from '@ai-product-agent/config';
import { DevelopmentResearchProvider, createResearchQuery } from '@ai-product-agent/product-research';
import { normalizeClues, validateImages } from '@ai-product-agent/validation';
import type { Candidate, ListingFieldName, Product } from '@ai-product-agent/types';

const products = new Map<string, Product>();
const research = new DevelopmentResearchProvider();
const json = (res: ServerResponse, status: number, body: unknown) => { res.writeHead(status, {'content-type':'application/json','access-control-allow-origin':config.webOrigin,'access-control-allow-headers':'content-type','access-control-allow-methods':'GET,POST,PATCH,OPTIONS'}); res.end(JSON.stringify(body)); };
async function body(req: IncomingMessage): Promise<any> { let raw=''; for await (const chunk of req) raw += chunk; return raw ? JSON.parse(raw) : {}; }
function listing(product: Product, candidate: Candidate) {
  const subject = candidate.title;
  return { id: crypto.randomUUID(), productId: product.id, generatedAt: new Date().toISOString(), fields: { title: subject, description: `Discover ${subject}, presented with clear product information and an easy-to-review format.`, bulletFeatures: ['Original copy based on confirmed product evidence.', 'Specifications are shown only when supported by the selected source.', 'Prepared for seller review before publishing.'], productType: candidate.specifications.category ?? 'Product', vendor: candidate.brand ?? 'To review', tags: [candidate.brand, candidate.specifications.category].filter(Boolean).join(', '), handle: subject.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''), seoTitle: subject, metaDescription: `Explore ${subject} with evidence-aware product details.`, altText: `${subject} product image`, imageFilename: subject.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.jpg', socialCaption: `Meet ${subject}. Review the details and make it yours.`, adCopy: `A considered way to discover ${subject}.` } };
}
async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') return json(res,204,{});
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res,200,{ok:true, environment:config.nodeEnv, provider:research.name});
    if (req.method === 'POST' && url.pathname === '/api/products') { const input=await body(req); const product: Product={id:crypto.randomUUID(),images:validateImages(input.images),clues:normalizeClues(input.clues),status:'uploaded',candidates:[],createdAt:new Date().toISOString()}; products.set(product.id,product); return json(res,201,product); }
    const match=url.pathname.match(/^\/api\/products\/([^/]+)$/); if (req.method==='GET' && match) { const product=products.get(match[1]); return product ? json(res,200,product) : json(res,404,{error:'Product not found'}); }
    const researchMatch=url.pathname.match(/^\/api\/products\/([^/]+)\/research$/); if (req.method==='POST' && researchMatch) { const product=products.get(researchMatch[1]); if(!product) return json(res,404,{error:'Product not found'}); product.status='researching'; const query=createResearchQuery(product.clues); product.candidates=await research.search(product.clues); product.status='needs-review'; return json(res,200,{product,query,status:'completed',message:product.candidates.length?'Review the evidence-backed candidates.':'No permitted provider is configured yet; add a research adapter before presenting real matches.'}); }
    const confirm=url.pathname.match(/^\/api\/products\/([^/]+)\/confirm$/); if(req.method==='POST'&&confirm){const product=products.get(confirm[1]);const input=await body(req);if(!product)return json(res,404,{error:'Product not found'});const candidate=product.candidates.find(c=>c.id===input.candidateId);if(!candidate)return json(res,400,{error:'Candidate not found'});product.confirmedCandidateId=candidate.id;product.status='confirmed';product.listing=listing(product,candidate);product.status='listing-ready';return json(res,200,product);}
    const regenerate=url.pathname.match(/^\/api\/products\/([^/]+)\/listing\/([^/]+)\/regenerate$/); if(req.method==='POST'&&regenerate){const product=products.get(regenerate[1]);if(!product?.listing)return json(res,404,{error:'Listing not found'});const field=regenerate[2] as ListingFieldName;const direction=(await body(req)).direction ?? 'clear and useful';if(!(field in product.listing.fields))return json(res,400,{error:'Unknown listing field'});product.listing.fields[field]=`Regenerated with a ${direction} direction. ${String(product.listing.fields[field])}`;return json(res,200,product.listing);}
    const edit=url.pathname.match(/^\/api\/products\/([^/]+)\/listing\/([^/]+)$/); if(req.method==='PATCH'&&edit){const product=products.get(edit[1]);if(!product?.listing)return json(res,404,{error:'Listing not found'});const field=edit[2] as ListingFieldName;if(!(field in product.listing.fields))return json(res,400,{error:'Unknown listing field'});const input=await body(req);product.listing.fields[field]=input.value;return json(res,200,product.listing);}
    if(req.method==='POST'&&url.pathname==='/api/shopify/connect')return json(res,501,{error:'Shopify is not configured for this environment.',next:'Add Shopify OAuth credentials and a callback URL before connecting a store.'});
    return json(res,404,{error:'Route not found'});
  } catch(error) { return json(res,400,{error:error instanceof Error ? error.message : 'Request failed'}); }
}
createServer(handler).listen(config.port,()=>console.log(`API listening on http://localhost:${config.port}`));
