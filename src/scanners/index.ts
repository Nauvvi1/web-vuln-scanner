import { Requester } from '../core/requester';
import { Scanner } from '../types/scan.types';
import { createCorsScanner } from './cors.scanner';
import { createFilesScanner } from './files.scanner';
import { createHeadersScanner } from './headers.scanner';
import { createJsEndpointsScanner } from './js-endpoints.scanner';
import { createMethodsScanner } from './methods.scanner';
import { createOpenRedirectScanner } from './open-redirect.scanner';
import { createSqliScanner } from './sqli.scanner';
import { createTraversalScanner } from './traversal.scanner';
import { createXssScanner } from './xss.scanner';

export function createScanners(requester: Requester): Scanner[] {
  return [
    createHeadersScanner(requester),
    createCorsScanner(requester),
    createMethodsScanner(requester),
    createFilesScanner(requester),
    createOpenRedirectScanner(requester),
    createXssScanner(requester),
    createSqliScanner(requester),
    createTraversalScanner(requester),
    createJsEndpointsScanner(requester)
  ];
}
