import { Finding, Scanner } from '../types/scan.types';
import { Requester } from '../core/requester';
import { SQL_ERROR_PATTERNS, SQLI_PAYLOADS } from '../utils/payloads';

export function createSqliScanner(requester: Requester): Scanner {
  return {
    name: 'sqli',
    async run(context) {
      const findings: Finding[] = [];

      for (const discovered of context.crawl.parameters) {
        let url: URL;
        try {
          url = new URL(discovered.pageUrl);
        } catch {
          continue;
        }

        for (const payload of SQLI_PAYLOADS) {
          url.searchParams.set(discovered.param, payload);
          const response = await requester.get(url.toString());
          if (!response) continue;

          const body = response.data.toLowerCase();
          const matchedPattern = SQL_ERROR_PATTERNS.find((pattern) => body.includes(pattern));
          if (matchedPattern) {
            findings.push({
              id: `sqli-${discovered.param}-${discovered.pageUrl}`,
              title: 'Possible SQL injection (error-based)',
              severity: 'high',
              category: 'sqli',
              url: url.toString(),
              description: `A database error pattern was detected after injecting into ${discovered.param}.`,
              evidence: matchedPattern,
              recommendation: 'Use parameterized queries and strict server-side validation.'
            });
            break;
          }
        }
      }

      return findings;
    }
  };
}
