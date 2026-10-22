import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyLookupService } from './company-lookup.service';

@ApiTags('Company Lookup')
@Controller('company-lookup')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompanyLookupController {
  constructor(private readonly companyLookupService: CompanyLookupService) {}

  @Get(':taxCode')
  @ApiOperation({ summary: 'Tra cứu thông tin doanh nghiệp theo mã số thuế' })
  @ApiResponse({ status: 200, description: 'Tra cứu thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy doanh nghiệp' })
  lookup(@Param('taxCode') taxCode: string) {
    return this.companyLookupService.lookup(taxCode);
  }
}
