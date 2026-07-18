import React from "react";
import { useTranslation } from "react-i18next";
import { XMarkIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "حذف",
    cancelText = "إلغاء",
    confirmColor = "bg-red-600 hover:bg-red-700",
    icon = "warning",
    loading = false,
    errorMessage = null,
}) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const getIcon = () => {
        if (errorMessage) {
            return <XCircleIcon className="h-12 w-12 text-red-500" />;
        }
        switch (icon) {
            case 'warning':
                return <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />;
            case 'danger':
                return <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />;
            case 'info':
                return <ExclamationTriangleIcon className="h-12 w-12 text-blue-500" />;
            default:
                return <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />;
        }
    };

    const getIconBg = () => {
        if (errorMessage) {
            return 'bg-red-100 dark:bg-red-900/20';
        }
        switch (icon) {
            case 'warning':
                return 'bg-yellow-100 dark:bg-yellow-900/20';
            case 'danger':
                return 'bg-red-100 dark:bg-red-900/20';
            case 'info':
                return 'bg-blue-100 dark:bg-blue-900/20';
            default:
                return 'bg-yellow-100 dark:bg-yellow-900/20';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {errorMessage ? t("خطأ") : title}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90 disabled:opacity-50"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className={`p-3 rounded-full ${getIconBg()} mb-4`}>
                            {getIcon()}
                        </div>
                        {errorMessage ? (
                            <div className="w-full">
                                <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
                                    {t("حدث خطأ أثناء العملية")}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    {errorMessage}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300">
                                {message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        {errorMessage ? t("إغلاق") : cancelText}
                    </button>
                    {!errorMessage && (
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${confirmColor}`}
                        >
                            {loading ? t("جاري الحذف...") : confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}