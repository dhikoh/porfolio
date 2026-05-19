import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProcessStepDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Nomor wajib diisi' }) @MaxLength(10) number: string;
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Judul wajib diisi' }) @MaxLength(200) title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateProcessStepDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10) number?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
