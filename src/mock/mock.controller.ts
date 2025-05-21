import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MockService } from './services/mock.service';
import { MockEndpoint } from './mock.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import {
  AppendResponseDto, CreateMockApiDto,
  GetMockListQuery,
  MockEndpointPathResponseDto, ProjectListResponseDto,
  UpdateMockRequestDto,
} from './dto/mock.dto';

@ApiTags('Mock Management APIs')
@Controller('mock')
export class MockController {
  constructor(private readonly mockService: MockService) {}

  @Post()
  @ApiOperation({ summary: 'Create a mock API' })
  @ApiResponse({
    status: 201,
    description: 'Mock API created',
    type: MockEndpoint,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBody({ type: CreateMockApiDto })
  async createMock(@Body() mock: CreateMockApiDto) {
    return await this.mockService.create(mock);
  }

  @Put()
  @ApiOperation({ summary: 'Update mock API' })
  @ApiBody({ type: MockEndpoint })
  @ApiResponse({
    status: 200,
    description: 'Mock API updated',
    type: MockEndpoint,
  })
  @ApiBody({ type: UpdateMockRequestDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async updateMock(@Body() mock: UpdateMockRequestDto) {
    return this.mockService.update(mock);
  }

  @Post("add/response")
  @ApiOperation({ summary: 'Append new responses to the existing mock API' })
  @ApiResponse({
    status: 200,
    description: 'Append response to the mock API',
    type: MockEndpoint,
  })
  @ApiBody({ type: AppendResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async appendResponse(@Body() request: AppendResponseDto) {
    return await this.mockService.appendResponse(request);
  }

  @Get()
  @ApiOperation({ summary: 'List all mock APIs' })
  @ApiResponse({
    status: 200,
    description: 'List of mock APIs',
    type: [MockEndpoint],
  })
  async listMocks(@Query() query: GetMockListQuery) {
    return this.mockService.findAll(query.project);
  }

  @Get("path")
  @ApiOperation({ summary: 'List all mock APIs Path Only' })
  @ApiResponse({
    status: 200,
    description: 'List all mock APIs Path Only',
    type: [MockEndpointPathResponseDto],
  })
  async listMockApiPath(@Query() query: GetMockListQuery) {
    return this.mockService.findAllPath(query.project);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Details of a mock API by Id' })
  @ApiParam({ name: 'id', description: 'Details of a mock API by Id' })
  @ApiResponse({
    status: 200,
    description: 'Mock API Details by ID',
    type: [MockEndpoint],
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async getMockApiDetails(@Param('id') id: string) {
    return this.mockService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mock API by Id' })
  @ApiParam({ name: 'id', description: 'Mock ID to delete' })
  @ApiResponse({ status: 200, description: 'Mock deleted (true/false)' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async deleteMock(@Param('id') id: string) {
    return await this.mockService.delete(id);
  }

  @Get("projects/list")
  @ApiOperation({ summary: 'List all projects' })
  @ApiResponse({
    status: 200,
    description: 'List all projects',
    type: [ProjectListResponseDto],
  })
  async getProjectList() {
    return this.mockService.getProjectList();
  }
}
