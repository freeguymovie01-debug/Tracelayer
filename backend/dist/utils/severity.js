"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSeverityScore = calculateSeverityScore;
// INTEGRATION NOTE: FE2 calls POST /ai/classify, gets back severityScore automatically
function calculateSeverityScore(params) {
    const score = (params.structureDamage * 0.30) +
        (params.damageSeverity * 0.35) +
        (params.personsDamage * 0.20) +
        (params.infraDamage * 0.15);
    return Math.round(Math.min(100, Math.max(0, score)));
}
