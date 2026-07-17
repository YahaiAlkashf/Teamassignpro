// components/reports/ReportCard.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
    EyeIcon, 
    PencilIcon, 
    TrashIcon, 
    DocumentTextIcon,
    CalendarIcon,
    UserCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PaperClipIcon
} from "@heroicons/react/24/outline";
import { usePage } from "@inertiajs/react";
import ConfirmModal from "../ConfirmModal";

export default function ReportCard({ report, onView, onEdit, onDelete, isAdmin, canManage }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const currentMemberId = auth.user?.member?.id;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const getStatusBadge = (status) => {
        const statusMap = {
            draft: { label: t("مسودة"), color: "bg-gray-100 text-gray-800" },
            sent: { label: t("مرسل"), color: "bg-blue-100 text-blue-800" },
            under_review: { label: t("تحت المراجعة"), color: "bg-yellow-100 text-yellow-800" },
            approved: { label: t("مقبول"), color: "bg-green-100 text-green-800" },
            rejected: { label: t("مرفوض"), color: "bg-red-100 text-red-800" },
        };
        const info = statusMap[status] || statusMap.draft;
        return (
            <span className={`px-2 py-0.5 text-xs rounded-full ${info.color}`}>
                {info.label}
            </span>
        );
    };

    const getTypeLabel = (type) => {
        const typeMap = {
            daily: t("يومي"),
            weekly: t("اسبوعي"),
            monthly: t("شهري"),
            custom: t("مخصص"),
        };
        return typeMap[type] || type;
    };

    const canEditReport = () => {
        const isOwner = report.member_id === currentMemberId;
        const isDraftOrRejected = ['draft', 'rejected'].includes(report.status);
        return isOwner && isDraftOrRejected;
    };

    const canDeleteReport = () => {
        if (isAdmin || canManage) return true;
        const isOwner = report.member_id === currentMemberId;
        return isOwner && report.status === 'draft';
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await onDelete(report);
            setShowDeleteModal(false);
        } catch (error) {
            setDeleteError(error.message || t("حدث خطأ أثناء حذف التقرير"));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
        setDeleteError(null);
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                            <DocumentTextIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                    {report.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                                        <UserCircleIcon className="h-3 w-3" />
                                        {report.member?.name || t("غير معروف")}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                                        <CalendarIcon className="h-3 w-3" />
                                        {new Date(report.created_at).toLocaleDateString('ar-EG')}
                                    </span>
                                    <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                        {getTypeLabel(report.type)}
                                    </span>
                                    {getStatusBadge(report.status)}
                                    {report.files && report.files.length > 0 && (
                                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                            <PaperClipIcon className="h-3 w-3" />
                                            {report.files.length}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-1">
                                    {report.content}
                                </p>
                                {report.manager_reply && (
                                    <div className="mt-1 p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded border-r-2 border-blue-400">
                                        <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                                            <span className="font-semibold">{t("رد المدير:")}</span> {report.manager_reply}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={() => onView(report)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title={t("عرض التفاصيل")}
                        >
                            <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        {canEditReport() && (
                            <button
                                onClick={() => onEdit(report)}
                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                                title={t("تعديل")}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        )}

                        {canDeleteReport() && (
                            <button
                                onClick={handleDeleteClick}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                title={t("حذف")}
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                title={t("تأكيد الحذف")}
                message={t(`هل أنت متأكد من حذف التقرير "${report.title}"؟`)}
                confirmText={t("حذف")}
                cancelText={t("إلغاء")}
                confirmColor="bg-red-600 hover:bg-red-700"
                icon="danger"
                loading={isDeleting}
                errorMessage={deleteError}
            />
        </>
    );
}