import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpsertSettingDto {
  @ApiProperty() @IsString() @IsNotEmpty() key: string;
  @ApiProperty() @IsString() value: string;
}

export class BulkUpsertSettingsDto {
  @ApiProperty({ type: [UpsertSettingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSettingDto)
  settings: UpsertSettingDto[];
}
