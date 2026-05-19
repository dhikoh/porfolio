import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum, Matches, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../../../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Judul wajib diisi' }) @MaxLength(200) title: string;
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Slug wajib diisi' }) @Matches(/^[a-z0-9-]+$/, { message: 'Slug hanya boleh huruf kecil, angka, dan dash' }) slug: string;
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Deskripsi wajib diisi' }) @MaxLength(1000) description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10000) longDesc?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) domain?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) liveUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) githubUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) imageUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) videoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tags?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() featured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
}

export class UpdateProjectDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Matches(/^[a-z0-9-]+$/, { message: 'Slug hanya boleh huruf kecil, angka, dan dash' }) slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10000) longDesc?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) domain?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) liveUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) githubUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) imageUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) videoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tags?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() featured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
}
