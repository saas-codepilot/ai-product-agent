# ADR 006: Shopify Admin GraphQL and explicit publishing

We use Shopify's current Admin GraphQL API behind `ShopifyProvider`. OAuth, token storage, field mapping, and error translation stay outside the product/listing domain. Publishing is never triggered by generation or confirmation; it requires an explicit API request after preview. This keeps accidental publication and provider coupling out of the core workflow.
