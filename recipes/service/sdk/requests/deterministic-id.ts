/**
 * Deterministic ID for fake handlers so that the same sequence of creates
 * (e.g. after clear + seed or HMR) produces the same IDs and demo mode stays stable.
 */
export function nextDeterministicId(prefix: string, currentLength: number): string {
  return `${prefix}-${currentLength}`;
}
