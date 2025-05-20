import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { MockService } from './services/mock.service';
import { MockEndpoint, MockEndpointPath } from './mock.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AppendResponseDto, GetMockListQuery } from './dto/mock-list.dto';

@ApiTags('Mock APIs')
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
  @ApiBody({ type: MockEndpoint })
  async createMock(@Body() mock: Omit<MockEndpoint, 'id'>) {
    return await this.mockService.create(mock);
  }


  @Post("append/response")
  @ApiOperation({ summary: 'Append response to the mock API' })
  @ApiResponse({
    status: 200,
    description: 'Append response to the mock API',
    type: MockEndpoint,
  })
  @ApiBody({ type: AppendResponseDto })
  async appendResponse(@Body() request: AppendResponseDto) {
    return await this.mockService.appendResponse(request);
  }

  @Get()
  @ApiOperation({ summary: 'List all mock APIs with details' })
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
    type: [MockEndpointPath],
  })
  async listMockApiPath(@Query() query: GetMockListQuery) {
    return this.mockService.findAllPath(query.project);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Details of a mock API by ID' })
  @ApiParam({ name: 'id', description: 'Details of a mock API by ID' })
  @ApiResponse({
    status: 200,
    description: 'Mock API Details by ID',
    type: [MockEndpoint],
  })
  async getMockApiDetails(@Param('id') id: string) {
    return this.mockService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mock API by ID' })
  @ApiParam({ name: 'id', description: 'Mock ID to delete' })
  @ApiResponse({ status: 200, description: 'Mock deleted (true/false)' })
  async deleteMock(@Param('id') id: string) {
    return await this.mockService.delete(id);
  }
}
