/**
 * Timezone utilities for Vietnam (UTC+7)
 */

export class TimezoneUtil {
  private static readonly VIETNAM_TIMEZONE_OFFSET = 7; // UTC+7

  /**
   * Tạo Date object với múi giờ Việt Nam từ date string
   */
  static createVietnamDate(dateString: string): Date {
    const date = new Date(dateString);
    date.setHours(date.getHours() + this.VIETNAM_TIMEZONE_OFFSET);
    return date;
  }

  /**
   * Chuyển đổi date để filter từ múi giờ Việt Nam sang UTC cho MongoDB
   */
  static convertToUTCForFilter(localDate: Date): Date {
    const utcDate = new Date(localDate);
    utcDate.setHours(utcDate.getHours() - this.VIETNAM_TIMEZONE_OFFSET);
    return utcDate;
  }

  /**
   * Tạo date range cho filter với múi giờ Việt Nam
   */
  static createDateRangeFilter(dateFrom?: string | Date, dateTo?: string | Date): any {
    const filter: any = {};

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      
      if (dateFrom) {
        // Tạo ngày bắt đầu với múi giờ Việt Nam (UTC+7)
        const startDate = typeof dateFrom === 'string' ? new Date(dateFrom) : new Date(dateFrom);
        startDate.setHours(0, 0, 0, 0);
        // Chuyển về UTC (trừ 7 giờ)
        const utcStartDate = this.convertToUTCForFilter(startDate);
        filter.createdAt.$gte = utcStartDate;
      }
      
      if (dateTo) {
        // Tạo ngày kết thúc với múi giờ Việt Nam (UTC+7)
        const endDate = typeof dateTo === 'string' ? new Date(dateTo) : new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        // Chuyển về UTC (trừ 7 giờ)
        const utcEndDate = this.convertToUTCForFilter(endDate);
        filter.createdAt.$lte = utcEndDate;
      }
    }

    return filter;
  }

  /**
   * Format date theo múi giờ Việt Nam
   */
  static formatToVietnamTime(date: Date, includeTime = false): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
    }

    return date.toLocaleString('vi-VN', options);
  }

  /**
   * Lấy thời gian hiện tại theo múi giờ Việt Nam
   */
  static nowInVietnam(): Date {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  }

  /**
   * Tạo date với thời gian bắt đầu ngày theo múi giờ Việt Nam
   */
  static startOfDayVietnam(date: Date): Date {
    const vietnamDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    vietnamDate.setHours(0, 0, 0, 0);
    return this.convertToUTCForFilter(vietnamDate);
  }

  /**
   * Tạo date với thời gian kết thúc ngày theo múi giờ Việt Nam
   */
  static endOfDayVietnam(date: Date): Date {
    const vietnamDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    vietnamDate.setHours(23, 59, 59, 999);
    return this.convertToUTCForFilter(vietnamDate);
  }
} 