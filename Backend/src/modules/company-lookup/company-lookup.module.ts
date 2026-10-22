import { Module } from '@nestjs/common';
import { CompanyLookupController } from './company-lookup.controller';
import { CompanyLookupService } from './company-lookup.service';

@Module({
  controllers: [CompanyLookupController],
  providers: [CompanyLookupService],
})
export class CompanyLookupModule {}
