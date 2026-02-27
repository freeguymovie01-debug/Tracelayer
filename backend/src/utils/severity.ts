// INTEGRATION NOTE: FE2 calls POST /ai/classify, gets back severityScore automatically
export function calculateSeverityScore(params: {
    structureDamage: number  // 0-100
    damageSeverity: number   // 0-100
    personsDamage: number    // 0-100
    infraDamage: number      // 0-100
}): number {
    const score =
        (params.structureDamage * 0.30) +
        (params.damageSeverity * 0.35) +
        (params.personsDamage * 0.20) +
        (params.infraDamage * 0.15);
    return Math.round(Math.min(100, Math.max(0, score)));
}
