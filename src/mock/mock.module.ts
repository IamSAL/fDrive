import { Logger, Module } from '@nestjs/common';
import { MockController } from './mock.controller';
import { MockService } from './services/mock.service';
import { BackupService } from './services/backup.service';
import { LiveMockGateway } from './live-mock.gateway';
import { MockMiddleware } from './mock.middleware';

@Module({
  controllers: [MockController],
  providers: [MockService, Logger, BackupService, LiveMockGateway, MockMiddleware],
  exports: [MockService, BackupService, MockMiddleware],
})
export class MockModule {}
