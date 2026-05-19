import { IsOptional, IsString, IsEmail, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) fullName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) tagline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10000) summary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) birthPlace?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) birthDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) instagram?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) linkedin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) github?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) facebook?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) twitter?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) avatarUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) resumeUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) heroTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) heroSubtitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) availableText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) ctaText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ctaEmail?: string;
}
