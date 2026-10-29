import React, { useState } from 'react';
import { FileSearch, Search, Download, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useToast } from '../contexts/ToastContext';
import { companyLookupApi } from '../services/api';
import {
    AuthorizationInfo,
    DEFAULT_ID_ISSUED_BY,
    deriveLocality,
    downloadKhacDauDoc,
    OUR_COMPANY_NAME,
} from '../lib/khacDauDoc';

const MAX_COMPANIES = 10;
const TAX_CODE_REGEX = /^\d{10}(-\d{3})?$/;
const DEFAULT_ISSUED_BY = 'Sở tài chính TP Hồ Chí Minh';
const DEFAULT_POSITION = 'GIÁM ĐỐC';
const DEFAULT_PLACE = 'TP Hồ Chí Minh';

interface CompanyRow {
    taxCode: string;
    loading: boolean;
    error?: string;
    status?: string;
    companyName: string;
    address: string;
    issueDate: string;
    issuedBy: string;
    place: string; // Nơi làm đơn
    representative: string;
    position: string;
}

const EMPTY_AUTH: AuthorizationInfo = {
    type: 'individual',
    name: '',
    idNumber: '',
    idIssueDate: '',
    idIssuedBy: DEFAULT_ID_ISSUED_BY,
    address: '',
    phone: '',
};

// YYYY-MM-DD -> DD/MM/YYYY
const toDisplayDate = (iso?: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.slice(0, 10).split('-');
    return y && m && d ? `${d}/${m}/${y}` : '';
};

const todayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const parseTaxCodes = (text: string) =>
    Array.from(new Set(text.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean)));

