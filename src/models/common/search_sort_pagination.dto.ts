import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Order } from './sorted.dto'

/**
 * @ValidateNested() was not working as expected so pagination and sorting fields are duplicated here
 * 
 * TOIMPROVE: switch to @ValidateNested() of paginated.dto, sorted.dto and searh.dto
 */
export class SearchSortPageOptionsDto<T> {
  @IsOptional()
  @IsString()
  search?: string

  @Type(() => String)
  @IsOptional()
  readonly search_field?: keyof T

  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC

  @Type(() => String)
  @IsOptional()
  readonly sort_field?: keyof T

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