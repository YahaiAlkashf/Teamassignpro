// components/tasks/TaskCard.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    DocumentTextIcon,
    CalendarIcon,
    UserCircleIcon,
    PaperClipIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { usePage } from "@inertiajs/react";

export default function TaskCard({ task, onView, onEdit, onDelete, isAdmin, canManage, isMemberView = false, userId }) {
    const { t } = useTranslation();
    const { app_url } = usePage().props;

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

    const isTaskForMe = task.assigned_to === userId;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                {task.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                                    <UserCircleIcon className="h-3 w-3" />
                                    {task.assignee?.name || t("غير معروف")}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                                    <CalendarIcon className="h-3 w-3" />
                                    {task.due_date}
                                </span>
                                {task.files && task.files.length > 0 && (
                                    <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                        <PaperClipIcon className="h-3 w-3" />
                                        {task.files.length}
                                    </span>
                                )}
                                {getStatusBadge(task.status)}
                                {isTaskForMe && task.task_text && (
                                    <span className="text-xs text-green-600 flex items-center gap-0.5">
                                        <CheckCircleIcon className="h-3 w-3" />
                                        {t("تم الرد")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => onView(task)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title={t("عرض التفاصيل")}
                    >
                        <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    {/* الموظف يشوف أزرار مختلفة */}
                    {isMemberView && isTaskForMe && task.status !== 'completed' && (
                        <button
                            onClick={() => onView(task)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title={t("إكمال المهمة")}
                        >
                            <CheckCircleIcon className="h-4 w-4" />
                        </button>
                    )}
                    
                    {/* المدير أو مدير المهام يشوف أزرار التعديل والحذف */}
                    {!isMemberView && (isAdmin || canManage) && (
                        <>
                            <button
                                onClick={() => onEdit(task)}
                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                                title={t("تعديل")}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(task)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                title={t("حذف")}
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}