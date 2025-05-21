import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MockResponse } from '../mock.entity';
import { Type } from 'class-transformer';

export class CreateMockApiDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'KP'
  })
  project?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({  required: true, example: '/api/user' })
  path: string;

  @IsEnum(['GET', 'POST', 'PUT', 'DELETE'])
  @IsNotEmpty()
  @ApiProperty({ enum: ['GET', 'POST', 'PUT', 'DELETE'], example: 'POST' })
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MockResponse)
  @ApiProperty({  required: true, type: [MockResponse] })
  responses: MockResponse[];
}

export class GetMockListQuery {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter mock API List by Project' })
  project?: string;
}

export class AppendResponseDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: "api/user" })
  apiPath: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: "KP" })
  project: string;

  @ValidateNested({ each: true })
  @Type(() => MockResponse)
  @ApiProperty({  required: true, type: MockResponse })
  newResponse: MockResponse;
}

export class UpdateMockRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    example: 'KP'
  })
  project: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ enum: ['GET', 'POST', 'PUT', 'DELETE'], example: 'POST' })
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true, example: '/api/user' })
  path: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MockResponse)
  @ApiProperty({  required: true, type: [MockResponse] })
  responses: MockResponse[];
}

export class MockEndpointPathResponseDto {
  @ApiProperty({
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id?: string;

  @ApiProperty({ example: '/api/user' })
  path: string;
}

export class ProjectListResponseDto {
  @ApiProperty({
    required: true,
    example: 'KP',
  })
  projectName: string;
}
