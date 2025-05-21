// Mock API Types based on Swagger documentation

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface MockResponse {
  request?: Record<string, any>;
  responseHeader?: Record<string, any>;
  response: Record<string, any>;
  statusCode: number;
  delay: number;
}

export interface MockEndpoint {
  id?: string;
  project: string;
  method: HttpMethod;
  path: string;
  responses: MockResponse[];
}

export interface MockEndpointPath {
  id: string;
  path: string;
}

export interface AppendResponseDto {
  apiPath: string;
  project: string;
  newResponse: MockResponse;
}