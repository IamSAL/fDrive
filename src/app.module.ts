import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MockModule } from './mock/mock.module';
import { MockMiddleware } from './mock/mock.middleware';

@Module({
  imports: [MockModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MockMiddleware)
      .forRoutes('*');
  }
}
