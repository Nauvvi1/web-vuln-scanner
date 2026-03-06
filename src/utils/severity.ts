import { Finding, Severity } from '../types/scan.types';

const severityWeights: Record<Severity, number> = {
  info: 3,
  low: 8,
  medium: 15,
  high: 25
};

export function calculateRiskScore(findings: Finding[]): number {
  const raw = findings.reduce((sum, finding) => sum + severityWeights[finding.severity], 0);
  return Math.min(100, raw);
}
