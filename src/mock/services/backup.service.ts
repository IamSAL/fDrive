import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService {
  constructor(private readonly logger: Logger) {
  }
  private readonly sourceFile = './data/mocks.json';
  private readonly backupDir = './data/backups';

  async backupJsonFile(): Promise<void> {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `backup-${timestamp}.json`);

    fs.copyFileSync(this.sourceFile, backupFile);

    this.logger.log(`Backup created: ${backupFile}`);
  }
}
