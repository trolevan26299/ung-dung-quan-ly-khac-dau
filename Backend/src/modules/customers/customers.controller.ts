import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo khách hàng mới' })
  @ApiResponse({ status: 201, description: 'Tạo khách hàng thành công' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khách hàng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  findAll(@Query() query: CustomerQueryDto) {
    const paginationQuery = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      search: query.search
    };
    return this.customersService.findAll(paginationQuery);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê khách hàng' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công' })
  getCustomerStats() {
    return this.customersService.getCustomerStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin khách hàng theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin khách hàng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khách hàng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
} 