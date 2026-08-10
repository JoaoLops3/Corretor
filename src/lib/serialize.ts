/** Prisma.Decimal → number plain (Server → Client). */
export function toNumber(
  value: number | string | { toString(): string } | null | undefined,
): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

export function toNumberOrNull(
  value: number | string | { toString(): string } | null | undefined,
): number | null {
  if (value == null) return null;
  return toNumber(value);
}
