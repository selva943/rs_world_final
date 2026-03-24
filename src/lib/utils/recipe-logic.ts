import { Experience, RecipeIngredient } from "@/types/app";

/**
 * UOM (Unit of Measure) Conversion & Pricing Logic
 */

export const SUPPORTED_UOMS = ['kg', 'g', 'litre', 'ml', 'pcs', 'pack', 'can', 'unit'] as const;
export type UOM = typeof SUPPORTED_UOMS[number];

/**
 * Converts a quantity from one UOM into another target UOM.
 * 
 * Example: 250g target 'kg' -> 0.25
 */
export function convertToTargetUom(quantity: number, fromUom: string, targetUom: string | undefined): number {
  const fromNormalized = fromUom.toLowerCase();
  const toNormalized = (targetUom || 'unit').toLowerCase();

  if (fromNormalized === toNormalized) return quantity;

  // Mass conversions
  if (fromNormalized === 'g' && toNormalized === 'kg') return quantity / 1000;
  if (fromNormalized === 'kg' && toNormalized === 'g') return quantity * 1000;

  // Volume conversions
  if (fromNormalized === 'ml' && toNormalized === 'litre') return quantity / 1000;
  if (fromNormalized === 'litre' && toNormalized === 'ml') return quantity * 1000;

  return quantity;
}

/**
 * Calculates the price for an ingredient based on product price and UOM scaling.
 */
export function calculateIngredientPrice(ingredient: RecipeIngredient, product: Experience | undefined): number {
  if (ingredient.price_override !== undefined && ingredient.price_override !== null && Number(ingredient.price_override) > 0) {
    return Number(ingredient.price_override);
  }

  if (!product) return 0;

  let basePrice = Number(product.price) || 0;
  const productUnit = product.unit || 'unit';
  
  // Convert ingredient quantity into the product's base sellable unit
  const scaledQuantity = convertToTargetUom(Number(ingredient.quantity), ingredient.uom, productUnit);
  
  return scaledQuantity * basePrice;
}

/**
 * Helper to display pretty ingredient quantity labels
 */
export function formatIngredientQuantity(quantity: number, uom: string): string {
    const q = Number(quantity);
    if (q % 1 === 0) return `${q} ${uom}`;
    return `${q.toFixed(2)} ${uom}`;
}
