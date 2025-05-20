import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MockService } from './services/mock.service';

@Injectable()
export class MockMiddleware implements NestMiddleware {
  constructor(private readonly mockService: MockService) {}

  private logger = new Logger('HTTP');
  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`${req.method} ${req.originalUrl}, ${JSON.stringify(req.body)}`);
    const matched = this.mockService.findMatchingMock(req);
    if (matched) {
      const { response, delay = 0, statusCode = 200, responseHeader } = matched;
      setTimeout(() => {
        res.header(responseHeader).status(statusCode).json(response);
      }, delay);
    } else {
      next();
    }
  }
}