import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { UserResponseDto, PaginatedUsersDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới (chỉ admin)' })
  @ApiResponse({ status: 201, description: 'Tạo người dùng thành công', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @ApiResponse({ status: 409, description: 'Tên đăng nhập đã tồn tại' })
  create(@Body() createUserDto: CreateUserDto, @Request() req): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách người dùng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: PaginatedUsersDto })
  findAll(@Query() query: UserQueryDto): Promise<PaginatedUsersDto> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 403, description: 'Không thể xóa admin cuối cùng' })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.usersService.remove(id, req.user);
  }
} 