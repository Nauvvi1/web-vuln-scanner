import dotenv from 'dotenv';
import { crawlSite } from './core/crawler';
import { Requester } from './core/requester';
import { createScanners } from './scanners';
import { ScanOptions, ScanSummary } from './types/scan.types';
import { calculateRiskScore } from './utils/severity';

dotenv.config();

export async function runScan(options: ScanOptions): Promise<ScanSummary> {
  const startedAt = Date.now();
  const requester = new Requester(options);
  const crawl = await crawlSite(options.target, options, requester);
  const scanners = createScanners(requester);

  const findings = [] as ScanSummary['findings'];
  for (const scanner of scanners) {
    const scannerFindings = await scanner.run({ options, crawl });
    findings.push(...scannerFindings);
  }

  return {
    target: options.target,
    scannedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    pagesDiscovered: crawl.pages.length,
    jsFilesDiscovered: crawl.jsFiles.length,
    formsDiscovered: crawl.forms.length,
    parametersDiscovered: crawl.parameters.length,
    findings,
    riskScore: calculateRiskScore(findings)
  };
}
