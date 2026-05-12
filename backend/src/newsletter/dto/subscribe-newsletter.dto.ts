import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SubscribeNewsletterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  nom!: string;
}