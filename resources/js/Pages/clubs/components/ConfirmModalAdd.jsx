import React from "react";
import { useTranslation } from "react-i18next";
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "تأكيد",
    cancelText = "إلغاء",
    confirmColor = "bg-primary hover:bg-primary-dark",
    icon = "warning",
    loading = false,
    iconColor = "text-yellow-500",
}) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const getIcon = () => {
        switch (icon) {
            case 'warning':
                return <ExclamationTriangleIcon className={`h-12 w-12 ${iconColor}`} />;
            case 'danger':
                return <ExclamationTriangleIcon className={`h-12 w-12 ${iconColor}`} />;
            case 'info':
                return <CheckCircleIcon className={`h-12 w-12 ${iconColor}`} />;
            case 'success':
                return <CheckCircleIcon className={`h-12 w-12 ${iconColor}`} />;
            case 'error':
                return <XCircleIcon className={`h-12 w-12 ${iconColor}`} />;
            default:
                return <ExclamationTriangleIcon className={`h-12 w-12 ${iconColor}`} />;
        }
    };

    const getIconBg = () => {
        switch (icon) {
            case 'warning':
                return 'bg-yellow-100 dark:bg-yellow-900/20';
            case 'danger':
                return 'bg-red-100 dark:bg-red-900/20';
            case 'info':
                return 'bg-blue-100 dark:bg-blue-900/20';
            case 'success':
                return 'bg-green-100 dark:bg-green-900/20';
            case 'error':
                return 'bg-red-100 dark:bg-red-900/20';
            default:
                return 'bg-yellow-100 dark:bg-yellow-900/20';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {title}
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
                        <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${confirmColor}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t("جاري التنفيذ...")}
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}