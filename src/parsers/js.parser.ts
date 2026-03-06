export function extractPotentialEndpoints(jsContent: string): string[] {
  const results = new Set<string>();
  const regex = /(["'`])((?:\/|https?:\/\/)[^"'`\s]{2,})\1/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(jsContent)) !== null) {
    results.add(match[2]);
  }

  return [...results];
}
