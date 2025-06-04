import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  UseGuards,
  Query,
  Request,
  Res 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, InvoiceQueryDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo hóa đơn từ mã đơn hàng' })
  @ApiResponse({ status: 201, description: 'Tạo hóa đơn thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  @ApiResponse({ status: 400, description: 'Đơn hàng đã có hóa đơn' })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.createFromOrder(
      createInvoiceDto, 
      req.user.userId, 
      req.user.username
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách hóa đơn' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: ['pending', 'completed', 'debt'] })
  @ApiQuery({ name: 'isPrinted', required: false, type: Boolean })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'YYYY-MM-DD' })
  findAll(@Query() query: InvoiceQueryDto) {
    return this.invoicesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê hóa đơn' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'YYYY-MM-DD' })
  getInvoiceStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.invoicesService.getInvoiceStats(start, end);
  }

  @Get('unprinteds')
  @ApiOperation({ summary: 'Lấy danh sách hóa đơn chưa in' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  getUnprintedInvoices() {
    return this.invoicesService.getUnprintedInvoices();
  }

  @Get('order/:orderCode')
  @ApiOperation({ summary: 'Lấy hóa đơn theo mã đơn hàng' })
  @ApiResponse({ status: 200, description: 'Lấy hóa đơn thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hóa đơn' })
  findByOrderCode(@Param('orderCode') orderCode: string) {
    return this.invoicesService.findByOrderCode(orderCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin hóa đơn theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hóa đơn' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/print-data')
  @ApiOperation({ summary: 'Lấy dữ liệu hóa đơn để in' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hóa đơn' })
  getInvoiceForPrint(@Param('id') id: string) {
    return this.invoicesService.getInvoiceForPrint(id);
  }

  @Get(':id/print')
  @ApiOperation({ summary: 'In hóa đơn (trả về HTML)' })
  @ApiResponse({ status: 200, description: 'In hóa đơn thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hóa đơn' })
  async printInvoice(@Param('id') id: string, @Res() res: Response, @Request() req) {
    const invoiceData = await this.invoicesService.getInvoiceForPrint(id);
    
    // Đánh dấu đã in
    await this.invoicesService.markAsPrinted(id, req.user.username);
    
    // Tạo HTML template hóa đơn
    const htmlContent = this.generateInvoiceHTML(invoiceData);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
  }

  @Patch(':id/mark-printed')
  @ApiOperation({ summary: 'Đánh dấu hóa đơn đã in' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hóa đơn' })
  markAsPrinted(@Param('id') id: string, @Request() req) {
    return this.invoicesService.markAsPrinted(id, req.user.username);
  }

  // Tạo HTML template cho hóa đơn
  private generateInvoiceHTML(data: any): string {
    const { invoice, items, company } = data;
    
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hóa đơn ${invoice.invoiceCode}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.4; }
            .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; color: #000; margin-bottom: 10px; }
            .company-info { font-size: 12px; color: #666; }
            .invoice-title { font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-block { flex: 1; }
            .info-block h4 { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
            .info-block p { margin-bottom: 3px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; font-weight: bold; text-align: center; }
            .items-table td.number { text-align: center; }
            .items-table td.amount { text-align: right; }
            .summary { float: right; width: 300px; margin-bottom: 20px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .summary-row.total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 5px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; }
            @media print {
                body { margin: 0; }
                .invoice-container { max-width: none; padding: 0; }
                @page { margin: 1cm; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <div class="company-name">${company.name}</div>
                <div class="company-info">
                    <p>Địa chỉ: ${company.address}</p>
                    <p>Điện thoại: ${company.phone} | Email: ${company.email}</p>
                    <p>Mã số thuế: ${company.taxCode}</p>
                </div>
            </div>

            <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>

            <div class="invoice-info">
                <div class="info-block">
                    <h4>Thông tin hóa đơn:</h4>
                    <p><strong>Mã hóa đơn:</strong> ${invoice.invoiceCode}</p>
                    <p><strong>Mã đơn hàng:</strong> ${invoice.orderCode}</p>
                    <p><strong>Ngày xuất:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Nhân viên:</strong> ${invoice.employeeName}</p>
                </div>
                <div class="info-block">
                    <h4>Thông tin khách hàng:</h4>
                    <p><strong>Tên:</strong> ${invoice.customerName}</p>
                    <p><strong>Điện thoại:</strong> ${invoice.customerPhone || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> ${invoice.customerAddress || 'N/A'}</p>
                    <p><strong>MST:</strong> ${invoice.customerTaxCode || 'N/A'}</p>
                    ${invoice.agentName ? `<p><strong>Đại lý:</strong> ${invoice.agentName}</p>` : ''}
                </div>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 5%">STT</th>
                        <th style="width: 15%">Mã SP</th>
                        <th style="width: 35%">Tên sản phẩm</th>
                        <th style="width: 10%">Đơn vị</th>
                        <th style="width: 10%">Số lượng</th>
                        <th style="width: 12%">Đơn giá</th>
                        <th style="width: 13%">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((item, index) => `
                        <tr>
                            <td class="number">${index + 1}</td>
                            <td>${item.productCode}</td>
                            <td>${item.productName}</td>
                            <td class="number">${item.unit}</td>
                            <td class="number">${item.quantity.toLocaleString('vi-VN')}</td>
                            <td class="amount">${item.unitPrice.toLocaleString('vi-VN')}đ</td>
                            <td class="amount">${item.totalPrice.toLocaleString('vi-VN')}đ</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="clear: both;">
                <div class="summary">
                    <div class="summary-row">
                        <span>Tổng tiền hàng:</span>
                        <span>${invoice.subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    ${invoice.vat > 0 ? `
                        <div class="summary-row">
                            <span>VAT:</span>
                            <span>${invoice.vat.toLocaleString('vi-VN')}đ</span>
                        </div>
                    ` : ''}
                    ${invoice.shippingFee > 0 ? `
                        <div class="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span>${invoice.shippingFee.toLocaleString('vi-VN')}đ</span>
                        </div>
                    ` : ''}
                    <div class="summary-row total">
                        <span>TỔNG CỘNG:</span>
                        <span>${invoice.totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>
            </div>

            <div style="clear: both; margin-top: 20px;">
                <p><strong>Trạng thái thanh toán:</strong> 
                    ${invoice.paymentStatus === 'completed' ? 'Đã thanh toán' : 
                      invoice.paymentStatus === 'debt' ? 'Công nợ' : 'Chờ thanh toán'}
                </p>
                ${invoice.notes ? `<p><strong>Ghi chú:</strong> ${invoice.notes}</p>` : ''}
            </div>

            <div class="signatures">
                <div class="signature">
                    <strong>Người mua hàng</strong>
                    <div class="signature-line">(Ký và ghi rõ họ tên)</div>
                </div>
                <div class="signature">
                    <strong>Người bán hàng</strong>
                    <div class="signature-line">${invoice.employeeName}</div>
                </div>
            </div>

            <div class="footer">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
                <p>Hóa đơn được in lúc: ${new Date().toLocaleString('vi-VN')}</p>
            </div>
        </div>

        <script>
            // Tự động in khi trang được tải
            window.onload = function() {
                window.print();
            }
        </script>
    </body>
    </html>
    `;
  }
} 