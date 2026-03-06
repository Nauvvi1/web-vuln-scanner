import { Finding, Scanner } from '../types/scan.types';
import { Requester } from '../core/requester';
import { REDIRECT_PARAM_NAMES } from '../utils/payloads';

export function createOpenRedirectScanner(requester: Requester): Scanner {
  return {
    name: 'open-redirect',
    async run(context) {
      const findings: Finding[] = [];
      const candidateUrls = new Set<string>();

      for (const pageUrl of context.crawl.pages) {
        try {
          const url = new URL(pageUrl);
          const present = [...url.searchParams.keys()].some((key) => REDIRECT_PARAM_NAMES.includes(key));
          if (present) candidateUrls.add(pageUrl);
        } catch {
          // ignore
        }
      }

      for (const form of context.crawl.forms) {
        if (form.inputs.some((input) => REDIRECT_PARAM_NAMES.includes(input))) {
          candidateUrls.add(form.action);
        }
      }

      for (const rawUrl of candidateUrls) {
        let testUrl: URL;
        try {
          testUrl = new URL(rawUrl);
        } catch {
          continue;
        }

        for (const paramName of REDIRECT_PARAM_NAMES) {
          if ([...testUrl.searchParams.keys()].includes(paramName) || rawUrl === testUrl.origin + testUrl.pathname) {
            testUrl.searchParams.set(paramName, 'https://evil.example');
            const response = await requester.get(testUrl.toString());
            if (!response) continue;

            if (response.finalUrl.includes('evil.example') || String(response.headers.location || '').includes('evil.example')) {
              findings.push({
                id: `redirect-${paramName}-${rawUrl}`,
                title: 'Possible open redirect',
                severity: 'medium',
                category: 'redirect',
                url: testUrl.toString(),
                description: `The parameter ${paramName} may allow arbitrary redirects.`,
                evidence: String(response.headers.location || response.finalUrl),
                recommendation: 'Allow only trusted relative paths or validated destinations.'
              });
              break;
            }
          }
        }
      }

      return findings;
    }
  };
}
