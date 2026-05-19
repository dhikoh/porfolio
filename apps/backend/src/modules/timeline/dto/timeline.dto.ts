import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimelineDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Tahun wajib diisi' }) @MaxLength(10) year: string;
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Judul wajib diisi' }) @MaxLength(200) title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateTimelineDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10) year?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
