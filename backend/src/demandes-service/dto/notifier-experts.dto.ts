import { IsArray, IsInt, IsPositive } from 'class-validator';

export class NotifierExpertsDto {
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  expert_ids!: number[];
}