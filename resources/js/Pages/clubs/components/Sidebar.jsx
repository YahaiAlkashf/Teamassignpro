import React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    HomeIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    Bars3Icon,
    ChartPieIcon,
    BookOpenIcon,
    DocumentTextIcon,
    UserIcon,
    CalendarIcon,
    ChatBubbleLeftRightIcon,
    Cog6ToothIcon,
    MegaphoneIcon,
    TrophyIcon 
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function Sidebar({ isOpen, setIsOpen }) {
    const { t, i18n } = useTranslation();
    const { url } = usePage();
    const { auth, app_url, permissions } = usePage().props;
    const sidebarWidth = isOpen ? "w-64" : "w-20";
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    
    const isActive = (path) => {
        if (path === '/clubs') {
            return url === '/clubs';
        }
        return url === path || url.startsWith(path + '/');
    };

    const userRole = auth.user?.role;
    const permission = permissions.permissions;
    
    const canManageMembers = userRole === 'admin' || permission?.manage_members;
    let navItems = [];

    if (userRole === 'admin') {
        navItems = [
            { name: t("لوحة التحكم"), icon: HomeIcon, path: "/clubs" },
            { name: t("الأعضاء"), icon: UserGroupIcon, path: "/clubs/members" },
            { name: t("المهام"), icon: ClipboardDocumentListIcon, path: "/clubs/tasks" },
            { name: t("التقارير"), icon: ChartPieIcon, path: "/clubs/reports" },
            { name: t("جدول المواعيد"), icon: CalendarIcon, path: "/clubs/schedule" },
            { name: t("لوحة الشرف"), icon: TrophyIcon, path: "/clubs/leaderboard" },
            { name: t("الملاحظات"), icon: DocumentTextIcon, path: "/clubs/notes" },
            { name: t("المكتبة"), icon: BookOpenIcon, path: "/clubs/resources" },
            { name: t("لوحة الإعلانات"), icon: MegaphoneIcon, path: "/clubs/announcements" },
            { name: t("الملف الشخصي"), icon: UserIcon, path: "/clubs/memberprofile" },
        ];
    } 
    else if (canManageMembers) {
        navItems = [
            { name: t("لوحة التحكم"), icon: HomeIcon, path: "/clubs" },
            { name: t("الأعضاء"), icon: UserGroupIcon, path: "/clubs/members" },
            { name: t("المهام"), icon: ClipboardDocumentListIcon, path: "/clubs/tasks" },
            { name: t("التقارير"), icon: ChartPieIcon, path: "/clubs/reports" },
            { name: t("جدول المواعيد"), icon: CalendarIcon, path: "/clubs/schedule" },
            { name: t("لوحة الشرف"), icon: TrophyIcon, path: "/clubs/leaderboard" },
            { name: t("الملاحظات"), icon: DocumentTextIcon, path: "/clubs/notes" },
            { name: t("المكتبة"), icon: BookOpenIcon, path: "/clubs/resources" },
            { name: t("لوحة الإعلانات"), icon: MegaphoneIcon, path: "/clubs/announcements" },
            { name: t("الملف الشخصي"), icon: UserIcon, path: "/clubs/memberprofile" },
        ];
    }
    else {
        navItems = [
            { name: t("لوحة التحكم"), icon: HomeIcon, path: "/clubs" },
            { name: t("المهام"), icon: ClipboardDocumentListIcon, path: "/clubs/tasks" },
            { name: t("التقارير"), icon: ChartPieIcon, path: "/clubs/reports" },
            { name: t("جدول المواعيد"), icon: CalendarIcon, path: "/clubs/schedule" },
            { name: t("لوحة الشرف"), icon: TrophyIcon, path: "/clubs/leaderboard" },
            { name: t("الملاحظات"), icon: DocumentTextIcon, path: "/clubs/notes" },
            { name: t("المكتبة"), icon: BookOpenIcon, path: "/clubs/resources" },
            { name: t("لوحة الإعلانات"), icon: MegaphoneIcon, path: "/clubs/announcements" },
            { name: t("الملف الشخصي"), icon: UserIcon, path: "/clubs/memberprofile" },
        ];
    }

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 h-full z-40 flex flex-col
                    bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300
                    ${sidebarWidth} ${isOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full') + ' lg:translate-x-0'}
                    ${dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'}
                    border-gray-200 dark:border-gray-700`}
            >
                <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} px-4 py-3 border-b border-gray-200 dark:border-gray-700`}>
                    <span className={`text-xl font-bold text-primary dark:text-primary-light transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        {t("القائمة")}
                    </span>
                    <button
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                    active 
                                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                } ${isOpen ? '' : 'justify-center'}`}
                            >
                                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
                                <span className={`text-sm font-medium transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                    {item.name}
                                </span>
                                
                                {!isOpen && (
                                    <div className={`absolute top-1/2 -translate-y-1/2 
                                        ${dir === 'rtl' ? 'right-full mr-3' : 'left-full ml-3'}
                                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                        transition-all duration-300 z-50`}>
                                        <div className="bg-gray-900 text-white text-sm font-medium py-1.5 px-3
                                            rounded-lg shadow-lg whitespace-nowrap relative">
                                            {item.name}
                                            <div className={`absolute top-1/2 -translate-y-1/2
                                                w-2 h-2 bg-gray-900 rotate-45
                                                ${dir === 'rtl' ? '-left-1' : '-right-1'}`}>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <div className={`flex items-center gap-3 ${isOpen ? '' : 'justify-center'}`}>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                            {auth.user?.company?.logo ? (
                                <img
                                    src={`${app_url}/storage/${auth.user.company.logo}`}
                                    className="h-full w-full object-cover rounded-full"
                                    alt={auth.user.company.company_name}
                                />
                            ) : (
                                auth.user?.name?.charAt(0)?.toUpperCase() || 'U'
                            )}
                        </div>
                        {isOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                    {auth.user?.name || t("مستخدم")}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {auth.user?.role === 'admin' ? t('مدير') : t('عضو')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}