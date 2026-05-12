import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  @IsNotEmpty()
  receiver_id!: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  contenu!: string;
}