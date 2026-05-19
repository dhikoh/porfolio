import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Nama wajib diisi' }) @MaxLength(100) name: string;
  @ApiProperty() @IsEmail({}, { message: 'Email tidak valid' }) email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @ApiProperty() @IsString() @MinLength(10, { message: 'Pesan minimal 10 karakter' }) @MaxLength(5000) content: string;
}

export class UpdateMessageDto {
  @ApiProperty() @IsBoolean() isRead: boolean;
}
