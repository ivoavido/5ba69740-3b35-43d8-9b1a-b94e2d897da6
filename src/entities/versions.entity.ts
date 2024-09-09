import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ServiceEntity } from './service.entity'

@Entity({ name: 'service_versions' })
export class ServiceVersionEntity {
  @ManyToOne(() => ServiceEntity, (s) => s.versions, {
    onDelete: 'CASCADE'
  })
  public service: ServiceEntity

  public serviceUuid: string

  @PrimaryGeneratedColumn()
  public id: number

  @Column({
    nullable: false,
    length: 100,
  })
  public number: string

  @Column({
    nullable: false
  })
  public release_date: Date
}