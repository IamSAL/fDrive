import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import { MockEndpoint, MockEndpointPath } from '../mock.entity';
import { Request } from 'express';
import { BackupService } from './backup.service';
import { AppendResponseDto } from '../dto/mock-list.dto';
import * as path from 'path';

const DATA_FILE = './data/mocks.json';

@Injectable()
export class MockService implements OnModuleInit {
  constructor(private readonly logger: Logger, private readonly backupService: BackupService) {
  }

  private mocks: MockEndpoint[] = [];

  async onModuleInit() {
    await this.loadFromFile();
  }

  async loadFromFile() {
    try {
      const content = await fs.readFile(DATA_FILE, 'utf-8');
      this.mocks = JSON.parse(content);
      this.logger.log('[MockService] Loaded mock endpoints: ' + this.mocks.length);
      this.mocks.forEach(item => this.logger.log(`Project(${item.project}) / API-[${item.path}]`));
    } catch (err) {
      this.logger.error('[MockService] Failed to load JSON file:', err.message);
      this.logger.log('[MockService] Creating Mock API Storage File:');
      const dir = path.dirname(DATA_FILE);
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(this.getDefaultMockAPI(), null, 2), 'utf-8');
      this.mocks = [];
    }
  }

  async saveToFile() {
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(this.mocks, null, 2));
      this.logger.log('[MockService] Saved mock endpoints');
    } catch (err) {
      this.logger.error('[MockService] Failed to write file:', err.message);
    }
  }

  findAll(project?: string): MockEndpoint[] {
    if (!project) return this.mocks;
    return this.mocks.filter(item => item.project === project);
  }

  findAllPath(project?: string): MockEndpointPath[] {
    if (!project)
      return this.mocks.map(({ id, path }) => ({ id, path }));
    return this.mocks
      .filter(item => item.project === project)
      .map(({ id, path }) => ({ id, path }));
  }

  findById(id: string): any {
    let mockEndpoint = this.mocks.find(item => item.id === id);
    return mockEndpoint ?? 'Mock Endpoint Not Found!';
  }

  async create(mock: Omit<MockEndpoint, 'id'>) {
    mock = this.sanitizeRequest(mock);
    const newMock: MockEndpoint = {
      ...mock,
      id: Date.now().toString(),
    };
    const mockPathExists = await this.mockRouteExists(newMock.path, newMock.method, newMock.project);
    if (mockPathExists) return 'API Endpoint Already Exists!';
    this.mocks.push(newMock);
    await this.saveToFile();
    return newMock;
  }

  sanitizeRequest(mock: Omit<MockEndpoint, 'id'>) {
    mock.path = mock.path.trim();
    mock.project = mock?.project ? mock.project.trim() : 'KP';
    return mock;
  }

  async delete(id: string) {
    const index = this.mocks.findIndex((m) => m.id === id);
    if (index > -1) {
      await this.backupService.backupJsonFile();
      this.mocks = this.mocks.filter(item => item.id !== id);
      await this.saveToFile();
      return true;
    }
    return false;
  }

  async appendResponse(appendResponse: AppendResponseDto) {
    const index = this.mocks.findIndex((m) => m.path === appendResponse.apiPath && appendResponse.project === m.project);
    if (index < 0) return 'Mock API Not Found!';

    let api = this.mocks[index];
    api.responses.push(appendResponse.newResponse);
    this.mocks[index] = api;
    await this.saveToFile();
    return api;

  }

  async mockRouteExists(path, method, project = 'KP'): Promise<boolean> {
    for (const mock of this.mocks) {
      if (mock.method === method && mock.path === path && mock.project === project) {
        return true;
      }
    }
    return false;
  }

  findMatchingMock(
    req: Request,
  ): { response: any; statusCode?: number; delay?: number; responseHeader?: any } | null {

    const method = req.method.toUpperCase();
    const path = req.baseUrl;
    const body = req.body;
    const project = req?.headers['project-name'] || 'KP';

    for (const mock of this.mocks) {
      if (mock.method === method && mock.path === path && mock.project === project) {
        const matchingResponse = mock.responses.find((res) => {
          if (!res.request) return true;
          if (JSON.stringify(res.request) === JSON.stringify(body)) {
            return res.request;
          }
        });

        if (matchingResponse) {
          return matchingResponse;
        }
      }
    }

    return null;
  }

  getDefaultMockAPI() {
    return {
      'method': 'POST',
      'path': '/api/user',
      'responses': [
        {
          'request': {
            'userId': 202214,
          },
          'responseHeader': {
            'project-leader': 'Sudipto',
          },
          'response': {
            'name': 'Sudipto Chowdhury',
            'email': {
              'work': 'sudipto.chowdhury@konasl.com',
              'personal': 'dip.chy93@gmail.com',
            },
            'mobile': '+8801753116311',
          },
          'statusCode': 200,
          'delay': 0,
        },
      ],
      'project': 'KP',
      'id': '1747713079324',
    };
  }
}
