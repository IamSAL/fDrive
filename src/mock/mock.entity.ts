import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class MockResponse {
  @IsObject()
  @IsNotEmpty()
  @ApiProperty({ required: true, example: {
      "userId": 5000050535
    } })
  request: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty({ required: false, example: {
      "project-name": "KP"
    } })
  responseHeader?: Record<string, any>;

  @IsNotEmpty()
  @ApiProperty({ example: { message: 'Success' } })
  response: any;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ required: false, default: 200 })
  statusCode: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, default: 0 })
  delay?: number;
}

export class MockEndpoint {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'KP'
  })
  project: string = "KP";

  @IsEnum(['GET', 'POST', 'PUT', 'DELETE'])
  @IsNotEmpty()
  @ApiProperty({ enum: ['GET', 'POST', 'PUT', 'DELETE'], example: 'POST' })
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @IsString()
  @IsNotEmpty()
  @ApiProperty({  required: true, example: '/api/user' })
  path: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({  required: true, type: [MockResponse] })
  responses: MockResponse[];

  @IsOptional()
  @ApiProperty({
    required: false,
    example: '2024-01-01T12:00:00.000Z',
    description: 'Timestamp when the mock was created',
  })
  createdAt?: Date;

  @IsOptional()
  @ApiProperty({
    required: false,
    example: '2024-01-02T15:30:00.000Z',
    description: 'Timestamp when the mock was last updated',
  })
  updatedAt?: Date;
}
