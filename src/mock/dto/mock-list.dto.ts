import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MockResponse } from '../mock.entity';

export class GetMockListQuery {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter mock API List by Project' })
  project?: string;
}

export class AppendResponseDto {
  @ApiProperty({ required: true, example: "api/user" })
  apiPath: string;

  @ApiProperty({ required: true, example: "KP" })
  project: string;

  @ApiProperty({ required: true, example: {
        "request": {
          "userId": 50001051908
        },
        "response": {
          "userId": 50001051908,
          "accountInfo": {
            "accountId": "36285",
            "userName": "기충종",
            "bankAccount": "1002041963212",
            "bankName": "우리은행",
            "bankCode": "020",
            "createdDateTime": "20231017164042729",
            "updatedDateTime": "20231017164042729"
          },
          "response": {
            "code": "000_000",
            "description": "Success."
          }
        },
        "statusCode": 200,
        "delay": 2000
      } })
  newResponse: MockResponse;
}


