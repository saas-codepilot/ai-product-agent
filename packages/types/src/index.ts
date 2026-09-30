export type VerificationStatus = 'verified' | 'inferred' | 'user-confirmed';
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type ListingFieldName = 'title' | 'description' | 'bulletFeatures' | 'productType' | 'vendor' | 'tags' | 'handle' | 'seoTitle' | 'metaDescription' | 'altText' | 'imageFilename' | 'socialCaption' | 'adCopy';

export interface Evidence { sourceName: string; sourceUrl: string; excerpt?: string; capturedAt: string; }
export interface ProductClues { productType?: string; visibleText: string[]; brand?: string; model?: string; colors: string[]; materials: string[]; distinctiveCharacteristics: string[]; }
export interface ProductImage { id: string; name: string; mimeType: string; size: number; }
export interface Candidate { id: string; title: string; sourceName: string; sourceUrl: string; productUrl: string; imageUrl?: string; price?: number; currency?: string; brand?: string; specifications: Record<string,string>; matchingSignals: string[]; confidence: number; evidence: Evidence[]; status: VerificationStatus; }
export interface Listing { id: string; productId: string; fields: Record<ListingFieldName,string | string[]>; generatedAt: string; }
export interface Product { id: string; images: ProductImage[]; clues: ProductClues; status: 'uploaded'|'researching'|'needs-review'|'confirmed'|'listing-ready'; confirmedCandidateId?: string; candidates: Candidate[]; listing?: Listing; createdAt: string; }
