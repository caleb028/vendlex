/**
 * VendLex Delivery Calculation and Zone Utilities
 */

export function calculateCountyDeliveryFee(county: string): number {
  const c = (county || "Nairobi").toLowerCase().trim();
  if (c === "nairobi") return 250;
  if (["kiambu", "machakos", "kajiado"].includes(c)) return 350;
  if (["mombasa", "nakuru", "kisumu", "eldoret", "uasin gishu"].includes(c)) return 500;
  return 750; // Other 42 counties
}

export function getEstimatedDeliveryTime(county: string): string {
  const c = (county || "Nairobi").toLowerCase().trim();
  if (c === "nairobi") return "Same-Day / Within 3 Hours";
  if (["kiambu", "machakos", "kajiado"].includes(c)) return "Next-Day Delivery";
  return "24 to 48 Hours via Fargo/G4S Courier";
}
