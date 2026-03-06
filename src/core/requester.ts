import axios from 'axios';
import https from 'https';
import { HttpResponseData, ScanOptions } from '../types/scan.types';

export class Requester {
  private readonly client: any;

  constructor(options: ScanOptions) {
    this.client = axios.create({
      timeout: options.timeout,
      maxRedirects: 5,
      validateStatus: () => true,
      responseType: 'text',
      headers: {
        'User-Agent': 'web-vuln-scanner/1.0',
        Accept: '*/*'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: !options.insecure })
    });
  }

  async get(url: string, extraHeaders?: Record<string, string>): Promise<HttpResponseData | null> {
    try {
      const response = await this.client.get(url, { headers: extraHeaders });
      return {
        url,
        status: response.status,
        headers: response.headers,
        data: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        finalUrl: response.request?.res?.responseUrl || url
      };
    } catch (error) {
      return this.handleError(error, url);
    }
  }

  async options(url: string): Promise<HttpResponseData | null> {
    try {
      const response = await this.client.options(url);
      return {
        url,
        status: response.status,
        headers: response.headers,
        data: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        finalUrl: response.request?.res?.responseUrl || url
      };
    } catch (error) {
      return this.handleError(error, url);
    }
  }

  private handleError(error: unknown, url: string): HttpResponseData | null {
    if (axios.isAxiosError(error)) {
      const axiosError = error as any;
      if (axiosError.response) {
        return {
          url,
          status: axiosError.response.status,
          headers: axiosError.response.headers,
          data: typeof axiosError.response.data === 'string' ? axiosError.response.data : JSON.stringify(axiosError.response.data),
          finalUrl: url
        };
      }
    }
    return null;
  }
}
