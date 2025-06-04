import { 
  Controller, 
  Get, 
  UseGuards,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatisticsPeriod } from '../../types/common.types';

@ApiTags('Statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Thống kê tổng quan' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê tổng quan thành công' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'quarter', 'year'] })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'YYYY-MM-DD' })
  getOverviewStats(
    @Query('period') period?: 'day' | 'week' | 'month' | 'quarter' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const statisticsPeriod: StatisticsPeriod | undefined = period ? {
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    } : undefined;

    return this.statisticsService.getOverviewStats(statisticsPeriod);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Doanh thu theo thời gian' })
  @ApiResponse({ status: 200, description: 'Lấy doanh thu thành công' })
  @ApiQuery({ name: 'period', required: false, enum: ['month', 'quarter', 'year'] })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getRevenueByPeriod(
    @Query('period') period: 'month' | 'quarter' | 'year' = 'month',
    @Query('year') year?: number
  ) {
    return this.statisticsService.getRevenueByPeriod(period, year);
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Top khách hàng mua nhiều nhất' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách top khách hàng thành công' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'quarter', 'year'] })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'YYYY-MM-DD' })
  getTopCustomers(
    @Query('limit') limit?: number,
    @Query('period') period?: 'day' | 'week' | 'month' | 'quarter' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const statisticsPeriod: StatisticsPeriod | undefined = period ? {
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    } : undefined;

    return this.statisticsService.getTopCustomers(limit || 10, statisticsPeriod);
  }

  @Get('top-agents')
  @ApiOperation({ summary: 'Top đại lý bán nhiều nhất' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách top đại lý thành công' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'quarter', 'year'] })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'YYYY-MM-DD' })
  getTopAgents(
    @Query('limit') limit?: number,
    @Query('period') period?: 'day' | 'week' | 'month' | 'quarter' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const statisticsPeriod: StatisticsPeriod | undefined = period ? {
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    } : undefined;

    return this.statisticsService.getTopAgents(limit || 10, statisticsPeriod);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Top sản phẩm bán chạy nhất' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách top sản phẩm thành công' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'quarter', 'year'] })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'YYYY-MM-DD' })
  getTopSellingProducts(
    @Query('limit') limit?: number,
    @Query('period') period?: 'day' | 'week' | 'month' | 'quarter' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const statisticsPeriod: StatisticsPeriod | undefined = period ? {
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    } : undefined;

    return this.statisticsService.getTopSellingProducts(limit || 10, statisticsPeriod);
  }

  @Get('debt-report')
  @ApiOperation({ summary: 'Báo cáo công nợ' })
  @ApiResponse({ status: 200, description: 'Lấy báo cáo công nợ thành công' })
  getDebtReport() {
    return this.statisticsService.getDebtReport();
  }
} 