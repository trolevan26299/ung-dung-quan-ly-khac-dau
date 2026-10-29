import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RedisCacheService } from '../cache/redis-cache.service';
import { CacheNamespace } from '../cache/cache-keys';

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
// VietQR giới hạn 2 request/giây => giãn cách các lượt gọi, bị 429 thì đợi rồi thử lại
const VIETQR_SPACING_MS = 550;
const VIETQR_MAX_ATTEMPTS = 3;
// Lưu kết quả tra cứu 6 giờ: tra lại cùng MST không gọi nguồn ngoài (tránh bị giới hạn)
const LOOKUP_CACHE_TTL = 6 * 60 * 60;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class CompanyLookupService {
  private readonly logger = new Logger(CompanyLookupService.name);
  private vietqrQueue: Promise<void> = Promise.resolve();

  constructor(private readonly cache: RedisCacheService) {}

  // Chờ tới lượt gọi VietQR (dùng chung cho mọi request đang chạy)
  private async vietqrSlot() {
    const previous = this.vietqrQueue;
    let release: () => void;
    this.vietqrQueue = new Promise<void>(resolve => (release = resolve));
    await previous;
    setTimeout(release, VIETQR_SPACING_MS);
  }

  async lookup(rawTaxCode: string): Promise<CompanyInfo> {
    const taxCode = (rawTaxCode || '').replace(/\s/g, '');
    if (!TAX_CODE_REGEX.test(taxCode)) {
      throw new BadRequestException('Mã số thuế không hợp lệ (10 số hoặc 10 số-3 số)');
    }
    // Không tìm thấy => ném lỗi, không bị cache
    return this.cache.wrap(CacheNamespace.COMPANY_LOOKUP, taxCode, LOOKUP_CACHE_TTL, () => this.fetchCompany(taxCode));
  }

  private async fetchCompany(taxCode: string): Promise<CompanyInfo> {
    // Gọi song song 3 nguồn:
    // - VietQR: dữ liệu từ Cục Thuế, cập nhật nhanh (tên, địa chỉ, tình trạng)
    // - doanhnghiep.biz: người đại diện + ngày cấp, có cả DN mới thành lập vài ngày
    // - esgoo: dự phòng người đại diện, ngày hoạt động
    const [vietqr, dnb, esgoo] = await Promise.all([
      this.fromVietQR(taxCode),
      this.fromDoanhNghiepBiz(taxCode),
      this.fromEsgoo(taxCode),
    ]);

    if (!vietqr && !dnb && !esgoo) {
      throw new NotFoundException(`Không tìm thấy thông tin doanh nghiệp với MST ${taxCode}`);
    }

    const sources: string[] = [];
    if (vietqr) sources.push('vietqr');
    if (dnb) sources.push('doanhnghiep.biz');
    if (esgoo) sources.push('esgoo');

    return {
      taxCode,
      name: vietqr?.name || dnb?.name || esgoo?.name || '',
      internationalName: vietqr?.internationalName || undefined,
      shortName: vietqr?.shortName || undefined,
      // Ưu tiên địa chỉ VietQR vì đã cập nhật theo đơn vị hành chính mới
      address: vietqr?.address || esgoo?.address || dnb?.address || '',
      representative: dnb?.representative || esgoo?.representative || undefined,
      establishedDate: dnb?.establishedDate || esgoo?.establishedDate || undefined,
      status: vietqr?.status || dnb?.status || esgoo?.status || undefined,
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

  private async fetchText(url: string): Promise<string | null> {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      return await res.text();
    } catch (error) {
      this.logger.warn(`Lỗi gọi ${url}: ${error?.message}`);
      return null;
    }
  }

  private async fromDoanhNghiepBiz(taxCode: string) {
    const html = await this.fetchText(`https://doanhnghiep.biz/${taxCode}`);
    if (!html) return null;

    const decode = (s: string) =>
      s
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
    const prop = (name: string) => {
      const m = html.match(new RegExp(`itemprop="${name}"[^>]*>([^<]*)<`));
      return m && decode(m[1]) ? decode(m[1]) : undefined;
    };

    // Trang không có DN sẽ trả về trang tìm kiếm chung, không có taxID khớp
    if (prop('taxID') !== taxCode) return null;

    // DD/MM/YYYY -> YYYY-MM-DD
    const toIso = (s?: string) => {
      const m = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined;
    };
    const owner = html.match(/<span itemprop="Owner"><a[^>]*>([^<]+)<\/a>/);
    const nameMatch = html.match(/<th[^>]*itemprop="name"[^>]*>([^<]+)</);

    return {
      name: nameMatch ? decode(nameMatch[1]) : undefined,
      address: prop('address'),
      representative: owner ? decode(owner[1]) : undefined,
      // "Ngày cấp" là ngày cấp GCN ĐKDN, thiếu thì lấy "Ngày hoạt động"
      establishedDate: toIso(prop('IncorporatedDate')) || toIso(prop('StartDate')),
      status: prop('Status'),
    };
  }

  private async fromVietQR(taxCode: string) {
    const url = `https://api.vietqr.io/v2/business/${taxCode}`;
    let json: any = null;
    for (let attempt = 1; attempt <= VIETQR_MAX_ATTEMPTS; attempt++) {
      await this.vietqrSlot();
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (res.status === 429) {
          await sleep(600 * attempt);
          continue;
        }
        json = res.ok ? await res.json() : null;
      } catch (error) {
        this.logger.warn(`Lỗi gọi ${url}: ${error?.message}`);
      }
      break;
    }
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
