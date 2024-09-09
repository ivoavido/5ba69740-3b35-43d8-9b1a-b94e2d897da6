import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { createConnection, Connection, getConnection } from 'typeorm'
import { ServiceEntity } from '../entities/service.entity'
import { ServiceVersionEntity } from '../entities/versions.entity'

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (config: ConfigService): Promise<Connection> => {
        try {
          return getConnection()
        } catch (error) {
          if (error.name === 'ConnectionNotFoundError') {
            const host = config.get<string>('DB_HOST') || 'localhost'
            const port = config.get<number>('DB_PORT') || 5432
            const username = config.get<string>('DB_USER')
            const password = config.get<string>('DB_PASSWORD')
            const database = config.get<string>('DB_SCHEMA')
            const synchronize = config.get<boolean>('DB_SYNC') || true


            return createConnection({
              type: 'postgres',
              host,
              port,
              username,
              password,
              database,
              entities: [ServiceEntity, ServiceVersionEntity],
              synchronize
            })
          } else throw error
        }
      },
      inject: [ConfigService],
    },
    ConfigService,
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule { }

export const repositoryProviders = [
  {
    provide: 'SERVICES_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(ServiceEntity),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'SERVICE_VERSIONS_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(ServiceVersionEntity),
    inject: ['DATABASE_CONNECTION'],
  },
]