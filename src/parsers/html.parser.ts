import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { DiscoveredForm, DiscoveredParameter } from '../types/scan.types';
import { toAbsoluteUrl } from '../utils/normalize-url';

export function extractLinks(baseUrl: string, html: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  $('a[href]').each((_, element: Element) => {
    const href = $(element).attr('href');
    if (!href) return;

    const absolute = toAbsoluteUrl(baseUrl, href);
    if (absolute) {
      links.add(absolute);
    }
  });

  return [...links];
}

export function extractJsFiles(baseUrl: string, html: string): string[] {
  const $ = cheerio.load(html);
  const scripts = new Set<string>();

  $('script[src]').each((_, element: Element) => {
    const src = $(element).attr('src');
    if (!src) return;

    const absolute = toAbsoluteUrl(baseUrl, src);
    if (absolute) {
      scripts.add(absolute);
    }
  });

  return [...scripts];
}

export function extractForms(baseUrl: string, html: string): DiscoveredForm[] {
  const $ = cheerio.load(html);
  const forms: DiscoveredForm[] = [];

  $('form').each((_, form: Element) => {
    const action = $(form).attr('action') || baseUrl;
    const method = ($(form).attr('method') || 'GET').toUpperCase();
    const inputs: string[] = [];

    $(form)
      .find('input[name], textarea[name], select[name]')
      .each((__, input: Element) => {
        const name = $(input).attr('name');
        if (name) {
          inputs.push(name);
        }
      });

    forms.push({
      pageUrl: baseUrl,
      action: toAbsoluteUrl(baseUrl, action) || baseUrl,
      method,
      inputs
    });
  });

  return forms;
}

export function extractParameters(pageUrl: string, html: string): DiscoveredParameter[] {
  const params: DiscoveredParameter[] = [];

  try {
    const parsed = new URL(pageUrl);

    parsed.searchParams.forEach((_, key) => {
      params.push({
        pageUrl,
        param: key,
        source: 'query'
      });
    });
  } catch {
    // ignore invalid URL
  }

  for (const form of extractForms(pageUrl, html)) {
    for (const input of form.inputs) {
      params.push({
        pageUrl: form.action,
        param: input,
        source: 'form'
      });
    }
  }

  return params;
}