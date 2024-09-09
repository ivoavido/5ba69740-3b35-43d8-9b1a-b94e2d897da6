import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ServiceController } from './controllers/services.controller'
import { ServicesService } from './services/services.service'
import { DatabaseModule, repositoryProviders } from './database/database.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthMiddleware } from './middlewares/auth.middleware'
import { RolesMiddleware } from './middlewares/roles.middleware'

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [ServiceController],
  providers: [
    ...repositoryProviders, ServicesService
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, RolesMiddleware).forRoutes('services')
  }
}
