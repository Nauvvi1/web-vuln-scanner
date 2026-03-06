import pLimit from 'p-limit';
import { Requester } from './requester';
import { CrawlResult, ScanOptions } from '../types/scan.types';
import { extractForms, extractJsFiles, extractLinks, extractParameters } from '../parsers/html.parser';
import { sameOrigin } from '../utils/normalize-url';

export async function crawlSite(target: string, options: ScanOptions, requester: Requester): Promise<CrawlResult> {
  const visited = new Set<string>();
  const htmlByUrl = new Map<string, string>();
  const jsFiles = new Set<string>();
  const forms = [] as CrawlResult['forms'];
  const parameters = [] as CrawlResult['parameters'];
  const limit = pLimit(options.concurrency);

  let currentLevel = [target];

  for (let depth = 0; depth <= options.depth; depth += 1) {
    console.log(`\n[DEPTH] Level ${depth}`);
    const nextLevel = new Set<string>();

    await Promise.all(
      currentLevel.map((url) =>
        limit(async () => {
          if (visited.has(url)) return;
          visited.add(url);

          console.log(`[CRAWL] Requesting: ${url}`);
          const response = await requester.get(url);
          if (!response) return;

          const contentType = String(response.headers['content-type'] || '');
          if (!contentType.includes('text/html')) return;

          htmlByUrl.set(url, response.data);

          const links = extractLinks(url, response.data).filter((link) => sameOrigin(target, link));
          const foundJsFiles = extractJsFiles(url, response.data).filter((jsFile) => sameOrigin(target, jsFile));
          const foundForms = extractForms(url, response.data);
          const foundParams = extractParameters(url, response.data);
          
          for (const link of links) {
            if (!visited.has(link) && !nextLevel.has(link)) {
              console.log(`[DISCOVERED] ${link}`);
              nextLevel.add(link);
            }
          }
          
          for (const jsFile of foundJsFiles) {
            if (!jsFiles.has(jsFile)) {
              console.log(`[JS] ${jsFile}`);
              jsFiles.add(jsFile);
            }
          }
          
          if (foundForms.length) {
            console.log(`[FORMS] ${foundForms.length} found on ${url}`);
          }
          
          if (foundParams.length) {
            console.log(`[PARAMS] ${foundParams.length} found on ${url}`);
          }
          
          forms.push(...foundForms);
          parameters.push(...foundParams);
          
          console.log(
            `[CRAWL-DONE] ${url} | discovered=${links.length} js=${foundJsFiles.length} forms=${foundForms.length} params=${foundParams.length}`
          );
        })
      )
    );

    currentLevel = [...nextLevel];
    console.log(`[QUEUE] Next level URLs: ${currentLevel.length}`);
    if (currentLevel.length === 0) break;
  }

  return {
    pages: [...visited],
    htmlByUrl,
    jsFiles: [...jsFiles],
    forms,
    parameters
  };
}
