import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStatDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Label wajib diisi' }) @MaxLength(200) label: string;
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Nilai wajib diisi' }) @MaxLength(50) value: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) icon?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateStatDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) label?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) value?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) icon?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
