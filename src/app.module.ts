import {MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MockModule } from './mock/mock.module';
import { MockMiddleware } from './mock/mock.middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MockModule, ConfigModule.forRoot()]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MockMiddleware)
      .forRoutes('*');
  }
}
