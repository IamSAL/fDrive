import { ApiProperty } from '@nestjs/swagger';

export class MockResponse {
  @ApiProperty({ required: false, example: {
      "userId": 5000050535
    } })
  request?: Record<string, any>;

  @ApiProperty({ required: false, example: {
      "project-name": "KP"
    } })
  responseHeader?: Record<string, any>;

  @ApiProperty({ example: { message: 'Success' } })
  response: any;

  @ApiProperty({ required: false, default: 200 })
  statusCode?: number;

  @ApiProperty({ required: false, default: 0 })
  delay?: number;
}

export class MockEndpoint {
  @ApiProperty({
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id?: string;

  @ApiProperty({
    required: false,
    example: 'KP'
  })
  project: string = "KP";

  @ApiProperty({ enum: ['GET', 'POST', 'PUT', 'DELETE'], example: 'POST' })
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @ApiProperty({ example: '/api/user' })
  path: string;

  @ApiProperty({ type: [MockResponse] })
  responses: MockResponse[];
}

export class MockEndpointPath {
  @ApiProperty({
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id?: string;

  @ApiProperty({ example: '/api/user' })
  path: string;
}
