import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { UserResponseDto, PaginatedUsersDto } from './dto/user-response.dto';
import { USER_ROLES, ERROR_MESSAGES } from '../../constants';
import { UserRole } from '../../types/common.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: any): Promise<UserResponseDto> {
    if (currentUser.role !== USER_ROLES.ADMIN) {
      throw new ForbiddenException(ERROR_MESSAGES.ADMIN_REQUIRED);
    }

    const existingUser = await this.userModel.findOne({
      username: createUserDto.username
    });

    if (existingUser) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    return this.toResponseDto(savedUser);
  }

  async findAll(query: UserQueryDto): Promise<PaginatedUsersDto> {
    const { page = 1, limit = 10, search, role, isActive } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data: users.map(user => this.toResponseDto(user)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }
    return this.toResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<UserResponseDto> {
    if (currentUser.role !== USER_ROLES.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException(ERROR_MESSAGES.ADMIN_REQUIRED);
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    if (user.role === USER_ROLES.ADMIN) {
      const adminCount = await this.userModel.countDocuments({ role: USER_ROLES.ADMIN, isActive: true });
      if (adminCount <= 1 && updateUserDto.isActive === false) {
        throw new ForbiddenException(ERROR_MESSAGES.CANNOT_DELETE_LAST_ADMIN);
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    return this.toResponseDto(updatedUser);
  }

  async remove(id: string, currentUser: any): Promise<void> {
    if (currentUser.role !== USER_ROLES.ADMIN) {
      throw new ForbiddenException(ERROR_MESSAGES.ADMIN_REQUIRED);
    }

    if (currentUser.id === id) {
      throw new ForbiddenException('Không thể xóa chính tài khoản của bạn');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    if (user.role === USER_ROLES.ADMIN) {
      const adminCount = await this.userModel.countDocuments({ role: USER_ROLES.ADMIN, isActive: true });
      if (adminCount <= 1) {
        throw new ForbiddenException(ERROR_MESSAGES.CANNOT_DELETE_LAST_ADMIN);
      }
    }

    await this.userModel.findByIdAndDelete(id);
  }

  private toResponseDto(user: UserDocument): UserResponseDto {
    return {
      _id: user._id.toString(),
      username: user.username,
      role: user.role as UserRole,
      fullName: user.fullName,
      phone: user.phone,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
} 