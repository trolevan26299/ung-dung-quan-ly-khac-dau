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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ImportProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationQuery } from '../../types/common.types';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công' })
  @ApiResponse({ status: 409, description: 'Mã sản phẩm đã tồn tại' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() query: PaginationQuery) {
    return this.productsService.findAll(query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm sắp hết hàng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  getLowStockProducts() {
    return this.productsService.getLowStockProducts();
  }

  @Get('top-selling')
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm bán chạy nhất' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopSellingProducts(@Query('limit') limit?: number) {
    return this.productsService.getTopSellingProducts(limit || 10);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Lấy sản phẩm theo mã' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  findByCode(@Param('code') code: string) {
    return this.productsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sản phẩm theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
} 