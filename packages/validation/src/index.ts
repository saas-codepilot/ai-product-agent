import type { ProductImage, ProductClues } from '@ai-product-agent/types';

const allowed = new Set(['image/jpeg','image/png','image/webp']);
export function validateImages(images: unknown): ProductImage[] {
  if (!Array.isArray(images) || images.length < 1 || images.length > 5) throw new Error('Upload between 1 and 5 product images.');
  return images.map((value) => {
    if (!value || typeof value !== 'object') throw new Error('Invalid image metadata.');
    const image = value as Partial<ProductImage>;
    if (!image.name || !image.mimeType || !allowed.has(image.mimeType) || typeof image.size !== 'number' || image.size > 10_000_000) throw new Error('Images must be JPEG, PNG, or WebP files under 10 MB.');
    return { id: crypto.randomUUID(), name: image.name, mimeType: image.mimeType, size: image.size };
  });
}
export function normalizeClues(input: Partial<ProductClues> = {}): ProductClues {
  return { productType: input.productType?.trim(), brand: input.brand?.trim(), model: input.model?.trim(), sourceUrl: input.sourceUrl?.trim(), visibleText: input.visibleText ?? [], colors: input.colors ?? [], materials: input.materials ?? [], distinctiveCharacteristics: input.distinctiveCharacteristics ?? [] };
}
export { extractProductMetadata, isPrivateHostname, validatePublicHttpUrl, type ImportedProductMetadata } from './url.ts';
