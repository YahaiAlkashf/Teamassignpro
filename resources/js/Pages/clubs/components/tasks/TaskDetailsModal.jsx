// components/tasks/TaskDetailsModal.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
    XMarkIcon,
    UserCircleIcon,
    CalendarIcon,
    DocumentTextIcon,
    PaperClipIcon,
    EyeIcon,
    UserGroupIcon,
    CheckCircleIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { usePage } from "@inertiajs/react";

export default function TaskDetailsModal({ task, onClose }) {
    const { t } = useTranslation();
    const { app_url } = usePage().props;

    if (!task) return null;

    const getStatusBadge = (status) => {
        const statusMap = {
            completed: { label: t("مكتملة"), color: "bg-green-100 text-green-800" },
            in_progress: { label: t("جارية"), color: "bg-blue-100 text-blue-800" },
            overdue: { label: t("متأخرة"), color: "bg-red-100 text-red-800" },
            pending: { label: t("معلقة"), color: "bg-gray-100 text-gray-800" },
        };
        const info = statusMap[status] || statusMap.pending;
        return (
            <span className={`px-2 py-0.5 text-xs rounded-full ${info.color}`}>
                {info.label}
            </span>
        );
    };

    const getAssigneeNames = () => {
        if (!task.assigned_to) return t("غير محدد");
        if (Array.isArray(task.assigned_to)) {
            return task.assigned_to.length > 0 
                ? task.assigned_to.map(id => {
                    const member = task.assignees?.find(m => m.user_id === id);
                    return member?.name || id;
                }).join("، ")
                : t("غير محدد");
        }
        return task.assignee?.name || t("غير محدد");
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {t("تفاصيل المهمة")}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* العنوان والحالة */}
                    <div>
                        <div className="flex items-start justify-between">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                {task.title}
                            </h2>
                            {getStatusBadge(task.status)}
                        </div>
                    </div>

                    {/* الوصف */}
                    {task.description && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                {t("الوصف")}
                            </h4>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* المعلومات */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <UserCircleIcon className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t("المسؤول")}
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {task.assignee?.name || t("غير معروف")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <UserGroupIcon className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t("الأعضاء المكلفون")}
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {getAssigneeNames()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t("تاريخ التسليم")}
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {task.due_date}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <UserCircleIcon className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t("تم الإنشاء بواسطة")}
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {task.assigner?.name || t("غير معروف")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* الملفات المرفقة */}
                    {task.files && task.files.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                {t("الملفات المرفقة")} ({task.files.length})
                            </h4>
                            <div className="space-y-1.5">
                                {task.files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <PaperClipIcon className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {file.file_name}
                                            </span>
                                        </div>
                                        <a
                                            href={`${app_url}/storage/${file.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* إحصائيات إضافية */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {task.assignees?.length || 0}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {t("عدد المكلفين")}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {task.files?.length || 0}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {t("الملفات")}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {task.task_text ? "✅" : "❌"}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {t("ردود")}
                            </p>
                        </div>
                    </div>

             
                    {task.task_text && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-r-4 border-yellow-500">
                            <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
                                {t("رد على المهمة")}
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">
                                {task.task_text}
                            </p>
                            {task.task_file && (
                                <a
                                    href={`${app_url}/storage/${task.task_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                                >
                                    <PaperClipIcon className="h-3 w-3" />
                                    {t("عرض الملف المرفق")}
                                </a>
                            )}
                        </div>
                    )}
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