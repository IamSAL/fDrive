import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import { MockEndpoint } from '../mock.entity';
import { Request } from 'express';
import { BackupService } from './backup.service';
import {
  AppendResponseDto,
  CreateMockApiDto,
  MockEndpointPathResponseDto,
  UpdateMockRequestDto,
} from '../dto/mock.dto';
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

  findAllPath(project?: string): MockEndpointPathResponseDto[] {
    if (!project)
      return this.mocks.map(({ id, path }) => ({ id, path }));
    return this.mocks
      .filter(item => item.project === project)
      .map(({ id, path }) => ({ id, path }));
  }

  findById(id: string): any {
    let mockEndpoint = this.mocks.find(item => item.id === id);
    if (!mockEndpoint) {
      throw new BadRequestException('Mock API not found!');
    }
    return mockEndpoint;
  }

  async create(mock: CreateMockApiDto) {
    mock = this.sanitizeRequest(mock);
    let newMockAPI = {
      id: Date.now().toString(),
      path: mock.path,
      project: mock.project,
      method: mock.method,
      responses: mock.responses,
      createdAt: new Date(),
      updatedAt: new Date()
    } as MockEndpoint;

    const mockPathApiExists = await this.mockRouteExists(newMockAPI.path, newMockAPI.method, newMockAPI.project);
    if (mockPathApiExists) {
      throw new BadRequestException('Mock API already exists');
    }
    this.mocks.push(newMockAPI);
    await this.saveToFile();
    return newMockAPI;
  }

  async update(updatedMock: UpdateMockRequestDto) {
    let existingMock = this.findById(updatedMock.id);
    if (!existingMock?.id) {
      throw new BadRequestException('Mock API Not Found!');
    }
    this.mocks = this.mocks.filter(item => item.id !== updatedMock.id);
    let updatedMockAPI = {
      id: Date.now().toString(),
      path: updatedMock.path,
      project: updatedMock.project,
      method: updatedMock.method,
      responses: updatedMock.responses,
      createdAt: existingMock.createdAt,
      updatedAt: new Date()
    } as MockEndpoint;
    this.mocks.push(updatedMockAPI);
    await this.saveToFile();
    return updatedMockAPI;
  }

  sanitizeRequest(mock: CreateMockApiDto) {
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
    throw new BadRequestException('Mock API not found!');
  }

  async appendResponse(appendResponse: AppendResponseDto) {
    const index = this.mocks.findIndex((m) => m.path === appendResponse.apiPath && appendResponse.project === m.project);
    if (index < 0) throw new BadRequestException('Mock API not found!');

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
    const body = req.body || req.query;
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

  getProjectList() {
    const uniqueProjects = Array.from(
      new Set(this.mocks.map(item => item.project))
    );
    return uniqueProjects.map(projectName => ({ projectName }));
  }
}
