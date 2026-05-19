import { IsString, IsOptional, IsArray, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCoverLetterDto {
  @ApiProperty() @IsString() @IsIn(['id', 'en']) language: string;
  @ApiProperty() @IsString() @MaxLength(200) city: string;
  @ApiProperty() @IsString() @MaxLength(100) date: string;
  @ApiProperty() @IsString() @MaxLength(200) position: string;
  @ApiProperty() @IsString() @MaxLength(300) companyName: string;
  @ApiProperty() @IsString() @MaxLength(200) recipientTitle: string;
  @ApiProperty() @IsString() @MaxLength(500) companyAddress: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) jobSource?: string;
  @ApiProperty() @IsString() @MaxLength(5000) openingParagraph: string;
  @ApiProperty() @IsString() @MaxLength(10000) bodyParagraph: string;
  @ApiProperty() @IsString() @MaxLength(3000) closingParagraph: string;
  @ApiProperty() @IsArray() @IsString({ each: true }) attachments: string[];
  @ApiProperty() @IsString() @MaxLength(200) fullName: string;
  @ApiProperty() @IsString() @MaxLength(200) birthPlace: string;
  @ApiProperty() @IsString() @MaxLength(100) birthDate: string;
  @ApiProperty() @IsString() @MaxLength(200) education: string;
  @ApiProperty() @IsString() @MaxLength(50) phone: string;
  @ApiProperty() @IsString() @MaxLength(200) email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() signatureUrl?: string;
}

export class GenerateFormatDto {
  @ApiProperty() @IsString() @IsIn(['pdf', 'docx']) format: string;
}
