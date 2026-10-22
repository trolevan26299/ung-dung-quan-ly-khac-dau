// Tạo "Đơn đề nghị khắc dấu" dạng file Word (.doc) ngay trên trình duyệt.
// File là HTML theo chuẩn Word (mso), mở được bằng MS Word / WPS / LibreOffice,
// nên không cần thêm thư viện.

export const OUR_COMPANY_NAME = 'CÔNG TY TNHH THƯƠNG MẠI VÀ KỸ THUẬT TÂM TÍN';

export interface KhacDauDocData {
    taxCode: string;
    companyName: string;
    address: string;
    issueDate: string; // Ngày cấp / ngày thành lập (DD/MM/YYYY)
    issuedBy: string; // Cấp bởi
    representative: string; // Người đại diện theo pháp luật
    position: string; // Chức vụ
    place: string; // Nơi làm đơn
    docDate: Date; // Ngày làm đơn
}

const BLANK = '......................';

const esc = (s: string) =>
    (s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const val = (s: string, blank = BLANK) => (s && s.trim() ? esc(s.trim()) : blank);

export const buildKhacDauDocHtml = (d: KhacDauDocData): string => {
    const day = String(d.docDate.getDate()).padStart(2, '0');
    const month = String(d.docDate.getMonth() + 1).padStart(2, '0');
    const year = d.docDate.getFullYear();
    const name = val(d.companyName.toUpperCase());
    const taxCode = val(d.taxCode);
    const issueDate = val(d.issueDate, '....../....../..........');

    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Đơn đề nghị khắc dấu - ${taxCode}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
@page WordSection1 { size: 595.3pt 841.9pt; margin: 2cm 2cm 2cm 3cm; }
div.WordSection1 { page: WordSection1; }
body { font-family: 'Times New Roman', serif; font-size: 13pt; }
p { margin: 0 0 6pt 0; line-height: 1.4; font-family: 'Times New Roman', serif; font-size: 13pt; }
p.center { text-align: center; }
p.right { text-align: right; }
p.header { text-align: center; font-size: 12pt; font-weight: bold; margin-bottom: 2pt; }
p.title { text-align: center; font-size: 15pt; font-weight: bold; margin: 18pt 0 12pt 0; }
p.justify { text-align: justify; }
table.sign { width: 100%; border-collapse: collapse; margin-top: 6pt; }
table.sign td { font-family: 'Times New Roman', serif; font-size: 13pt; vertical-align: top; }
</style>
</head>
<body>
<div class="WordSection1">
<p class="header">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
<p class="header">Độc lập - Tự do - Hạnh phúc</p>
<p class="center" style="margin-bottom:12pt">--------------------</p>
<p class="right"><i>${val(d.place)}, ngày ${day} tháng ${month} năm ${year}</i></p>
<p class="title">ĐƠN ĐỀ NGHỊ KHẮC DẤU</p>
<p>Kính gửi: <b>${esc(OUR_COMPANY_NAME)}</b></p>
<p>Tên doanh nghiệp: <b>${name}</b></p>
<p>Địa chỉ trụ sở chính: ${val(d.address)}</p>
<p>Giấy chứng nhận đăng ký doanh nghiệp số: <b>${taxCode}</b></p>
<p>Ngày cấp: ${issueDate}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cấp bởi: ${val(d.issuedBy)}</p>
<p>Người đại diện theo pháp luật: Ông/Bà <b>${val(d.representative.toUpperCase())}</b></p>
<p>Chức vụ: ${val(d.position.toUpperCase())}</p>
<p class="justify">${name} được thành lập ngày ${issueDate} theo giấy chứng nhận đăng ký doanh nghiệp số ${taxCode} hoạt động theo Luật Doanh nghiệp.</p>
<p class="justify">Do mới thành lập nên có nhu cầu khắc dấu tròn Doanh nghiệp. Để tạo điều kiện thuận lợi hoạt động ${name} trong thời gian tới, đề nghị quý cơ quan khắc dấu trong thời gian sớm nhất.</p>
<p>Hồ sơ đính kèm: GPKD bản gốc + CCCD đại diện pháp luật</p>
<p class="justify">Doanh nghiệp tự chịu trách nhiệm trước pháp luật việc sử dụng con dấu hợp pháp.</p>
<p>Tôi xin chân thành cám ơn!</p>
<table class="sign"><tr>
<td style="width:50%"></td>
<td style="width:50%;text-align:center"><b>Người đề nghị</b><br><i>(Ký, ghi rõ họ tên)</i></td>
</tr></table>
</div>
</body>
</html>`;
};

export const downloadKhacDauDoc = (d: KhacDauDocData) => {
    // BOM để Word nhận đúng UTF-8 tiếng Việt
    const blob = new Blob(['﻿', buildKhacDauDocHtml(d)], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${d.taxCode || 'don-de-nghi-khac-dau'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
