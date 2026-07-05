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
        let startDate: Date;
        if (typeof dateFrom === 'string') {
          // Parse string date từ frontend (YYYY-MM-DD) theo múi giờ VN
          // Thêm timezone +07:00 để JavaScript tự động chuyển về UTC
          startDate = new Date(dateFrom + 'T00:00:00+07:00');
        } else {
          startDate = new Date(dateFrom);
        }
        
        // Không cần setHours và trừ thêm 7 giờ nữa vì đã parse với timezone
        filter.createdAt.$gte = startDate;
      }
      
      if (dateTo) {
        // Tạo ngày kết thúc với múi giờ Việt Nam (UTC+7)
        let endDate: Date;
        if (typeof dateTo === 'string') {
          // Parse string date từ frontend (YYYY-MM-DD) theo múi giờ VN
          // Thêm timezone +07:00 để JavaScript tự động chuyển về UTC
          endDate = new Date(dateTo + 'T23:59:59+07:00');
        } else {
          endDate = new Date(dateTo);
        }
        
        // Không cần setHours và trừ thêm 7 giờ nữa vì đã parse với timezone
        filter.createdAt.$lte = endDate;
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

  /**
   * Parse datetime string từ frontend (format: YYYY-MM-DDTHH:MM) về Date object
   * Frontend gửi datetime theo múi giờ local (UTC+7), cần chuyển về UTC để lưu database
   */
  static parseVietnamDateTime(datetimeString: string): Date {
    if (!datetimeString) return new Date();
    
    // Frontend gửi format: "2025-07-03T07:51"
    // Thêm timezone +07:00 để JavaScript hiểu đây là múi giờ VN
    const dateWithTimezone = datetimeString + '+07:00';
    const date = new Date(dateWithTimezone);
    
    // JavaScript tự động chuyển về UTC khi parse với timezone
    return date;
  }
} 