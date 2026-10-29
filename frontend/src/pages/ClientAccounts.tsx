import React, { useCallback, useEffect, useState } from 'react';
import { KeyRound, Plus, Pencil, Trash2, Lock, Unlock, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { clientAccountsApi, ClientAccount, ClientAccountInput } from '../services/api';

// Web đại lý tự tra MST và in đơn đề nghị khắc dấu
export const CLIENT_PORTAL_URL = 'https://khacdau-client.pages.dev';

const EMPTY_FORM: ClientAccountInput = {
    username: '',
    password: '',
    displayName: '',
    phone: '',
    address: '',
    notes: '',
    isActive: true,
};

const errorMessage = (error: any, fallback: string) => {
    const msg = error?.response?.data?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg || fallback;
};

export const ClientAccounts: React.FC = () => {
    const toast = useToast();
    const [accounts, setAccounts] = useState<ClientAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<ClientAccount | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<ClientAccountInput>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<ClientAccount | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setAccounts(await clientAccountsApi.list());
        } catch (error) {
            toast.error('Không tải được danh sách', errorMessage(error, 'Vui lòng thử lại'));
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormOpen(true);
    };

    const openEdit = (account: ClientAccount) => {
        setEditing(account);
        setForm({ ...account, password: '' });
        setFormOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { password, ...rest } = form;
            if (editing) {
                // Để trống mật khẩu = giữ mật khẩu cũ
                await clientAccountsApi.update(editing.id, password ? form : rest);
                toast.success('Đã cập nhật tài khoản');
            } else {
                await clientAccountsApi.create(form);
                toast.success('Đã tạo tài khoản', `Gửi đại lý: ${CLIENT_PORTAL_URL} · ${form.username}`);
            }
            setFormOpen(false);
            load();
        } catch (error) {
            toast.error('Lưu thất bại', errorMessage(error, 'Vui lòng thử lại'));
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (account: ClientAccount) => {
        try {
            await clientAccountsApi.update(account.id, { isActive: !account.isActive });
            toast.success(account.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
            load();
        } catch (error) {
            toast.error('Thao tác thất bại', errorMessage(error, 'Vui lòng thử lại'));
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await clientAccountsApi.remove(deleting.id);
            toast.success('Đã xóa tài khoản');
            setDeleting(null);
            load();
        } catch (error) {
            toast.error('Xóa thất bại', errorMessage(error, 'Vui lòng thử lại'));
        }
    };

    const setField = (key: keyof ClientAccountInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value }));

    return (
        <div className="space-y-4 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <KeyRound className="w-7 h-7 mr-3 text-primary-600" />
                        Tài khoản đại lý
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tài khoản đăng nhập web{' '}
                        <a href={CLIENT_PORTAL_URL} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            {CLIENT_PORTAL_URL.replace('https://', '')}
                            <ExternalLink className="w-3 h-3" />
                        </a>{' '}
                        để đại lý tự tra MST và in đơn đề nghị khắc dấu. Tài khoản này không vào được phần mềm nội bộ.
                    </p>
                </div>
                <Button onClick={openCreate} className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm tài khoản
                </Button>
            </div>

            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Tên đăng nhập</th>
                                <th className="px-4 py-3 font-medium">Tên đại lý</th>
                                <th className="px-4 py-3 font-medium">Điện thoại</th>
                                <th className="px-4 py-3 font-medium">Đăng nhập gần nhất</th>
                                <th className="px-4 py-3 font-medium">Trạng thái</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                        <Loader2 className="w-5 h-5 animate-spin inline" />
                                    </td>
                                </tr>
                            ) : accounts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                        Chưa có tài khoản đại lý nào
                                    </td>
                                </tr>
                            ) : (
                                accounts.map(account => (
                                    <tr key={account.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono">{account.username}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{account.displayName}</div>
                                            {account.notes && <div className="text-xs text-gray-400">{account.notes}</div>}
                                        </td>
                                        <td className="px-4 py-3">{account.phone || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs ${
                                                    account.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {account.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button size="xs" variant="ghost" title="Sửa / đổi mật khẩu" onClick={() => openEdit(account)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button size="xs" variant="ghost" title={account.isActive ? 'Khóa' : 'Mở khóa'} onClick={() => toggleActive(account)}>
                                                    {account.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                </Button>
                                                <Button size="xs" variant="ghost" title="Xóa" onClick={() => setDeleting(account)}>
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Sửa tài khoản đại lý' : 'Thêm tài khoản đại lý'}>
                <form onSubmit={handleSave} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field label="Tên đăng nhập *">
                            <Input value={form.username} onChange={setField('username')} required autoComplete="off" placeholder="vd: daily.anphat" />
                        </Field>
                        <Field label={editing ? 'Mật khẩu mới (để trống = giữ nguyên)' : 'Mật khẩu * (tối thiểu 6 ký tự)'}>
                            <Input value={form.password} onChange={setField('password')} required={!editing} minLength={6} autoComplete="new-password" />
                        </Field>
                        <Field label="Tên đại lý *" className="md:col-span-2">
                            <Input value={form.displayName} onChange={setField('displayName')} required placeholder="Điền sẵn vào mục ủy quyền khi đại lý in đơn" />
                        </Field>
                        <Field label="Số điện thoại">
                            <Input value={form.phone} onChange={setField('phone')} />
                        </Field>
                        <Field label="Ghi chú">
                            <Input value={form.notes} onChange={setField('notes')} />
                        </Field>
                        <Field label="Địa chỉ" className="md:col-span-2">
                            <Input value={form.address} onChange={setField('address')} />
                        </Field>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editing ? 'Lưu' : 'Tạo tài khoản'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Xóa tài khoản đại lý"
                message={`Xóa tài khoản "${deleting?.username}"? Đại lý sẽ không đăng nhập được nữa.`}
                confirmText="Xóa"
                type="danger"
            />
        </div>
    );
};

const Field: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({ label, className, children }) => (
    <div className={className}>
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        {children}
    </div>
);
