import { MockEndpoint, MockResponse, HttpMethod } from '../types/dto';
import { SwaggerDefinition } from '../types/swagger';

interface PathItemObject {
  [method: string]: {
    summary: string;
    description: string;
    tags: string[];
    parameters: Array<{
      name: string;
      in: string;
      required: boolean;
      schema: {
        type: string;
      };
    }>;
    requestBody?: {
      content: {
        'application/json': {
          schema: {
            type: string;
            example: Record<string, unknown>;
          };
        };
      };
    };
    responses: Record<string, {
      description: string;
      content: {
        'application/json': {
          schema: {
            type: string;
            example: Record<string, unknown>;
          };
        };
      };
      headers?: Record<string, unknown>;
    }>;
  };
}

export function generateOpenAPISpec(endpoints: MockEndpoint[]): SwaggerDefinition {
  const paths: Record<string, PathItemObject> = {};

  endpoints.forEach((endpoint) => {
    const method = endpoint.method.toLowerCase();
    const responses: PathItemObject[string]['responses'] = {};

    endpoint.responses.forEach((response: MockResponse) => {
      responses[response.statusCode.toString()] = {
        description: `Response with status code ${response.statusCode}`,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              example: response.response
            }
          }
        },
        headers: response.responseHeader
      };
    });

    const pathItem: PathItemObject = {
      [method]: {
        summary: `${endpoint.method} ${endpoint.path}`,
        description: '',
        tags: [endpoint.project || 'default'],
        parameters: [],
        requestBody: method !== 'get' && method !== 'delete' ? {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                example: endpoint.responses[0]?.request || {}
              }
            }
          }
        } : undefined,
        responses
      }
    };

    // Handle path parameters
    const pathParams = (endpoint.path.match(/:[^/]+/g) || []).map(param => param.slice(1));
    if (pathParams.length > 0) {
      pathItem[method].parameters = pathParams.map(param => ({
        name: param,
        in: 'path',
        required: true,
        schema: {
          type: 'string'
        }
      }));
    }

    // Convert Express-style path params to OpenAPI style
    const openApiPath = endpoint.path.replace(/:[^/]+/g, (match) => `{${match.slice(1)}}`);

    paths[openApiPath] = {
      ...paths[openApiPath],
      ...pathItem
    };
  });

  return {
    openapi: '3.0.0',
    info: {
      title: 'Mock API',
      version: '1.0.0',
      description: 'Generated Mock API Specification'
    },
    paths,
    components: {
      schemas: {}
    }
  };
}