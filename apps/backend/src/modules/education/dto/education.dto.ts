import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEducationDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Gelar wajib diisi' }) @MaxLength(200) degree: string;
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Institusi wajib diisi' }) @MaxLength(200) institution: string;
  @ApiProperty() @IsInt() @Min(1900) @Max(2100) year: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateEducationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) degree?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) institution?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1900) @Max(2100) year?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
