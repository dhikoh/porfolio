import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { BulkUpsertSettingsDto } from './dto/settings.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly service: SettingsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings (public)' })
  async findAll() {
    return this.service.getMap();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk upsert settings (admin)' })
  async bulkUpsert(
    @Body() dto: BulkUpsertSettingsDto,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.service.bulkUpsert(dto.settings);
    await this.auditService.log(userId, 'UPDATE', 'SiteSettings', undefined, undefined, dto.settings);
    return result;
  }
}
