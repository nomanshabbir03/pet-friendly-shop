import { FilterXSS } from 'xss';

// Matches exactly the formatting the admin product form's rich text editor exposes (see
// components/admin/RichTextEditor.tsx) — Bold, Italic, Bullet List, Numbered List, and
// paragraphs/line breaks. No attributes are allowed on any tag (no href, style, class, id,
// etc.) since none of these controls need one — this also rules out a malicious payload
// sneaking in a javascript: URL or inline style/script via an otherwise-allowed tag.
const ALLOWED_TAGS = ['p', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'br'];

// Was isomorphic-dompurify (DOMPurify + jsdom for server-side use). Swapped for `xss` — a pure
// JS, regex/parser-based whitelist sanitizer with no DOM/native dependency. jsdom's dependency
// chain (jsdom -> html-encoding-sniffer -> @exodus/bytes) requires an ES module via require()
// in a way Vercel's serverless Node runtime rejects (ERR_REQUIRE_ESM), which crashed every
// route that rendered a product description — including the public storefront, since
// ProductCard (used on /products, category, search, and the homepage) calls
// stripDescriptionHtml below. `xss` has zero native/ESM dependencies, so it's safe there.
const richTextFilter = new FilterXSS({
  whiteList: Object.fromEntries(ALLOWED_TAGS.map((tag) => [tag, []])),
  // Disallowed tags are removed but their inner text is kept (matches the previous DOMPurify
  // behavior for this allowlist) — except script/style, whose content is dropped entirely.
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
});

const plainTextFilter = new FilterXSS({
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
});

// Sanitizes rich text HTML for the product description field. Used in two places, both
// required — server-side right before saving (app/api/admin/products/route.ts and [id]/
// route.ts) as the authoritative check, and again on the frontend right before rendering
// (app/products/[slug]/page.tsx) as defense in depth. A plain-text description saved before
// this field supported rich text passes through unchanged — plain text has nothing for the
// sanitizer to strip, so it renders exactly as it did before.
export function sanitizeDescriptionHtml(html: string): string {
  return richTextFilter.process(html).trim();
}

// Strips all HTML tags for the plain-text previews that need one (ProductCard's line-clamped
// description) — a rich description with bold/lists isn't appropriate in a clamped card
// preview, so this reduces it to plain text instead of showing raw tags or a broken partial
// tag when clamped.
export function stripDescriptionHtml(html: string): string {
  // Insert a space at block/line boundaries first, so stripping tags doesn't jam adjacent
  // words together — e.g. "<li>Apples</li><li>Bananas</li>" should become "Apples Bananas",
  // not "ApplesBananas". Then strip every tag and collapse the resulting whitespace.
  const withBoundaries = html.replace(/<\/(p|li|ul|ol)>|<br\s*\/?>/gi, ' $&');
  const textOnly = plainTextFilter.process(withBoundaries);

  return textOnly.replace(/\s+/g, ' ').trim();
}
