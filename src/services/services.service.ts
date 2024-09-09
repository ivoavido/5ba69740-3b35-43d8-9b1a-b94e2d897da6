import { Injectable, Inject, NotFoundException, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common'
import { ServiceEntity } from '../entities/service.entity'
import { ServiceVersionEntity } from '../entities/versions.entity'
import { PageDto, PageMetaDto, PageOptionsDto } from '../models/common/paginated.dto'
import { SortOptionsDto } from '../models/common/sorted.dto'
import { Service } from '../models/service.model'
import { Like, Repository } from 'typeorm'
import { SearchOptionsDto } from 'src/models/common/search.dto'

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name)

  constructor(
    @Inject('SERVICES_REPOSITORY')
    private serviceRepository: Repository<ServiceEntity>,
    @Inject('SERVICE_VERSIONS_REPOSITORY')
    private serviceVersionRepository: Repository<ServiceVersionEntity>,
  ) { }

  public async getServices(
    pageOptionsDto: PageOptionsDto,
    sortOptionsDto: SortOptionsDto<Service>,
    searchOptionsDto: SearchOptionsDto<Service>,
  ): Promise<PageDto<Service>> {
    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoin('service.versions', 'version')
      .addSelect('service.uuid', 'uuid')
      .addSelect('service.name', 'name')
      .addSelect('service.description', 'description')
      .addSelect('COUNT(version.id)', 'versionCount')
      .orderBy(sortOptionsDto?.sort_field || 'service.name', sortOptionsDto?.order)
      .groupBy('service.uuid')
      .offset(pageOptionsDto?.index)
      .limit(pageOptionsDto?.size)

    if (searchOptionsDto.search) {
      queryBuilder.where({
        [searchOptionsDto.search_field || 'name']: Like(`%${searchOptionsDto.search}%`)
      })
    }

    const itemCount = await queryBuilder.getCount()
    const entities = await queryBuilder.getRawMany()

    this.logger.log(`Found ${itemCount} service/s with search=${searchOptionsDto.search || ''} on field=${searchOptionsDto.search_field || 'name'}`)

    return new PageDto(entities.map((s) => new Service(s)), new PageMetaDto(pageOptionsDto, itemCount))
  }

  public async getService(
    uuid: string,
    versions: boolean,
  ): Promise<Service> {
    const entity = await this.serviceRepository.findOne({
      where: { uuid },
      relations: versions ? ['versions'] : []
    })

    if (!entity) {
      this.logger.warn(`Service with uuid ${uuid} not found`)
      throw new NotFoundException(`Service with uuid ${uuid} not found`)
    }

    this.logger.log(`Service with uuid ${uuid} retrieved`)

    return new Service(entity)
  }

  public async deleteService(
    uuid: string
  ): Promise<void> {
    const deleteResult = await this.serviceRepository.delete(uuid)

    this.logger.log(`Deleted ${deleteResult.affected} services for uuid ${uuid}`)
  }

  public async createService(
    service: Partial<Service>
  ): Promise<Service> {

    try {
      const newService = this.serviceRepository.create({
        name: service.name,
        description: service.description
      })

      const created = await this.serviceRepository.save(newService)

      if (created) {
        this.logger.log(`Created new service ${created.name} with uuid ${created.uuid}`)
      } else {
        this.logger.error('Failed to create service')
        throw new InternalServerErrorException('Failed to create service')
      }

      return new Service(created)
    } catch (e) {
      this.logger.error('Failed to create service', e)
      throw new InternalServerErrorException('Failed to create service')
    }
  }

  public async patchService(uuid: string, updateServiceDto: Partial<Service>): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { uuid } });

    if (!service) {
      throw new NotFoundException(`Service with UUID ${uuid} not found`);
    }

    Object.assign(service, updateServiceDto);

    const updated = await this.serviceRepository.save(service)

    if (updated) {
      this.logger.log(`Patched service with uuid ${updated.uuid}`)
    } else {
      this.logger.error('Failed to patch service')
      throw new InternalServerErrorException('Failed to patch service')
    }

    return new Service(updated)
  }

  public async createServiceVersion(
    serviceUUID: string,
    version: Partial<ServiceVersionEntity>
  ): Promise<Service> {

    const service: ServiceEntity = await this.serviceRepository.findOne({
      where: {
        uuid: serviceUUID
      },
      relations: ['versions']
    })

    if (!service) {
      this.logger.warn(`Service with uuid ${serviceUUID} not found`)
      throw new NotFoundException(`Service with uuid ${serviceUUID} not found`)
    }

    if (service.versions?.filter((v) => v.number === version.number).length) {
      this.logger.warn(`Version ${version.number} already exists for service ${serviceUUID}`)
      throw new BadRequestException(`Version ${version.number} already exists for service ${serviceUUID}`)
    }

    this.serviceVersionRepository.create({
      number: version.number,
      release_date: version.release_date || new Date(),
      serviceUuid: serviceUUID
    })

    const newVersion = await this.serviceVersionRepository.save(this.serviceVersionRepository.create({
      number: version.number,
      release_date: version.release_date || new Date(),
      service
    }))

    if (!service.versions) {
      service.versions = []
    }

    service.versions.push(newVersion)

    return new Service(service)
  }

  public async deleteServiceVersion(
    uuid: string,
    number: string
  ): Promise<void> {
    const deleteResult = await this.serviceVersionRepository.delete({
      number
    })

    if (deleteResult.affected) {
      this.logger.log(`Deleted ${number} version for service ${uuid}`)
    }
  }
}