import { Logger, Module } from '@nestjs/common';
import { MockController } from './mock.controller';
import { MockService } from './services/mock.service';
import { BackupService } from './services/backup.service';

@Module({
  controllers: [MockController],
  providers: [MockService, Logger, BackupService],
  exports: [MockService, BackupService],
})
export class MockModule {}
