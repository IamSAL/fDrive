import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MockEndpoint } from '../types/dto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isDevelopmentMode() {
  return typeof window !== 'undefined' && window.location.hostname === 'localhost';
}

  export const getCurlCommand = (endpoint: MockEndpoint, response: import('../types/dto').MockResponse) => {
    const url = `${localStorage.getItem('baseUrl')}${endpoint.path}`;
    let cmd = `curl -X ${endpoint.method} '${url}'`;
    if (response.request && Object.keys(response.request).length > 0) {
      cmd += ` -d '${JSON.stringify(response.request)}'`;
    }
    if (response.responseHeader && Object.keys(response.responseHeader).length > 0) {
      Object.entries(response.responseHeader).forEach(([k, v]) => {
        cmd += ` -H '${k}: ${v}'`;
      });
    }
    return cmd;
  };