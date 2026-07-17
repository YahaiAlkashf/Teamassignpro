// components/tasks/TasksModel.jsx
import React, { useState } from "react";
import { 
    XMarkIcon, 
    CheckBadgeIcon, 
    XCircleIcon, 
    ClockIcon, 
    PaperClipIcon, 
    EyeIcon, 
    ArrowDownTrayIcon, 
    PencilIcon 
} from "@heroicons/react/24/outline";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import ConfirmModal from "@/components/ConfirmModal";

export default function TasksModel({ task, closeModal, handleTaskStatusChange, canManage, userId }) {
    const { t } = useTranslation();
    const { app_url } = usePage().props;
    const [taskStatus, setTaskStatus] = useState('');
    const [status, setStatus] = useState('');
    const [showModel, setShowModel] = useState(false);
    const [modelDescription, setModelDescription] = useState(false);
    const [description, setDescription] = useState('');
    
    // States for reply modal
    const [taskTextModal, setTaskTextModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [taskText, setTaskText] = useState('');
    const [taskFile, setTaskFile] = useState(null);
    const [sending, setSending] = useState(false);
    const [replyErrors, setReplyErrors] = useState({});

    // Confirm Modal for member completion
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: null,
        title: '',
        message: '',
        confirmText: 'تأكيد',
        confirmColor: 'bg-green-600 hover:bg-green-700',
        icon: 'info',
        loading: false,
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'مكتمل':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
            case 'قيد الانتظار':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'rejected':
            case 'مرفوض':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'in progress':
            case 'قيد التنفيذ':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-lg">
                        {t("مكتملة")}
                    </span>
                );
            case "in_progress":
                return (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">
                        {t("جارية")}
                    </span>
                );
            case "overdue":
                return (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-lg">
                        {t("متأخرة")}
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-lg">
                        {t("معلقة")}
                    </span>
                );
        }
    };

    const handleShowStatusEdit = (tas) => {
        setTaskStatus(tas);
        setStatus(tas.status);
        setShowModel(true);
    };

    const openDescriptionModal = (des) => {
        setDescription(des);
        setModelDescription(true);
    };

    const handleSendReply = async () => {
        if (!taskText.trim() && !taskFile) {
            setReplyErrors({ general: [t("يرجى كتابة رد أو رفع ملف")] });
            return;
        }

        setSending(true);
        setReplyErrors({});
        
        try {
            const formData = new FormData();
            if (taskText.trim()) {
                formData.append('task_text', taskText);
            }
            if (taskFile) {
                formData.append('task_file', taskFile);
            }
            
            await axios.post(`${app_url}/tasktext/${currentTask.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            setTaskTextModal(false);
            setTaskText('');
            setTaskFile(null);
            setCurrentTask(null);
            setReplyErrors({});
            
            // Refresh tasks data without reloading page
            await handleTaskStatusChange(currentTask.id, currentTask.status);
            closeModal();
        } catch (error) {
            console.error('Error sending reply:', error);
            if (error.response?.data?.errors) {
                setReplyErrors(error.response.data.errors);
            } else {
                setReplyErrors({ general: [t("حدث خطأ أثناء إرسال الرد")] });
            }
        } finally {
            setSending(false);
        }
    };

    const openReplyModal = (ta) => {
        setCurrentTask(ta);
        setTaskText('');
        setTaskFile(null);
        setReplyErrors({});
        setTaskTextModal(true);
    };

    // Handle member completing task with confirmation
    const handleMemberComplete = (ta) => {
        setConfirmModal({
            isOpen: true,
            onConfirm: () => confirmCompleteTask(ta.id),
            title: t("تأكيد إكمال المهمة"),
            message: t(`هل أنت متأكد من إكمال المهمة "${ta.title}"؟`),
            confirmText: t("نعم، أكملت"),
            confirmColor: "bg-green-600 hover:bg-green-700",
            icon: "info",
            loading: false,
        });
    };

    const confirmCompleteTask = async (taskId) => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
            await handleTaskStatusChange(taskId, 'completed');
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            closeModal();
        } catch (error) {
            console.error('Error completing task:', error);
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {t("تفاصيل المهمة")}
                        </h3>
                        <button
                            onClick={closeModal}
                            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-auto max-h-[60vh]">
                        {task.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">{t("لا توجد مهام مسجلة")}</p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y overflow-auto divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    {t("المهمة")}
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    {t("رد العضو")}
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    {t("الملفات")}
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    {t("العضو")}
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    {t("الحالة")}
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    {t("الإجراءات")}
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {task.map((ta, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                            {ta.title}
                                                        </h4>
                                                    </td>

                                                    <td className="px-4 py-4 max-w-xs align-top">
                                                        {ta.task_text ? (
                                                            <button 
                                                                onClick={() => openDescriptionModal(ta.task_text)} 
                                                                className="px-3 py-1 flex gap-2 bg-primary text-white rounded hover:bg-primary-dark text-sm"
                                                            >
                                                                {t("رد العضو")}
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                {t("لم يتم ارسال رد")}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {ta.task_file ? (
                                                            <div className="flex gap-2">
                                                                <a
                                                                    href={`${app_url}/storage/${ta.task_file}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-xs"
                                                                    title={t("عرض الملف")}
                                                                >
                                                                    <EyeIcon className="w-3 h-3" />
                                                                    {t("عرض")}
                                                                </a>
                                                                <a
                                                                    href={`${app_url}/storage/${ta.task_file}`}
                                                                    download
                                                                    className="flex items-center gap-1 p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors text-xs"
                                                                    title={t("تحميل الملف")}
                                                                >
                                                                    <ArrowDownTrayIcon className="w-3 h-3" />
                                                                    {t("تحميل")}
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                {t("لا توجد ملفات")}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                            {ta.assignee?.name || t("غير محدد")}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ta.status)}`}>
                                                            {getStatusBadge(ta.status)}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        {/* للموظف العادي - أزرار إكمال وإرسال رد (حتى لو متأخرة) */}
                                                        {!canManage && ta.assigned_to === userId && ta.status !== 'completed' && (
                                                            <div className="flex flex-col gap-1 items-center">
                                                                <button
                                                                    onClick={() => openReplyModal(ta)}
                                                                    className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors w-full"
                                                                >
                                                                    {t("ارسال رد")}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMemberComplete(ta)}
                                                                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors w-full"
                                                                >
                                                                    {t("إكمال")}
                                                                </button>
                                                            </div>
                                                        )}
                                                        
                                                        {/* للموظف العادي - إذا كان مكتمل */}
                                                        {!canManage && ta.assigned_to === userId && ta.status === 'completed' && (
                                                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                                ✅ {t("مكتمل")}
                                                            </span>
                                                        )}
                                                        
                                                        {/* للموظف العادي - مهام ليست له */}
                                                        {!canManage && ta.assigned_to !== userId && (
                                                            <span className="text-xs text-gray-400">
                                                                {t("للإطلاع")}
                                                            </span>
                                                        )}

                                                        {/* للمدير أو مدير المهام */}
                                                        {canManage && (
                                                            <button
                                                                onClick={() => handleShowStatusEdit(ta)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {t("عدد الأعضاء")}: {task.length}
                            </span>
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                            >
                                {t("إغلاق")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Change Status Modal (for admin/manager) */}
                {showModel && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 flex flex-col justify-center items-center rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                {t("تغيير حالة المهمة")}
                            </h3>
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)} 
                                className="bg-primary px-8 dark:bg-primary-dark text-white rounded-md py-2 m-2 w-full"
                            >
                                <option value="pending">{t("معلقة")}</option>
                                <option value="in_progress">{t("جارية")}</option>
                                <option value="completed">{t("مكتمل")}</option>
                                <option value="overdue">{t("متأخرة")}</option>
                            </select>
                            <div className="flex gap-2 w-full mt-4">
                                <button
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => {
                                        handleTaskStatusChange(taskStatus.id, status);
                                        setShowModel(false);
                                        closeModal();
                                    }}
                                >
                                    {t("حفظ")}
                                </button>
                                <button
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => setShowModel(false)}
                                >
                                    {t("إلغاء")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Description Modal */}
                {modelDescription && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("رد العضو")}
                                </h3>
                                <button
                                    onClick={() => {
                                        setModelDescription(false);
                                        setDescription("");
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 max-w-md align-top">
                                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-normal break-words">
                                    {description}
                                </p>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={() => {
                                        setModelDescription(false);
                                        setDescription("");
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    {t("إغلاق")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reply Modal for members */}
                {taskTextModal && currentTask && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("ارسال رد على المهمة")}
                                </h3>
                                <button
                                    onClick={() => {
                                        setTaskTextModal(false);
                                        setCurrentTask(null);
                                        setTaskText('');
                                        setTaskFile(null);
                                        setReplyErrors({});
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {t("المهمة")}: <span className="font-semibold">{currentTask.title}</span>
                            </p>
                            
                            <textarea
                                value={taskText}
                                onChange={(e) => setTaskText(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder={t("اكتب ردك هنا...")}
                            />
                            
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t("إرفاق ملف")}
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setTaskFile(e.target.files[0])}
                                    className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white dark:bg-gray-600 dark:text-white"
                                />
                            </div>
                            
                            {replyErrors?.general && (
                                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
                                    {replyErrors.general[0]}
                                </div>
                            )}
                            
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        setTaskTextModal(false);
                                        setCurrentTask(null);
                                        setTaskText('');
                                        setTaskFile(null);
                                        setReplyErrors({});
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleSendReply}
                                    disabled={sending}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? t("جاري الإرسال...") : t("إرسال")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Modal for member completion */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                confirmColor={confirmModal.confirmColor}
                icon={confirmModal.icon}
                loading={confirmModal.loading}
            />
        </>
    );
}