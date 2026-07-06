import React, { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
    children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    // Trạng thái thu gọn sidebar — lưu localStorage để giữ nguyên sau khi tải lại.
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try {
            return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
        } catch {
            return false;
        }
    });

    const toggleSidebar = useCallback(() => {
        setCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
            } catch {
                /* bỏ qua nếu localStorage không dùng được */
            }
            return next;
        });
    }, []);

    return (
        // h-screen + overflow-hidden: khung cố định đúng chiều cao màn hình.
        // Chỉ <main> cuộn; sidebar và header luôn đứng yên (không cuộn theo).
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Header collapsed={collapsed} onToggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-auto">
                    <div className="p-4 sm:p-6 w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}; 