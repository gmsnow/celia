/**
 * Copy pricing rule: 30 YER for every GB of copied data.
 * Used to compute `copyRecords.price` from `copyRecords.sizeGB`.
 */
export const COPY_PRICE_PER_GB = 30;

export function computeCopyPrice(sizeGB: number): number {
  return sizeGB * COPY_PRICE_PER_GB;
}
