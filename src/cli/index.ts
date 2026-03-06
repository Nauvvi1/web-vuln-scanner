#!/usr/bin/env node
import { Command } from 'commander';
import ora from 'ora';
import { runScan } from '../index';
import { printConsoleReport } from '../reporters/console.reporter';
import { writeHtmlReport } from '../reporters/html.reporter';
import { writeJsonReport } from '../reporters/json.reporter';
import { ReportFormat, ScanOptions } from '../types/scan.types';
import { normalizeUrl } from '../utils/normalize-url';

const program = new Command();

program
  .name('webscan')
  .argument('<target>', 'Target URL or hostname')
  .option('-d, --depth <number>', 'Crawl depth', '2')
  .option('-c, --concurrency <number>', 'Concurrency', '5')
  .option('-t, --timeout <number>', 'Request timeout in milliseconds', process.env.REQUEST_TIMEOUT || '8000')
  .option('-r, --report <type>', 'Report format: console | json | html | both', 'console')
  .option('-o, --output <dir>', 'Output directory for report files', './reports')
  .option('--insecure', 'Ignore TLS certificate errors', false)
  .action(async (target: string, flags: Record<string, unknown>) => {
    const report = String(flags.report) as ReportFormat;
    const options: ScanOptions = {
      target: normalizeUrl(target),
      depth: Number(flags.depth ?? process.env.MAX_DEPTH ?? 2),
      timeout: Number(flags.timeout ?? process.env.REQUEST_TIMEOUT ?? 8000),
      concurrency: Number(flags.concurrency ?? 5),
      report,
      outputDir: String(flags.output || './reports'),
      insecure: Boolean(flags.insecure)
    };

    console.log(`[START] Scanning ${options.target}`);

    try {
      const summary = await runScan(options);
      console.log(`[DONE] Scan finished. Findings: ${summary.findings.length}`);

      if (report === 'console' || report === 'both') {
        printConsoleReport(summary);
      }

      if (report === 'json' || report === 'both') {
        const jsonPath = await writeJsonReport(summary, options.outputDir);
        console.log(`JSON report: ${jsonPath}`);
      }

      if (report === 'html' || report === 'both') {
        const htmlPath = await writeHtmlReport(summary, options.outputDir);
        console.log(`HTML report: ${htmlPath}`);
      }
    } catch (error) {
      console.error('[FAIL] Scan failed.');
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
