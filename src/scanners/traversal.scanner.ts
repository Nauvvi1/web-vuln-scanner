import { Finding, Scanner } from '../types/scan.types';
import { Requester } from '../core/requester';
import { FILE_PARAM_NAMES, TRAVERSAL_PATTERNS, TRAVERSAL_PAYLOADS } from '../utils/payloads';

export function createTraversalScanner(requester: Requester): Scanner {
  return {
    name: 'traversal',
    async run(context) {
      const findings: Finding[] = [];

      for (const discovered of context.crawl.parameters) {
        if (!FILE_PARAM_NAMES.includes(discovered.param)) continue;

        let url: URL;
        try {
          url = new URL(discovered.pageUrl);
        } catch {
          continue;
        }

        for (const payload of TRAVERSAL_PAYLOADS) {
          url.searchParams.set(discovered.param, payload);
          const response = await requester.get(url.toString());
          if (!response) continue;

          const body = response.data.toLowerCase();
          const matchedPattern = TRAVERSAL_PATTERNS.find((pattern) => body.includes(pattern.toLowerCase()));
          if (matchedPattern) {
            findings.push({
              id: `traversal-${discovered.param}-${discovered.pageUrl}`,
              title: 'Possible path traversal / local file inclusion',
              severity: 'high',
              category: 'traversal',
              url: url.toString(),
              description: `The parameter ${discovered.param} may allow traversal outside the intended directory.`,
              evidence: matchedPattern,
              recommendation: 'Normalize and strictly validate file paths against an allowlist.'
            });
            break;
          }
        }
      }

      return findings;
    }
  };
}
