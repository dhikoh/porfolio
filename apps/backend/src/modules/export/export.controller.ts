import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { ExportService } from './export.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Export')
@ApiBearerAuth()
@Controller('export')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('cv')
  async exportCV(@Res() res: Response) {
    const html = await this.exportService.generateCVHtml();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="CV-Portfolio.html"');
    res.send(html);
  }
}
