import { Finding, Scanner } from '../types/scan.types';
import { Requester } from '../core/requester';
import { extractPotentialEndpoints } from '../parsers/js.parser';

export function createJsEndpointsScanner(requester: Requester): Scanner {
  return {
    name: 'js-endpoints',
    async run(context) {
      const findings: Finding[] = [];

      for (const jsFile of context.crawl.jsFiles) {
        const response = await requester.get(jsFile);
        if (!response) continue;

        const endpoints = extractPotentialEndpoints(response.data).slice(0, 20);
        for (const endpoint of endpoints) {
          if (/\/admin|\/debug|\/internal|\/graphql|\/api/i.test(endpoint)) {
            findings.push({
              id: `js-endpoint-${jsFile}-${endpoint}`,
              title: 'Interesting endpoint discovered in JavaScript',
              severity: 'info',
              category: 'javascript',
              url: jsFile,
              description: 'A potentially interesting endpoint or route was discovered in JavaScript source.',
              evidence: endpoint,
              recommendation: 'Review whether the endpoint should be exposed publicly and apply proper access control.'
            });
          }
        }
      }

      return findings;
    }
  };
}
