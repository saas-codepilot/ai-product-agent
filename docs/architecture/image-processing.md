# Image processing

Uploads are signature-checked and bounded before processing. The Sharp pipeline reads metadata, rejects unsafe dimensions, preserves the original, and creates optimized WebP and thumbnail variants with bounded resizing and compression. Variant records store MIME type, dimensions, size, checksum, and opaque storage keys. AI image generation is intentionally excluded.
