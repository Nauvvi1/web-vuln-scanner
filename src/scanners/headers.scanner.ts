import { Finding, Scanner } from '../types/scan.types';
import { Requester } from '../core/requester';

const REQUIRED_HEADERS = [
  'content-security-policy',
  'x-frame-options',
  'strict-transport-security',
  'x-content-type-options',
  'referrer-policy'
];

export function createHeadersScanner(requester: Requester): Scanner {
  return {
    name: 'headers',
    async run(context) {
      const findings: Finding[] = [];

      for (const url of context.crawl.pages) {
        const response = await requester.get(url);
        if (!response) continue;

        for (const header of REQUIRED_HEADERS) {
          if (!response.headers[header]) {
            findings.push({
              id: `headers-${header}-${url}`,
              title: 'Missing security header',
              severity: header === 'content-security-policy' || header === 'strict-transport-security' ? 'medium' : 'low',
              category: 'headers',
              url,
              description: `The response is missing the ${header} header.`,
              recommendation: `Add and configure the ${header} header appropriately.`
            });
          }
        }

        const setCookie = response.headers['set-cookie'];
        const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [String(setCookie)] : [];
        for (const cookie of cookies) {
          if (!/HttpOnly/i.test(cookie) || !/Secure/i.test(cookie)) {
            findings.push({
              id: `cookie-flags-${url}`,
              title: 'Cookie missing secure flags',
              severity: 'medium',
              category: 'headers',
              url,
              description: 'A cookie was set without Secure and/or HttpOnly flags.',
              evidence: cookie,
              recommendation: 'Set Secure and HttpOnly on sensitive cookies.'
            });
          }
        }
      }

      return findings;
    }
  };
}
