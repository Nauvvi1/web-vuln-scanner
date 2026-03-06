export type Severity = 'info' | 'low' | 'medium' | 'high';

export type ReportFormat = 'console' | 'json' | 'html' | 'both';

export interface ScanOptions {
  target: string;
  depth: number;
  timeout: number;
  concurrency: number;
  report: ReportFormat;
  outputDir: string;
  insecure: boolean;
}

export interface HttpResponseData {
  url: string;
  status: number;
  headers: Record<string, string | string[] | undefined>;
  data: string;
  finalUrl: string;
}

export interface CrawlResult {
  pages: string[];
  htmlByUrl: Map<string, string>;
  jsFiles: string[];
  forms: DiscoveredForm[];
  parameters: DiscoveredParameter[];
}

export interface DiscoveredForm {
  pageUrl: string;
  action: string;
  method: string;
  inputs: string[];
}

export interface DiscoveredParameter {
  pageUrl: string;
  param: string;
  source: 'query' | 'form';
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  url: string;
  description: string;
  evidence?: string;
  recommendation: string;
}

export interface ScanContext {
  options: ScanOptions;
  crawl: CrawlResult;
}

export interface Scanner {
  name: string;
  run(context: ScanContext): Promise<Finding[]>;
}

export interface ScanSummary {
  target: string;
  scannedAt: string;
  durationMs: number;
  pagesDiscovered: number;
  jsFilesDiscovered: number;
  formsDiscovered: number;
  parametersDiscovered: number;
  findings: Finding[];
  riskScore: number;
}
