import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../../schemas/invoice.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { CreateInvoiceDto, InvoiceQueryDto } from './dto/invoice.dto';
import { PaginationResult } from '../../types/common.types';
import { TimezoneUtil } from '../../utils/timezone.util';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  // Tạo hóa đơn từ đơn hàng
  async createFromOrder(createInvoiceDto: CreateInvoiceDto, employeeId: string, employeeName: string): Promise<Invoice> {
    // Tìm đơn hàng theo số đơn hàng
    const order = await this.orderModel
      .findOne({ orderNumber: createInvoiceDto.orderCode, status: 'active' })
      .populate('customerId', 'name phone address taxCode')
      .populate('agentId', 'name')
      .populate('items.productId', 'code name sellingPrice')
      .exec();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng với mã: ' + createInvoiceDto.orderCode);
    }

    // Kiểm tra đã có hóa đơn chưa
    const existingInvoice = await this.invoiceModel.findOne({ orderId: order._id });
    if (existingInvoice) {
      throw new BadRequestException('Đơn hàng này đã có hóa đơn: ' + existingInvoice.invoiceCode);
    }

    // Tạo mã hóa đơn tự động
    const invoiceCount = await this.invoiceModel.countDocuments();
    const invoiceCode = `HD${String(invoiceCount + 1).padStart(6, '0')}`;

    // Tính toán các giá trị từ order
    const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const vatRate = 10; // 10% VAT mặc định
    const vatAmount = Math.round(subtotal * vatRate / 100);
    const shippingFee = 0; // Phí ship mặc định = 0
    const totalAmount = subtotal + vatAmount + shippingFee;

    // Tạo hóa đơn
    const invoice = new this.invoiceModel({
      invoiceCode,
      orderId: order._id,
      orderCode: order.orderNumber,
      customerName: (order.customerId as any)?.name || '',
      customerPhone: (order.customerId as any)?.phone || '',
      customerAddress: (order.customerId as any)?.address || '',
      customerTaxCode: (order.customerId as any)?.taxCode || '',
      agentName: (order.agentId as any)?.name || '',
      employeeName,
      invoiceDate: TimezoneUtil.nowInVietnam(),
      subtotal,
      vat: vatAmount,
      shippingFee,
      totalAmount,
      paymentStatus: order.paymentStatus,
      notes: createInvoiceDto.notes,
      isPrinted: false
    });

    return invoice.save();
  }

  // Lấy danh sách hóa đơn
  async findAll(query: InvoiceQueryDto = {}): Promise<PaginationResult<Invoice>> {
    const { page = 1, limit = 10, search, paymentStatus, isPrinted, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { invoiceCode: { $regex: search, $options: 'i' } },
        { orderCode: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { agentName: { $regex: search, $options: 'i' } }
      ];
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (isPrinted !== undefined) {
      filter.isPrinted = isPrinted;
    }

    if (startDate || endDate) {
      const dateFilter = TimezoneUtil.createDateRangeFilter(startDate, endDate);
      if (dateFilter.createdAt) {
        filter.invoiceDate = dateFilter.createdAt;
      }
    }

    const [data, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('orderId', 'items')
        .exec(),
      this.invoiceModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Lấy hóa đơn theo ID
  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate({
        path: 'orderId',
        populate: {
          path: 'items.productId',
          select: 'code name sellingPrice'
        }
      })
      .exec();

    if (!invoice) {
      throw new NotFoundException('Không tìm thấy hóa đơn');
    }

    return invoice;
  }

  // Lấy hóa đơn theo mã đơn hàng
  async findByOrderCode(orderCode: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findOne({ orderCode })
      .populate({
        path: 'orderId',
        populate: {
          path: 'items.productId',
          select: 'code name sellingPrice'
        }
      })
      .exec();

    if (!invoice) {
      throw new NotFoundException('Không tìm thấy hóa đơn với mã đơn hàng: ' + orderCode);
    }

    return invoice;
  }

  // Đánh dấu đã in hóa đơn
  async markAsPrinted(id: string, printedBy: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findByIdAndUpdate(
      id,
      {
        isPrinted: true,
        printedAt: TimezoneUtil.nowInVietnam(),
        printedBy
      },
      { new: true }
    ).exec();

    if (!invoice) {
      throw new NotFoundException('Không tìm thấy hóa đơn');
    }

    return invoice;
  }

  // Lấy hóa đơn để in (định dạng HTML)
  async getInvoiceForPrint(id: string): Promise<any> {
    const invoice = await this.findOne(id);
    
    // Tạo dữ liệu cho template hóa đơn
    const invoiceData = {
      invoice: {
        invoiceCode: invoice.invoiceCode,
        orderCode: invoice.orderCode,
        invoiceDate: invoice.invoiceDate,
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        customerAddress: invoice.customerAddress,
        customerTaxCode: invoice.customerTaxCode,
        agentName: invoice.agentName,
        employeeName: invoice.employeeName,
        subtotal: invoice.subtotal,
        vat: invoice.vat,
        shippingFee: invoice.shippingFee,
        totalAmount: invoice.totalAmount,
        paymentStatus: invoice.paymentStatus,
        notes: invoice.notes
      },
      items: (invoice.orderId as any).items.map(item => ({
        productCode: (item.productId as any).code,
        productName: (item.productId as any).name || item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: 'cái', // Unit mặc định
        totalPrice: item.totalPrice
      })),
      company: {
        name: 'CÔNG TY KHẮC DẤU ABC',
        address: '123 Đường ABC, Quận XYZ, TP.HCM',
        phone: '0123456789',
        email: 'contact@khacdau.com',
        taxCode: '0123456789'
      }
    };

    return invoiceData;
  }

  // Thống kê hóa đơn
  async getInvoiceStats(startDate?: Date, endDate?: Date): Promise<any> {
    const filter: any = {};
    
    if (startDate || endDate) {
      const dateFilter = TimezoneUtil.createDateRangeFilter(startDate, endDate);
      if (dateFilter.createdAt) {
        filter.invoiceDate = dateFilter.createdAt;
      }
    }

    const stats = await this.invoiceModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$totalAmount', 0]
            }
          },
          totalDebt: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'debt'] }, '$totalAmount', 0]
            }
          },
          printedInvoices: {
            $sum: {
              $cond: ['$isPrinted', 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalInvoices: 0,
      totalAmount: 0,
      totalPaid: 0,
      totalDebt: 0,
      printedInvoices: 0
    };
  }

  // Lấy hóa đơn chưa in
  async getUnprintedInvoices(): Promise<Invoice[]> {
    return this.invoiceModel
      .find({ isPrinted: false })
      .sort({ createdAt: -1 })
      .exec();
  }
} 