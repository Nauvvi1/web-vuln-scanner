import { Finding, Scanner } from '../types/scan.types';
import { Requester } from '../core/requester';
import { XSS_PAYLOAD } from '../utils/payloads';

export function createXssScanner(requester: Requester): Scanner {
  return {
    name: 'xss',
    async run(context) {
      const findings: Finding[] = [];

      for (const discovered of context.crawl.parameters) {
        let url: URL;
        try {
          url = new URL(discovered.pageUrl);
        } catch {
          continue;
        }

        url.searchParams.set(discovered.param, XSS_PAYLOAD);
        const response = await requester.get(url.toString());
        if (!response) continue;

        if (response.data.includes(XSS_PAYLOAD)) {
          findings.push({
            id: `xss-${discovered.param}-${discovered.pageUrl}`,
            title: 'Possible reflected XSS',
            severity: 'medium',
            category: 'xss',
            url: url.toString(),
            description: `The payload supplied in ${discovered.param} was reflected in the response.`,
            evidence: XSS_PAYLOAD,
            recommendation: 'Validate input and encode output in the appropriate context.'
          });
        }
      }

      return findings;
    }
  };
}
