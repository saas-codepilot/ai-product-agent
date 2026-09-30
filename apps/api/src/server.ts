import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { config } from '@ai-product-agent/config';
import { MemoryProductRepository, PrismaProductRepository, type AuthScope, type ProductRepository } from '@ai-product-agent/database';
import { DevelopmentResearchProvider, WikimediaCommonsProvider, createResearchQuery } from '@ai-product-agent/product-research';
import { normalizeClues, validateImages } from '@ai-product-agent/validation';
import type { ListingFieldName } from '@ai-product-agent/types';

const repository:ProductRepository=config.databaseUrl?new PrismaProductRepository():new MemoryProductRepository();
const provider=config.researchProvider==='wikimedia'?new WikimediaCommonsProvider():new DevelopmentResearchProvider();
const json=(res:ServerResponse,status:number,body:unknown)=>{res.writeHead(status,{'content-type':'application/json','access-control-allow-origin':config.webOrigin,'access-control-allow-headers':'content-type,x-user-id,x-workspace-id','access-control-allow-methods':'GET,POST,PATCH,OPTIONS'});res.end(JSON.stringify(body));};
async function body(req:IncomingMessage){let raw='';for await(const chunk of req)raw+=chunk;return raw?JSON.parse(raw):{};}
function auth(req:IncomingMessage):AuthScope|undefined{const userId=req.headers['x-user-id']?.toString();const workspaceId=req.headers['x-workspace-id']?.toString();if(userId&&workspaceId)return{userId,workspaceId};if(config.devAuthBypass)return{userId:'dev-user',workspaceId:'dev-workspace'};return undefined;}
async function handler(req:IncomingMessage,res:ServerResponse){if(req.method==='OPTIONS')return json(res,204,{});const url=new URL(req.url??'/',`http://${req.headers.host??'localhost'}`);try{
 if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true,environment:config.nodeEnv,storage:repository.storage,researchProvider:provider.name,auth:'workspace-scoped'});
 const scope=auth(req);if(!scope)return json(res,401,{error:'Authentication required.',code:'AUTH_REQUIRED'});
 if(req.method==='POST'&&url.pathname==='/api/products'){const input=await body(req);const product=await repository.create(scope,validateImages(input.images),normalizeClues(input.clues));return json(res,201,product);}
 const productMatch=url.pathname.match(/^\/api\/products\/([^/]+)$/);if(req.method==='GET'&&productMatch){const product=await repository.get(scope,productMatch[1]);return product?json(res,200,product):json(res,404,{error:'Product not found'});}
 const researchMatch=url.pathname.match(/^\/api\/products\/([^/]+)\/research$/);if(req.method==='POST'&&researchMatch){const id=researchMatch[1];const product=await repository.get(scope,id);if(!product)return json(res,404,{error:'Product not found'});const query=createResearchQuery(product.clues);try{const candidates=await provider.search(product.clues);const saved=await repository.research(scope,id,provider.name,query,candidates);return json(res,200,{product:saved,query,status:'completed',message:candidates.length?'Review the evidence-backed candidates.':'No permitted matches found for the supplied clues.'});}catch(error){return json(res,502,{error:'Research provider unavailable.',code:'RESEARCH_PROVIDER_ERROR'});}}
 const confirm=url.pathname.match(/^\/api\/products\/([^/]+)\/confirm$/);if(req.method==='POST'&&confirm){const input=await body(req);return json(res,200,await repository.confirm(scope,confirm[1],input.candidateId));}
 const regenerate=url.pathname.match(/^\/api\/products\/([^/]+)\/listing\/([^/]+)\/regenerate$/);if(req.method==='POST'&&regenerate){const input=await body(req);return json(res,200,await repository.regenerateField(scope,regenerate[1],regenerate[2] as ListingFieldName,input.direction??'clear and useful'));}
 const edit=url.pathname.match(/^\/api\/products\/([^/]+)\/listing\/([^/]+)$/);if(req.method==='PATCH'&&edit){const input=await body(req);if(typeof input.value!=='string')return json(res,400,{error:'Field value must be text.'});return json(res,200,await repository.editField(scope,edit[1],edit[2] as ListingFieldName,input.value));}
 if(req.method==='POST'&&url.pathname==='/api/shopify/connect')return json(res,501,{error:'Shopify is not configured for this environment.',code:'SHOPIFY_NOT_CONFIGURED'});
 return json(res,404,{error:'Route not found'});
}catch(error){return json(res,400,{error:error instanceof Error?error.message:'Request failed'});}}
createServer(handler).listen(config.port,()=>console.log(`API listening on http://localhost:${config.port} (${repository.storage}, ${provider.name})`));
