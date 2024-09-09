import { Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ServiceVersionEntity } from './versions.entity'

@Entity({ name: 'services' })
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  public uuid: string

  @Column({
    nullable: false,
    length: 150,
  })
  public name: string

  @Column({
    nullable: true,
    length: 500,
  })
  public description: string

  @OneToMany(() => ServiceVersionEntity, (v) => v.service)
  @JoinTable()
  public versions: ServiceVersionEntity[]

  public versionCount: number
}