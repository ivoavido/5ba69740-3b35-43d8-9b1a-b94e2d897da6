import { ServiceVersion } from './service_version.model'
import { Expose, Type } from 'class-transformer'
import { ServiceEntity } from '../entities/service.entity'

export class Service {
  constructor(s: ServiceEntity) {
    this.uuid = s.uuid
    this.name = s.name
    this.description = s.description
    this.versionCount = s.versionCount || s.versions?.length || 0
    this.versions = s.versions?.map((v) => new ServiceVersion(v)).sort((a, b) => {
      return b.release_date.getTime() - a.release_date.getTime();
    });
  }

  @Expose()
  public uuid: string

  @Expose()
  public name: string

  @Expose()
  public description: string

  @Expose({ name: 'versions_count' })
  @Type(() => Number)
  public versionCount: number

  @Expose()
  public versions: ServiceVersion[]
}