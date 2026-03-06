import { Finding, Scanner } from '../types/scan.types';
import { Requester } from '../core/requester';

export function createCorsScanner(requester: Requester): Scanner {
  return {
    name: 'cors',
    async run(context) {
      const findings: Finding[] = [];
      const probeOrigin = 'https://evil.example';

      for (const url of context.crawl.pages) {
        const response = await requester.get(url, { Origin: probeOrigin });
        if (!response) continue;

        const allowOrigin = String(response.headers['access-control-allow-origin'] || '');
        const allowCredentials = String(response.headers['access-control-allow-credentials'] || '');

        if (allowOrigin === '*') {
          findings.push({
            id: `cors-wildcard-${url}`,
            title: 'Wildcard CORS policy',
            severity: 'medium',
            category: 'cors',
            url,
            description: 'The server allows any origin via Access-Control-Allow-Origin: *.',
            recommendation: 'Restrict allowed origins to trusted domains only.'
          });
        }

        if (allowOrigin === probeOrigin && allowCredentials.toLowerCase() === 'true') {
          findings.push({
            id: `cors-reflect-${url}`,
            title: 'Potentially unsafe reflected CORS policy',
            severity: 'high',
            category: 'cors',
            url,
            description: 'The server reflects an arbitrary Origin header and also allows credentials.',
            recommendation: 'Disable origin reflection and explicitly whitelist trusted origins.'
          });
        }
      }

      return findings;
    }
  };
}
