import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query,
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentStatus } from '../../types/common.types';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiResponse({ status: 201, description: 'Tạo đơn hàng thành công' })
  @ApiResponse({ status: 400, description: 'Không đủ hàng trong kho' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(
      createOrderDto, 
      req.user.userId, 
      req.user.username
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: ['pending', 'completed', 'debt'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'cancelled'] })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'agentId', required: false, type: String })
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê đơn hàng' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'YYYY-MM-DD' })
  getOrderStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.ordersService.getOrderStats(start, end);
  }

  @Get('pending-payment')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng chưa thanh toán' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  getPendingPaymentOrders() {
    return this.ordersService.getPendingPaymentOrders();
  }

  @Get('monthly-revenue/:year')
  @ApiOperation({ summary: 'Doanh thu theo tháng' })
  @ApiResponse({ status: 200, description: 'Lấy doanh thu thành công' })
  getMonthlyRevenue(@Param('year') year: number) {
    return this.ordersService.getMonthlyRevenue(Number(year));
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Lấy đơn hàng theo khách hàng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  getOrdersByCustomer(@Param('customerId') customerId: string) {
    return this.ordersService.getOrdersByCustomer(customerId);
  }

  @Get('agent/:agentId')
  @ApiOperation({ summary: 'Lấy đơn hàng theo đại lý' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  getOrdersByAgent(@Param('agentId') agentId: string) {
    return this.ordersService.getOrdersByAgent(agentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin đơn hàng theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin đơn hàng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: 'Cập nhật trạng thái thanh toán' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  updatePaymentStatus(
    @Param('id') id: string, 
    @Body('paymentStatus') paymentStatus: PaymentStatus
  ) {
    return this.ordersService.updatePaymentStatus(id, paymentStatus);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy hoặc xóa vĩnh viễn đơn hàng' })
  @ApiResponse({ status: 200, description: 'Xử lý thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  @ApiResponse({ status: 400, description: 'Đơn hàng đã được hủy trước đó' })
  @ApiQuery({ name: 'permanent', required: false, type: Boolean, description: 'true = xóa vĩnh viễn, false = chỉ hủy' })
  deleteOrder(
    @Param('id') id: string, 
    @Query('permanent') permanent: boolean, 
    @Request() req
  ) {
    if (permanent === true) {
      return this.ordersService.remove(id, req.user.userId, req.user.username);
    } else {
      return this.ordersService.cancel(id, req.user.userId, req.user.username);
    }
  }
} 