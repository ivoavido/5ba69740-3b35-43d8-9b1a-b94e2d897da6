import { Expose, Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

export class PageOptionsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  size?: number = 10

  get index(): number {
    return (this.page - 1) * this.size
  }
}

export class PageMetaDto {
  @Expose({ name: 'page' })
  readonly page: number

  @Expose({ name: 'size' })
  readonly size: number

  @Expose({ name: 'item_count' })
  readonly itemCount: number

  @Expose({ name: 'page_count' })
  readonly pageCount: number

  @Expose({ name: 'has_previous_page' })
  readonly hasPreviousPage: boolean

  @Expose({ name: 'has_next_page' })
  readonly hasNextPage: boolean

  constructor(pageOptionsDto: PageOptionsDto, itemCount: number) {
    this.page = pageOptionsDto?.page || 1
    this.size = pageOptionsDto?.size || 10
    this.itemCount = itemCount || 0
    this.pageCount = Math.ceil(this.itemCount / this.size) || 0
    this.hasPreviousPage = this.page > 1
    this.hasNextPage = this.page < this.pageCount
  }
}

export class PageDto<T> {
  readonly items: T[]

  readonly meta: PageMetaDto

  constructor(items: T[], meta: PageMetaDto) {
    this.items = items
    this.meta = meta
  }
}