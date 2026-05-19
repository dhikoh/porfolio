import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty() @IsString() @IsNotEmpty({ message: 'Nama wajib diisi' }) @MaxLength(200) name: string;
  @ApiProperty({ enum: ['expertise', 'technical'] }) @IsEnum(['expertise', 'technical'], { message: 'Kategori harus expertise atau technical' }) category: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) level?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) icon?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateSkillDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['expertise', 'technical']) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) level?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) icon?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
