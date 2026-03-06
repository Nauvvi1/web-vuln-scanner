import fs from 'fs-extra';
import path from 'path';
import { ScanSummary } from '../types/scan.types';

export async function writeJsonReport(summary: ScanSummary, outputDir: string): Promise<string> {
  await fs.ensureDir(outputDir);
  const filePath = path.join(outputDir, `report-${Date.now()}.json`);
  await fs.writeJson(filePath, summary, { spaces: 2 });
  return filePath;
}
