// Layout/AdminLayout.jsx
import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { Head } from '@inertiajs/react';

export default function AdminLayout({ children, hideLayout = false }) {
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

    if (hideLayout) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                {children}
            </div>
        );
    }

    return (
        <>
            <Head title="dashboard" />
            <div dir="rtl" className="min-h-screen bg-gray-100 dark:bg-gray-900">
                <Sidebar isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen} />
                <div className="flex flex-col flex-1">
                    <Header isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen} />
                    <main 
                        dir="rtl" 
                        className={`
                            flex-1 transition-all duration-300
                            pt-3 sm:pt-5
                            px-3 sm:px-4 md:px-6
                            pb-6
                            ${sidebarIsOpen 
                                ? 'mr-0 sm:mr-20 lg:mr-64' 
                                : 'mr-0 sm:mr-20'
                            }
                        `}
                    >
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}