import { Expose } from 'class-transformer'
import { ServiceVersionEntity } from '../entities/versions.entity'

export class ServiceVersion {
  constructor(v: ServiceVersionEntity) {
    this.number = v.number
    this.release_date = v.release_date
  }

  @Expose()
  public number: string

  @Expose()
  public release_date?: Date
}