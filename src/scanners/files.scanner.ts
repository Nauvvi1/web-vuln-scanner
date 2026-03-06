import { Finding, Scanner } from '../types/scan.types';
import { Requester } from '../core/requester';
import { DIRECTORY_LISTING_PATHS, SENSITIVE_PATHS } from '../utils/payloads';

export function createFilesScanner(requester: Requester): Scanner {
  return {
    name: 'files',
    async run(context) {
      const findings: Finding[] = [];
      const target = new URL(context.options.target);

      for (const path of SENSITIVE_PATHS) {
        const url = new URL(path, target.origin).toString();
        const response = await requester.get(url);
        if (!response) continue;

        const body = response.data.toLowerCase();
        if (
          response.status < 400 &&
          (body.includes('db_password') ||
            body.includes('[core]') ||
            body.includes('user-agent:') ||
            body.includes('openapi') ||
            body.includes('swagger') ||
            response.status === 200)
        ) {
          findings.push({
            id: `sensitive-${path}`,
            title: 'Sensitive file or endpoint exposed',
            severity: path.includes('.env') || path.includes('.git') ? 'high' : 'medium',
            category: 'files',
            url,
            description: `A potentially sensitive path responded successfully: ${path}`,
            evidence: `HTTP ${response.status}`,
            recommendation: 'Restrict access or remove public exposure of sensitive files and admin/debug endpoints.'
          });
        }
      }

      for (const path of DIRECTORY_LISTING_PATHS) {
        const url = new URL(path, target.origin).toString();
        const response = await requester.get(url);
        if (!response) continue;

        if (response.status < 400 && /index of\s*\//i.test(response.data)) {
          findings.push({
            id: `dirlist-${path}`,
            title: 'Directory listing enabled',
            severity: 'medium',
            category: 'files',
            url,
            description: `Directory listing appears to be enabled for ${path}.`,
            recommendation: 'Disable directory browsing on the web server.'
          });
        }
      }

      return findings;
    }
  };
}
