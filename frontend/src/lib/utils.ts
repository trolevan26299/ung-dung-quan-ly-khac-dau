import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to Vietnamese format
export function formatCurrency(amount: number | undefined | null): string {
  if (amount == null || isNaN(amount)) return '0 ₫';
  return amount.toLocaleString('vi-VN') + ' ₫';
}

// Format date to Vietnamese format with Vietnam timezone
export const formatDate = (dateString: string, includeTime = false): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (includeTime) {
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Format datetime to Vietnamese format with Vietnam timezone
export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

// Safe number formatter
export function formatNumber(num: number | undefined | null): string {
  if (num == null || isNaN(num)) return '0';
  return num.toLocaleString('vi-VN');
}

// Safe string access
export function safeString(str: string | undefined | null, defaultValue = ''): string {
  return str || defaultValue;
}

// Safe number access
export function safeNumber(num: number | undefined | null, defaultValue = 0): number {
  return num ?? defaultValue;
}

// Safe object property access with default
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined || result === null) {
        return defaultValue;
      }
    }
    return result;
  } catch {
    return defaultValue;
  }
}

// Format date trong table với múi giờ Việt Nam
export function formatTableDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
}

// Format datetime trong table với múi giờ Việt Nam
export function formatTableDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
} 