# Web Vuln Scanner

HTTP-based CLI scanner for basic web security auditing.

No browser automation. No Docker. No AI integration. No test boilerplate. Just a clean TypeScript/npm project that crawls a target and runs practical request-based checks.

## What it checks

- Security headers
- CORS misconfiguration
- Allowed HTTP methods
- Sensitive files and directories
- Open redirect candidates
- Reflected XSS candidates
- SQL error-based candidates
- Path traversal / LFI candidates
- JavaScript endpoint discovery
- HTML form and parameter discovery

## Tech stack

- Node.js
- TypeScript
- npm
- axios
- cheerio
- commander
- chalk
- ora
- p-limit
- fs-extra
- dotenv

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Run in dev

```bash
npm run dev -- https://example.com
```

## Run compiled CLI

```bash
npm run build
npm start -- https://example.com --depth 2 --concurrency 5 --report both
```

## CLI usage

```bash
webscan https://example.com --depth 2 --concurrency 5 --report both --output ./reports
```

### Options

- `--depth <number>` crawl depth
- `--concurrency <number>` concurrent requests
- `--timeout <number>` request timeout in ms
- `--report <console|json|html|both>` report format
- `--output <dir>` output directory for reports
- `--insecure` ignore TLS errors

## Example output

```text
Target: https://example.com
Pages discovered: 12
Findings: 7
Risk score: 58/100

[high] Sensitive file exposed -> https://example.com/.env
[medium] Missing security header -> https://example.com/login
[medium] Possible open redirect -> https://example.com/redirect?url=https://example.org
```