export const CompanyLookup: React.FC = () => {
    const toast = useToast();
    const [input, setInput] = useState('');
    const [rows, setRows] = useState<CompanyRow[]>([]);
    const [searching, setSearching] = useState(false);
    const [auth, setAuth] = useState<AuthorizationInfo>(EMPTY_AUTH);
    const [docDate, setDocDate] = useState(todayIso());

    const updateRow = (taxCode: string, patch: Partial<CompanyRow>) => {
        setRows(prev => prev.map(r => (r.taxCode === taxCode ? { ...r, ...patch } : r)));
    };

    const handleSearch = async () => {
        const codes = parseTaxCodes(input);
        if (codes.length === 0) {
            toast.error('Vui lòng nhập mã số thuế');
            return;
        }
        if (codes.length > MAX_COMPANIES) {
            toast.error(`Tối đa ${MAX_COMPANIES} công ty mỗi lần`, `Bạn đang nhập ${codes.length} mã số thuế`);
            return;
        }
        const invalid = codes.filter(c => !TAX_CODE_REGEX.test(c));
        if (invalid.length > 0) {
            toast.error('Mã số thuế không hợp lệ', invalid.join(', '));
            return;
        }

        setSearching(true);
        setRows(
            codes.map(taxCode => ({
                taxCode,
                loading: true,
                companyName: '',
                address: '',
                issueDate: '',
                issuedBy: DEFAULT_ISSUED_BY,
                place: DEFAULT_PLACE,
                representative: '',
                position: DEFAULT_POSITION,
            }))
        );

        const results = await Promise.allSettled(
            codes.map(async taxCode => {
                try {
                    const info = await companyLookupApi.lookup(taxCode);
                    // Nơi làm đơn + cấp bởi theo tỉnh/thành của công ty
                    const locality = deriveLocality(info.address);
                    updateRow(taxCode, {
                        ...(locality || {}),
                        loading: false,
                        status: info.status,
                        companyName: info.name || '',
                        address: info.address || '',
                        representative: info.representative || '',
                        issueDate: toDisplayDate(info.establishedDate),
                    });
                } catch (error: any) {
                    updateRow(taxCode, {
                        loading: false,
                        error: error?.response?.data?.message || 'Không tra cứu được, vui lòng nhập tay',
                    });
                    throw error;
                }
            })
        );

        const failed = results.filter(r => r.status === 'rejected').length;
        if (failed === 0) {
            toast.success(`Đã tra cứu ${codes.length} công ty`);
        } else {
            toast.error(`${failed}/${codes.length} mã số thuế không tra cứu được`, 'Bạn có thể nhập tay thông tin còn thiếu');
        }
        setSearching(false);
    };

    const docDateObj = () => {
        const [y, m, d] = docDate.split('-').map(Number);
        return y ? new Date(y, m - 1, d) : new Date();
    };

    const handleDownload = (row: CompanyRow) => {
        downloadKhacDauDoc({ ...row, docDate: docDateObj(), authorization: auth });
    };

    const handleDownloadAll = async () => {
        const ready = rows.filter(r => !r.loading && r.companyName);
        for (const row of ready) {
            handleDownload(row);
            // Giãn cách để trình duyệt không chặn tải nhiều file liên tiếp
            await new Promise(resolve => setTimeout(resolve, 400));
        }
        if (ready.length > 1) {
            toast.success(`Đã tải ${ready.length} file Word`, 'Nếu trình duyệt hỏi, hãy chọn "Cho phép tải nhiều tệp"');
        }
    };

    const readyCount = rows.filter(r => !r.loading && r.companyName).length;
    const codeCount = parseTaxCodes(input).length;

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FileSearch className="w-7 h-7 mr-3 text-primary-600" />
                    Tra cứu MST & đơn khắc dấu
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Nhập mã số thuế (tối đa {MAX_COMPANIES} công ty) để lấy thông tin doanh nghiệp và tải "Đơn đề nghị khắc dấu" gửi {OUR_COMPANY_NAME}.
                </p>
            </div>

            {/* Input */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Mã số thuế <span className="text-gray-400 font-normal">(mỗi dòng 1 mã, hoặc cách nhau bằng dấu phẩy)</span>
                    </label>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSearch();
                        }}
                        rows={4}
                        placeholder={'0319755936\n0312345678'}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Ngày làm đơn</label>
                            <Input type="date" value={docDate} onChange={e => setDocDate(e.target.value)} className="w-44" />
                        </div>
                        <div className="flex-1" />
                        <span className={`text-sm ${codeCount > MAX_COMPANIES ? 'text-red-600' : 'text-gray-500'}`}>
                            {codeCount}/{MAX_COMPANIES} mã
                        </span>
                        <Button onClick={handleSearch} disabled={searching} className="flex items-center">
                            {searching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                            Tra cứu
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Thông tin ủy quyền và nhận bàn giao (dùng chung cho mọi đơn) */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-sm font-medium text-gray-700">
                            Thông tin ủy quyền và nhận bàn giao{' '}
                            <span className="text-gray-400 font-normal">(để trống tên thì đơn không có mục này)</span>
                        </label>
                        <div className="flex rounded-md border border-gray-300 p-0.5 text-sm">
                            {(['individual', 'agent'] as const).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setAuth(a => ({ ...a, type }))}
                                    className={`rounded px-3 py-1 ${auth.type === type ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {type === 'individual' ? 'Cá nhân (CCCD)' : 'Đại lý'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Field label={auth.type === 'individual' ? 'Họ và tên' : 'Tên đại lý'}>
                            <Input value={auth.name} onChange={e => setAuth(a => ({ ...a, name: e.target.value }))} />
                        </Field>
                        {auth.type === 'individual' ? (
                            <>
                                <Field label="Số CCCD">
                                    <Input value={auth.idNumber} onChange={e => setAuth(a => ({ ...a, idNumber: e.target.value }))} />
                                </Field>
                                <Field label="Ngày cấp CCCD (DD/MM/YYYY)">
                                    <Input value={auth.idIssueDate} placeholder="VD: 03/10/2025" onChange={e => setAuth(a => ({ ...a, idIssueDate: e.target.value }))} />
                                </Field>
                                <Field label="Nơi cấp">
                                    <Input value={auth.idIssuedBy} onChange={e => setAuth(a => ({ ...a, idIssuedBy: e.target.value }))} />
                                </Field>
                            </>
                        ) : (
                            <Field label="Địa chỉ đại lý" className="md:col-span-2">
                                <Input value={auth.address} onChange={e => setAuth(a => ({ ...a, address: e.target.value }))} />
                            </Field>
                        )}
                        <Field label="Số điện thoại liên hệ">
                            <Input value={auth.phone} onChange={e => setAuth(a => ({ ...a, phone: e.target.value }))} />
                        </Field>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {rows.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Kiểm tra và sửa lại thông tin nếu cần trước khi tải. Ô để trống sẽ là dòng chấm để điền tay.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setRows([])} className="flex items-center">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa kết quả
                        </Button>
                        <Button variant="success" onClick={handleDownloadAll} disabled={readyCount === 0} className="flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            Tải tất cả ({readyCount})
                        </Button>
                    </div>
                </div>
            )}

            {rows.map((row, idx) => (
                <Card key={row.taxCode}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                    {idx + 1}
                                </span>
                                <span className="font-mono font-semibold text-gray-900">{row.taxCode}</span>
                                {row.loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                                {row.status && (
                                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">{row.status}</span>
                                )}
                                {row.error && (
                                    <span className="flex items-center gap-1 text-xs text-red-600">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {row.error}
                                    </span>
                                )}
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handleDownload(row)}
                                disabled={row.loading || !row.companyName}
                                className="flex items-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Tải Word
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Tên doanh nghiệp" className="md:col-span-2">
                                <Input value={row.companyName} disabled={row.loading} onChange={e => updateRow(row.taxCode, { companyName: e.target.value })} />
                            </Field>
                            <Field label="Địa chỉ trụ sở chính" className="md:col-span-2">
                                <Input value={row.address} disabled={row.loading} onChange={e => updateRow(row.taxCode, { address: e.target.value })} />
                            </Field>
                            <Field label="Người đại diện theo pháp luật">
                                <Input value={row.representative} disabled={row.loading} placeholder="Nhập tên nếu tra cứu không có" onChange={e => updateRow(row.taxCode, { representative: e.target.value })} />
                            </Field>
                            <Field label="Chức vụ">
                                <Input value={row.position} disabled={row.loading} onChange={e => updateRow(row.taxCode, { position: e.target.value })} />
                            </Field>
                            <Field label="Ngày cấp / thành lập (DD/MM/YYYY)">
                                <Input value={row.issueDate} disabled={row.loading} placeholder="VD: 20/10/2026" onChange={e => updateRow(row.taxCode, { issueDate: e.target.value })} />
                            </Field>
                            <Field label="Cấp bởi">
                                <Input value={row.issuedBy} disabled={row.loading} onChange={e => updateRow(row.taxCode, { issuedBy: e.target.value })} />
                            </Field>
                            <Field label="Nơi làm đơn">
                                <Input value={row.place} disabled={row.loading} onChange={e => updateRow(row.taxCode, { place: e.target.value })} />
                            </Field>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const Field: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({ label, className, children }) => (
    <div className={className}>
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        {children}
    </div>
);
