import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards,
  Query,
  Param,
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockTransactionDto, ImportStockDto, AdjustStockDto, StockReportQueryDto } from './dto/stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Stock')
@Controller('stock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('transaction')
  @ApiOperation({ summary: 'Tạo giao dịch kho' })
  @ApiResponse({ status: 201, description: 'Tạo giao dịch thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  createTransaction(@Body() createStockTransactionDto: CreateStockTransactionDto, @Request() req) {
    return this.stockService.createTransaction(
      createStockTransactionDto, 
      req.user.userId, 
      req.user.username
    );
  }

  @Post('import')
  @ApiOperation({ summary: 'Nhập kho' })
  @ApiResponse({ status: 201, description: 'Nhập kho thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  importStock(@Body() importStockDto: ImportStockDto, @Request() req) {
    return this.stockService.importStock(
      importStockDto, 
      req.user.userId, 
      req.user.username
    );
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Điều chỉnh kho' })
  @ApiResponse({ status: 201, description: 'Điều chỉnh kho thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  adjustStock(@Body() adjustStockDto: AdjustStockDto, @Request() req) {
    return this.stockService.adjustStock(
      adjustStockDto, 
      req.user.userId, 
      req.user.username
    );
  }

  @Get('report')
  @ApiOperation({ summary: 'Lấy báo cáo giao dịch kho' })
  @ApiResponse({ status: 200, description: 'Lấy báo cáo thành công' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'transactionType', required: false, enum: ['import', 'export', 'adjustment'] })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'YYYY-MM-DD' })
  getStockReport(@Query() query: StockReportQueryDto) {
    return this.stockService.getStockReport(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Thống kê tồn kho' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công' })
  getStockSummary() {
    return this.stockService.getStockSummary();
  }

  @Get('product/:productId/history')
  @ApiOperation({ summary: 'Lấy lịch sử giao dịch của sản phẩm' })
  @ApiResponse({ status: 200, description: 'Lấy lịch sử thành công' })
  getProductTransactionHistory(@Param('productId') productId: string) {
    return this.stockService.getProductTransactionHistory(productId);
  }
} 