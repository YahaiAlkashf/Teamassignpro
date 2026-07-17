import React from "react";
import { useTranslation } from "react-i18next";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CalendarIcon,
    BookOpenIcon,
    MegaphoneIcon,
    ChartPieIcon,
    DocumentTextIcon,
    TrophyIcon,
} from "@heroicons/react/24/outline";

export default function PermissionsModal({ member, onClose }) {
    const { t } = useTranslation();

    if (!member) return null;

    const permissions = [
        { key: 'manage_members', label: t("إدارة الأعضاء"), icon: UserGroupIcon },
        { key: 'add_tasks', label: t("إضافة مهام"), icon: ClipboardDocumentListIcon },
        { key: 'add_events', label: t("إضافة فعاليات"), icon: CalendarIcon },
        { key: 'add_library', label: t("إضافة للمكتبة"), icon: BookOpenIcon },
        { key: 'add_advertisement', label: t("إدارة الإعلانات"), icon: MegaphoneIcon },
        { key: 'manage_reports', label: t("إدارة التقارير"), icon: ChartPieIcon },
        { key: 'manage_notes', label: t("إدارة الملاحظات"), icon: DocumentTextIcon },
        { key: 'manage_leaderboard', label: t("لوحة الشرف"), icon: TrophyIcon },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {t("صلاحيات العضو")}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                            {member.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                {member.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {member.jop_title || t("لا يوجد مسمى وظيفي")}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                        {permissions.map((perm) => {
                            const Icon = perm.icon;
                            const isActive = member.permission?.[perm.key];
                            return (
                                <div
                                    key={perm.key}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-green-50 dark:bg-green-900/20 border-r-4 border-green-500'
                                            : 'bg-gray-50 dark:bg-gray-700/50'
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 flex-shrink-0 ${
                                        isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                                    }`} />
                                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                        {perm.label}
                                    </span>
                                    <span className={`text-sm font-semibold ${
                                        isActive
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-gray-400'
                                    }`}>
                                        {isActive ? '✅' : '❌'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t("إغلاق")}
                    </button>
                </div>
            </div>
        </div>
    );
}