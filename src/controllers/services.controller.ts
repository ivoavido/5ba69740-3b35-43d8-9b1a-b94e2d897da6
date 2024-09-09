import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { PageDto } from '../models/common/paginated.dto'
import { Service } from '../models/service.model'
import { ServicesService } from '../services/services.service'
import { SearchSortPageOptionsDto } from '../models/common/search_sort_pagination.dto'
import { IsDate, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { Type } from 'class-transformer'

class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description: string
}

class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description: string
}

class CreateServiceVersionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  number: string

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  release_date?: Date
}

@Controller('services')
@UseInterceptors(ClassSerializerInterceptor)
export class ServiceController {
  constructor(private readonly _serviceService: ServicesService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getServices(
    @Query() searchSortPaginationDto: SearchSortPageOptionsDto<Service>,
  ): Promise<PageDto<Service>> {
    return this._serviceService.getServices(searchSortPaginationDto, searchSortPaginationDto, searchSortPaginationDto)
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  async getService(
    @Param('uuid') uuid: string,
    @Query('versions') versions: boolean,
  ): Promise<Service> {
    return this._serviceService.getService(uuid, versions)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createService(
    @Body() service: CreateServiceDto
  ): Promise<Service> {
    return this._serviceService.createService(service)
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  async updateService(
    @Param('uuid') uuid: string,
    @Body() service: UpdateServiceDto
  ): Promise<Service> {
    return this._serviceService.patchService(uuid, service)
  }

  @Post(':uuid/versions')
  @HttpCode(HttpStatus.CREATED)
  async createServiceVersion(
    @Param('uuid') uuid: string,
    @Body() version: CreateServiceVersionDto
  ): Promise<Service> {
    return this._serviceService.createServiceVersion(uuid, version)
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  async deleteService(
    @Param('uuid') uuid: string
  ): Promise<void> {
    return this._serviceService.deleteService(uuid)
  }

  @Delete(':uuid/versions/:version')
  @HttpCode(HttpStatus.OK)
  async deleteServiceVersion(
    @Param('uuid') uuid: string,
    @Param('version') version: string,
  ): Promise<void> {
    return this._serviceService.deleteServiceVersion(uuid, version)
  }

}