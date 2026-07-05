import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        // h-screen + overflow-hidden: khung cố định đúng chiều cao màn hình.
        // Chỉ <main> cuộn; sidebar và header luôn đứng yên (không cuộn theo).
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Header />
                <main className="flex-1 overflow-auto">
                    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}; 