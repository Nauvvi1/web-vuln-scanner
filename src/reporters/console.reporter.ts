import chalk from 'chalk';
import { ScanSummary } from '../types/scan.types';

export function printConsoleReport(summary: ScanSummary): void {
  console.log(chalk.bold(`\nTarget: ${summary.target}`));
  console.log(`Scanned at: ${summary.scannedAt}`);
  console.log(`Pages discovered: ${summary.pagesDiscovered}`);
  console.log(`JS files discovered: ${summary.jsFilesDiscovered}`);
  console.log(`Forms discovered: ${summary.formsDiscovered}`);
  console.log(`Parameters discovered: ${summary.parametersDiscovered}`);
  console.log(`Findings: ${summary.findings.length}`);
  console.log(`Risk score: ${summary.riskScore}/100\n`);

  if (summary.findings.length === 0) {
    console.log(chalk.green('No findings detected by the current scanner set.'));
    return;
  }

  for (const finding of summary.findings) {
    const color =
      finding.severity === 'high'
        ? chalk.red
        : finding.severity === 'medium'
          ? chalk.yellow
          : finding.severity === 'low'
            ? chalk.blue
            : chalk.gray;

    console.log(color(`[${finding.severity}] ${finding.title}`));
    console.log(`  URL: ${finding.url}`);
    console.log(`  Category: ${finding.category}`);
    console.log(`  Description: ${finding.description}`);
    if (finding.evidence) console.log(`  Evidence: ${finding.evidence}`);
    console.log(`  Recommendation: ${finding.recommendation}\n`);
  }
}
