import { AppendResponseDto, MockEndpoint, Project } from '../types/dto';

const API_BASE_URL =
  localStorage.getItem("baseUrl") || window.location.href.includes('localhost')? 'http://localhost:3000' : "http://10.30.210.153:10399";

export const apiService = {
  // List all mock APIs
  listMocks: async (project?: string): Promise<MockEndpoint[]> => {
    const url = new URL(`${API_BASE_URL}/mock`);
    if (project) {
      url.searchParams.append('project', project);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch mock APIs');
    }
    return response.json();
  },

  // List all mock APIs
  listProjects: async (project?: string): Promise<Project[]> => {
    const url = new URL(`${API_BASE_URL}/mock/projects/list
`);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch mock APIs');
    }
    return response.json();
  },

  // Get mock API paths only
  listMockPaths: async (project?: string): Promise<MockEndpoint[]> => {
    const url = new URL(`${API_BASE_URL}/mock/path`);
    if (project) {
      url.searchParams.append('project', project);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch mock API paths');
    }
    return response.json();
  },

  // Create a new mock API
  createMock: async (mockData: MockEndpoint): Promise<MockEndpoint> => {
    const response = await fetch(`${API_BASE_URL}/mock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockData),
    });

    if (!response.ok) {
      throw new Error('Failed to create mock API');
    }
    return response.json();
  },

  // Update mock API
  updateMock: async (mockData: MockEndpoint, id: string): Promise<MockEndpoint> => {
    const response = await fetch(`${API_BASE_URL}/mock?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockData),
    });

    if (!response.ok) {
      throw new Error('Failed to create mock API');
    }
    return response.json();
  },

  // Get mock API details by ID
  getMockById: async (id: string): Promise<MockEndpoint> => {
    const response = await fetch(`${API_BASE_URL}/mock/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch mock API details');
    }
    return response.json();
  },

  // Delete a mock API by ID
  deleteMock: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/mock/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete mock API');
    }
    return response.json();
  },

  // Append a response to an existing mock API
  appendResponse: async (data: AppendResponseDto): Promise<MockEndpoint> => {
    const response = await fetch(`${API_BASE_URL}/mock/append/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to append response');
    }
    return response.json();
  },

  importSwagger: (c: any, s: any) => {},
  // Call a mock API to test it
  callMockApi: async (baseUrl: string, path: string, method: string, body?: any): Promise<any> => {
    console.log({ body });
    let url = `${baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    if (body && method === 'GET') {
      const query = Object.keys(body)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(body[k]))
        .join('&');

      url += '?' + query;
    }
    const response = await fetch(url, options);
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: await response.json().catch(() => null),
    };
  },
};