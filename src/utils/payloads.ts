export const XSS_PAYLOAD = '<script>alert(1)</script>';

export const SQLI_PAYLOADS = [
  "'",
  "' OR '1'='1",
  "\") OR (\"1\"=\"1",
  "' UNION SELECT NULL--"
];

export const SQL_ERROR_PATTERNS = [
  'sql syntax',
  'mysql',
  'postgresql',
  'sqlite',
  'ora-',
  'unclosed quotation mark',
  'syntax error near',
  'database error'
];

export const TRAVERSAL_PAYLOADS = [
  '../../../../etc/passwd',
  '..\\..\\..\\..\\windows\\win.ini',
  '../etc/passwd'
];

export const TRAVERSAL_PATTERNS = [
  'root:x:0:0:',
  '[fonts]',
  '[extensions]',
  'for 16-bit app support'
];

export const REDIRECT_PARAM_NAMES = ['url', 'next', 'redirect', 'target', 'return', 'returnTo', 'dest'];

export const FILE_PARAM_NAMES = ['file', 'path', 'page', 'template', 'document', 'folder', 'download'];

export const SENSITIVE_PATHS = [
  '/.env',
  '/.env.local',
  '/.git/config',
  '/robots.txt',
  '/sitemap.xml',
  '/backup.zip',
  '/config.php.bak',
  '/admin',
  '/swagger',
  '/graphql',
  '/actuator',
  '/.DS_Store'
];

export const DIRECTORY_LISTING_PATHS = ['/uploads/', '/files/', '/backup/', '/assets/', '/images/'];
