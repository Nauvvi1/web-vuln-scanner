import { Finding, Scanner } from '../types/scan.types';
import { Requester } from '../core/requester';

const DANGEROUS_METHODS = ['PUT', 'DELETE', 'TRACE', 'CONNECT'];

export function createMethodsScanner(requester: Requester): Scanner {
  return {
    name: 'methods',
    async run(context) {
      const findings: Finding[] = [];

      for (const url of context.crawl.pages.slice(0, 10)) {
        const response = await requester.options(url);
        if (!response) continue;

        const allow = String(response.headers.allow || response.headers['access-control-allow-methods'] || '');
        for (const method of DANGEROUS_METHODS) {
          if (allow.toUpperCase().includes(method)) {
            findings.push({
              id: `method-${method}-${url}`,
              title: 'Potentially dangerous HTTP method enabled',
              severity: method === 'TRACE' ? 'medium' : 'low',
              category: 'methods',
              url,
              description: `The server appears to allow the ${method} method.`,
              evidence: allow,
              recommendation: `Disable ${method} unless it is strictly required.`
            });
          }
        }
      }

      return findings;
    }
  };
}
