import { SHOP_CONFIG } from "../config";

export function formatPrice(price: number, currency = SHOP_CONFIG.currency): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
