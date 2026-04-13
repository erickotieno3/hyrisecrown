/**
 * Medisave Affiliate Tracker — Web (replaces React Native Linking)
 * Builds tracked URLs and opens them in a new tab.
 */
import { MEDISAVE_CONFIG, MedisaveProduct, FEATURED_PRODUCTS } from "@/config/medisaveConfig";
import { trackAffiliateClick, recordMedisaveClick } from "@/lib/affiliate";

export function buildAffiliateUrl(
  slug: string,
  source = "app",
  procedureId?: string
): string {
  const params = new URLSearchParams({
    [MEDISAVE_CONFIG.isApproved ? "ref" : "utm_ref"]: MEDISAVE_CONFIG.affiliateId,
    utm_source: "hyrisecrown",
    utm_medium: "affiliate",
    utm_campaign: source,
    ...(procedureId ? { utm_content: procedureId } : {}),
  });
  return `${MEDISAVE_CONFIG.baseUrl}/products/${slug}?${params.toString()}`;
}

export function buildCategoryUrl(categorySlug: string, source = "store"): string {
  const params = new URLSearchParams({
    [MEDISAVE_CONFIG.isApproved ? "ref" : "utm_ref"]: MEDISAVE_CONFIG.affiliateId,
    utm_source: "hyrisecrown",
    utm_medium: "affiliate",
    utm_campaign: source,
  });
  return `${MEDISAVE_CONFIG.baseUrl}/${categorySlug}?${params.toString()}`;
}

export function openAffiliateLink(url: string): void {
  recordMedisaveClick();
  window.open(url, "_blank", "noopener,noreferrer");
}

export function openProductLink(
  product: MedisaveProduct,
  source = "store",
  procedureId?: string
): void {
  const url = buildAffiliateUrl(product.slug, source, procedureId);
  trackAffiliateClick("Medisave UK", undefined, product.name, url);
  openAffiliateLink(url);
}

export function openCategoryLink(category: { slug: string }, source = "store"): void {
  const url = buildCategoryUrl(category.slug, source);
  trackAffiliateClick("Medisave UK", undefined, category.slug, url);
  openAffiliateLink(url);
}

export function getProductsForProcedure(procedureCategory: string): MedisaveProduct[] {
  return FEATURED_PRODUCTS.filter(
    (p) =>
      p.procedures.includes(procedureCategory) ||
      p.procedures.includes("general")
  );
}
