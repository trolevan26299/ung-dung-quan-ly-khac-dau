import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface CompanyInfo {
  taxCode: string;
  name: string;
  internationalName?: string;
  shortName?: string;
  address: string;
  representative?: string; // Người đại diện theo pháp luật
  establishedDate?: string; // Ngày hoạt động / ngày cấp (YYYY-MM-DD)
  status?: string; // Tình trạng hoạt động
  sources: string[];
}

// MST doanh nghiệp: 10 số, chi nhánh: 10 số + "-" + 3 số
const TAX_CODE_REGEX = /^\d{10}(-\d{3})?$/;
const REQUEST_TIMEOUT_MS = 10000;

@Injectable()
export class CompanyLookupService {
  private readonly logger = new Logger(CompanyLookupService.name);

  async lookup(rawTaxCode: string): Promise<CompanyInfo> {
    const taxCode = (rawTaxCode || '').replace(/\s/g, '');
    if (!TAX_CODE_REGEX.test(taxCode)) {
      throw new BadRequestException('Mã số thuế không hợp lệ (10 số hoặc 10 số-3 số)');
    }

    // Gọi song song 2 nguồn:
    // - VietQR: dữ liệu từ Cục Thuế, cập nhật nhanh (tên, địa chỉ, tình trạng)
    // - esgoo: có thêm người đại diện, ngày hoạt động (thường thiếu với DN mới thành lập)
    const [vietqr, esgoo] = await Promise.all([
      this.fromVietQR(taxCode),
      this.fromEsgoo(taxCode),
    ]);

    if (!vietqr && !esgoo) {
      throw new NotFoundException(`Không tìm thấy thông tin doanh nghiệp với MST ${taxCode}`);
    }

    const sources: string[] = [];
    if (vietqr) sources.push('vietqr');
    if (esgoo) sources.push('esgoo');

    return {
      taxCode,
      name: vietqr?.name || esgoo?.name || '',
      internationalName: vietqr?.internationalName || undefined,
      shortName: vietqr?.shortName || undefined,
      // Ưu tiên địa chỉ VietQR vì đã cập nhật theo đơn vị hành chính mới
      address: vietqr?.address || esgoo?.address || '',
      representative: esgoo?.representative || undefined,
      establishedDate: esgoo?.establishedDate || undefined,
      status: vietqr?.status || esgoo?.status || undefined,
      sources,
    };
  }

  private async fetchJson(url: string): Promise<any | null> {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      this.logger.warn(`Lỗi gọi ${url}: ${error?.message}`);
      return null;
    }
  }

  private async fromVietQR(taxCode: string) {
    const json = await this.fetchJson(`https://api.vietqr.io/v2/business/${taxCode}`);
    if (!json || json.code !== '00' || !json.data?.name) return null;
    return {
      name: json.data.name as string,
      internationalName: json.data.internationalName as string | null,
      shortName: json.data.shortName as string | null,
      address: json.data.address as string,
      status: json.data.status as string | undefined,
    };
  }

  private async fromEsgoo(taxCode: string) {
    const json = await this.fetchJson(`https://esgoo.net/api-mst/${taxCode}.htm`);
    if (!json || json.error !== 0 || !json.data?.ten) return null;
    const d = json.data;
    const valid = (v: any) => (typeof v === 'string' && v && v !== 'null' ? v : undefined);
    const date = valid(d.hoatdong);
    return {
      name: d.ten as string,
      address: valid(d.dc),
      representative: valid(d.daidien),
      // esgoo trả "1970-01-01" khi không có dữ liệu
      establishedDate: date && !date.startsWith('1970') ? date : undefined,
      status: valid(d.tinhtrang),
    };
  }
}
