import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MockService } from './services/mock.service';
import { ModuleRef } from '@nestjs/core';
import { LiveMockGateway } from './live-mock.gateway';

@Injectable()
export class MockMiddleware implements NestMiddleware {
  constructor(private readonly mockService: MockService, private readonly moduleRef: ModuleRef) {}

  private logger = new Logger('HTTP');
  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(
      `${req.method} ${req.originalUrl}, ${JSON.stringify(req.body)} ${JSON.stringify(req.query)}`,
    );
    // If a request has x-mock-client header and a UI is watching, intercept via websocket
    const clientId = req.headers['x-mock-client'] as string;
    console.log({clientId})
    if (clientId) {
      // Try live interception
      const matched = this.mockService.findMatchingMock(req);
      const defaultResponse = matched ? {
        statusCode: matched.statusCode || 200,
        headers: matched.responseHeader || {},
        body: matched.response || {}
      } : { statusCode: 200, headers: {}, body: {} };
      // Dynamically resolve LiveMockGateway
      const liveMockGateway = this.moduleRef.get(LiveMockGateway, { strict: false });
      if (liveMockGateway) {
        const handled = await liveMockGateway.interceptRequest(clientId, req, res, defaultResponse);
        if (handled) return;
      }
    }
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