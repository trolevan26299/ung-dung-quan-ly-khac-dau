import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaginationQuery } from 'src/types/common.types';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  findAll(@Query() query: PaginationQuery) {
    return this.categoriesService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách danh mục hoạt động' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  findActive() {
    return this.categoriesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin danh mục theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @ApiResponse({ status: 201, description: 'Tạo danh mục thành công' })
  @ApiResponse({ status: 409, description: 'Danh mục đã tồn tại' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  @ApiResponse({ status: 409, description: 'Tên danh mục đã tồn tại' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
} 