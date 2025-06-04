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

// Format date to Vietnamese format
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
}

// Format datetime to Vietnamese format
export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
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