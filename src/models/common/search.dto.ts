import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'

export class SearchOptionsDto<T> {
  @IsOptional()
  readonly search?: string

  @Type(() => String)
  @IsOptional()
  readonly search_field?: keyof T
}