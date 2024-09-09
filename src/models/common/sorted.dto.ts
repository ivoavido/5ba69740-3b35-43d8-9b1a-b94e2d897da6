import { Type } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SortOptionsDto<T> {
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC

  @Type(() => String)
  @IsOptional()
  readonly sort_field?: keyof T
}