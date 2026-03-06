import fs from 'fs-extra';
import path from 'path';
import { ScanSummary } from '../types/scan.types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function writeHtmlReport(summary: ScanSummary, outputDir: string): Promise<string> {
  await fs.ensureDir(outputDir);
  const filePath = path.join(outputDir, `report-${Date.now()}.html`);
  const findingsRows = summary.findings
    .map(
      (finding) => `
      <tr>
        <td>${escapeHtml(finding.severity)}</td>
        <td>${escapeHtml(finding.category)}</td>
        <td>${escapeHtml(finding.title)}</td>
        <td>${escapeHtml(finding.url)}</td>
        <td>${escapeHtml(finding.description)}</td>
        <td>${escapeHtml(finding.evidence || '')}</td>
        <td>${escapeHtml(finding.recommendation)}</td>
      </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Web Vuln Scanner Report</title>
<style>
body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
h1, h2 { margin-bottom: 8px; }
.summary { margin-bottom: 24px; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
th { background: #f4f4f4; text-align: left; }
.badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #eee; }
</style>
</head>
<body>
  <h1>Web Vuln Scanner Report</h1>
  <div class="summary">
    <p><strong>Target:</strong> ${escapeHtml(summary.target)}</p>
    <p><strong>Scanned at:</strong> ${escapeHtml(summary.scannedAt)}</p>
    <p><strong>Duration:</strong> ${summary.durationMs} ms</p>
    <p><strong>Pages:</strong> ${summary.pagesDiscovered}</p>
    <p><strong>JS files:</strong> ${summary.jsFilesDiscovered}</p>
    <p><strong>Forms:</strong> ${summary.formsDiscovered}</p>
    <p><strong>Parameters:</strong> ${summary.parametersDiscovered}</p>
    <p><strong>Findings:</strong> ${summary.findings.length}</p>
    <p><strong>Risk score:</strong> <span class="badge">${summary.riskScore}/100</span></p>
  </div>

  <h2>Findings</h2>
  <table>
    <thead>
      <tr>
        <th>Severity</th>
        <th>Category</th>
        <th>Title</th>
        <th>URL</th>
        <th>Description</th>
        <th>Evidence</th>
        <th>Recommendation</th>
      </tr>
    </thead>
    <tbody>
      ${findingsRows || '<tr><td colspan="7">No findings.</td></tr>'}
    </tbody>
  </table>
</body>
</html>`;

  await fs.writeFile(filePath, html, 'utf8');
  return filePath;
}
