declare module 'commander';
declare module 'ora';
declare module 'p-limit';
declare module 'chalk';
declare module 'axios';
declare module 'dotenv';
declare module 'cheerio';
declare module 'fs-extra';
declare module 'https';
declare module 'path';

declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode?: number;
};
