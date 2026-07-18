import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
    XMarkIcon, 
    PaperClipIcon, 
    UserCircleIcon, 
    CalendarIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    ClockIcon,
    PencilIcon,
    TrashIcon,
    ArrowUturnLeftIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import { usePage } from "@inertiajs/react";

export default function ReportDetails({ report, onClose, onReplyUpdated, isAdmin, canManage }) {
    const { t } = useTranslation();
    const { app_url, auth } = usePage().props;
    const currentMemberId = auth.user?.member?.id;
    
    const [replyText, setReplyText] = useState("");
    const [replyFiles, setReplyFiles] = useState([]);
    const [replyStatus, setReplyStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editReplyText, setEditReplyText] = useState("");
    const [editReplyFiles, setEditReplyFiles] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const [localReport, setLocalReport] = useState(report);

    useEffect(() => {
        setLocalReport(report);
    }, [report]);

    const refreshReport = async () => {
        try {
            const response = await axios.get(`${app_url}/reports/${localReport.id}`);
            if (response.data.success) {
                setLocalReport(response.data.report);
                if (onReplyUpdated) onReplyUpdated();
            }
        } catch (error) {
            console.error("Error refreshing report:", error);
        }
    };

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

    const canReply = () => {
        const isOwner = localReport.member_id === currentMemberId;
        const isAdminOrManager = isAdmin || canManage;
        
        if (isOwner) return false;
        
        if (isAdminOrManager) return true;
        
        if (localReport.replies && localReport.replies.length > 0) {
            return localReport.status !== 'draft';
        }
        
        return false;
    };

    const canEditReply = (reply) => {
        const isOwner = reply.member_id === currentMemberId;
        return isOwner;
    };

    const canDeleteReply = (reply) => {
        const isAdminOrManager = isAdmin || canManage;
        return isAdminOrManager;
    };

    const handleReplySubmit = async () => {
        if (!replyText.trim() && replyFiles.length === 0) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('reply', replyText);
            if (replyingTo) {
                formData.append('parent_id', replyingTo);
            }
            if ((isAdmin || canManage) && replyStatus) {
                formData.append('status', replyStatus);
            }
            replyFiles.forEach((file) => {
                formData.append('files[]', file);
            });

            const response = await axios.post(
                `${app_url}/reports/${localReport.id}/reply`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.success) {
                setReplyText("");
                setReplyFiles([]);
                setReplyStatus("");
                setReplyingTo(null);
                await refreshReport();
            }
        } catch (error) {
            console.error("Error submitting reply:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (status) => {
        if (localReport.status === status) return;
        
        if (localReport.member_id === currentMemberId) {
            alert(t("لا يمكنك تغيير حالة تقريرك الخاص"));
            return;
        }
        
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('status', status);
            formData.append('reply', '');

            const response = await axios.post(
                `${app_url}/reports/${localReport.id}/reply`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.success) {
                await refreshReport();
            }
        } catch (error) {
            console.error("Error changing status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditReply = async (replyId) => {
        if (!editReplyText.trim() && editReplyFiles.length === 0) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('reply', editReplyText);
            formData.append('_method', 'PUT');

            editReplyFiles.forEach((file) => {
                formData.append('files[]', file);
            });

            const response = await axios.post(
                `${app_url}/replies/${replyId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.success) {
                setEditingReplyId(null);
                setEditReplyText("");
                setEditReplyFiles([]);
                await refreshReport();
            }
        } catch (error) {
            console.error("Error updating reply:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (!window.confirm(t('هل أنت متأكد من حذف هذا الرد؟'))) return;

        try {
            const response = await axios.delete(`${app_url}/replies/${replyId}`);
            if (response.data.success) {
                await refreshReport();
            }
        } catch (error) {
            console.error("Error deleting reply:", error);
        }
    };

    const handleReplyFileUpload = (e, isEdit = false) => {
        const files = Array.from(e.target.files);
        if (isEdit) {
            setEditReplyFiles([...editReplyFiles, ...files]);
        } else {
            setReplyFiles([...replyFiles, ...files]);
        }
    };

    const removeReplyFile = (index, isEdit = false) => {
        if (isEdit) {
            setEditReplyFiles(editReplyFiles.filter((_, i) => i !== index));
        } else {
            setReplyFiles(replyFiles.filter((_, i) => i !== index));
        }
    };

    const startEditingReply = (reply) => {
        setEditingReplyId(reply.id);
        setEditReplyText(reply.reply);
        setEditReplyFiles([]);
    };

    const cancelEditingReply = () => {
        setEditingReplyId(null);
        setEditReplyText("");
        setEditReplyFiles([]);
    };

    const startReplyingTo = (replyId) => {
        setReplyingTo(replyingTo === replyId ? null : replyId);
        setReplyText("");
        setReplyFiles([]);
    };

    const renderReply = (reply, depth = 0) => {
        const maxDepth = 5;
        if (depth > maxDepth) return null;

        return (
            <div key={reply.id} className={`border-r-4 ${depth === 0 ? 'border-primary' : 'border-gray-300'} pr-3 mr-3`}>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {reply.member?.name || t("غير معروف")}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(reply.created_at).toLocaleString('ar-EG')}
                                </span>
                                {reply.is_edited && (
                                    <span className="text-xs text-gray-400">({t("معدل")})</span>
                                )}
                                {reply.status && getStatusBadge(reply.status)}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {canEditReply(reply) && (
                                <button
                                    onClick={() => startEditingReply(reply)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title={t("تعديل")}
                                >
                                    <PencilIcon className="h-3.5 w-3.5" />
                                </button>
                            )}
                            {canDeleteReply(reply) && (
                                <button
                                    onClick={() => handleDeleteReply(reply.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                    title={t("حذف")}
                                >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                            )}
                            {canReply() && (
                                <button
                                    onClick={() => startReplyingTo(reply.id)}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                                    title={t("رد")}
                                >
                                    <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {editingReplyId === reply.id ? (
                        <div className="mt-2 space-y-2">
                            <textarea
                                value={editReplyText}
                                onChange={(e) => setEditReplyText(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => handleReplyFileUpload(e, true)}
                                    className="hidden"
                                    id={`edit-reply-files-${reply.id}`}
                                />
                                <label
                                    htmlFor={`edit-reply-files-${reply.id}`}
                                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300"
                                >
                                    <PaperClipIcon className="h-3 w-3 inline ml-1" />
                                    {t("إضافة ملفات")}
                                </label>
                                {editReplyFiles.map((file, idx) => (
                                    <span key={idx} className="text-xs flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
                                        {file.name}
                                        <button onClick={() => removeReplyFile(idx, true)} className="text-red-500">×</button>
                                    </span>
                                ))}
                                <button
                                    onClick={() => handleEditReply(reply.id)}
                                    disabled={loading}
                                    className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    {t("حفظ")}
                                </button>
                                <button
                                    onClick={cancelEditingReply}
                                    className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    {t("إلغاء")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {reply.reply}
                            </p>
                            {reply.files && reply.files.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {reply.files.map((file) => (
                                        <a
                                            key={file.id}
                                            href={`${app_url}/storage/${file.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                                        >
                                            <PaperClipIcon className="h-3 w-3" />
                                            {file.file_name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {replyingTo === reply.id && (
                        <div className="mt-3 border-t border-gray-200 pt-3">
                            <p className="text-xs text-gray-500 mb-2">
                                {t("الرد على:")} {reply.member?.name}
                            </p>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                                placeholder={t("اكتب ردك هنا...")}
                            />
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => handleReplyFileUpload(e, false)}
                                    className="hidden"
                                    id="reply-files"
                                />
                                <label
                                    htmlFor="reply-files"
                                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300"
                                >
                                    <PaperClipIcon className="h-3 w-3 inline ml-1" />
                                    {t("إضافة ملفات")}
                                </label>
                                {replyFiles.map((file, index) => (
                                    <span key={index} className="text-xs flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
                                        {file.name}
                                        <button onClick={() => removeReplyFile(index)} className="text-red-500">×</button>
                                    </span>
                                ))}
                                <button
                                    onClick={handleReplySubmit}
                                    disabled={loading || (!replyText.trim() && replyFiles.length === 0)}
                                    className="px-4 py-1 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {t("إرسال")}
                                </button>
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    {t("إلغاء")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {reply.children && reply.children.length > 0 && (
                    <div className="space-y-2">
                        {reply.children.map((child) => renderReply(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                        {t("تفاصيل التقرير")}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <div className="flex items-start justify-between">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {localReport.title}
                            </h4>
                            {getStatusBadge(localReport.status)}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <UserCircleIcon className="h-3.5 w-3.5" />
                                {localReport.member?.name || t("غير معروف")}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                {new Date(localReport.created_at).toLocaleDateString('ar-EG')}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                {t("النوع:")} {getTypeLabel(localReport.type)}
                            </span>
                        </div>
                    </div>

                    {(localReport.period_start || localReport.period_end) && (
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">{t("الفترة:")}</span>
                                {localReport.period_start && new Date(localReport.period_start).toLocaleDateString('ar-EG')}
                                {localReport.period_start && localReport.period_end && " - "}
                                {localReport.period_end && new Date(localReport.period_end).toLocaleDateString('ar-EG')}
                            </p>
                        </div>
                    )}

                    <div>
                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            {t("المحتوى")}
                        </h5>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-40 overflow-y-auto">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {localReport.content}
                            </p>
                        </div>
                    </div>

                    {localReport.files && localReport.files.length > 0 && (
                        <div>
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                {t("الملفات المرفقة")} ({localReport.files.length})
                            </h5>
                            <div className="space-y-1.5">
                                {localReport.files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center gap-1.5">
                                            <PaperClipIcon className="h-3.5 w-3.5 text-gray-500" />
                                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                                                {file.file_name}
                                            </span>
                                        </div>
                                        <a href={`${app_url}/storage/${file.file_path}`} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <EyeIcon className="h-3.5 w-3.5" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(isAdmin || canManage) && localReport.member_id !== currentMemberId && (
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <button
                                onClick={() => handleStatusChange('approved')}
                                disabled={loading || localReport.status === 'approved'}
                                className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-1.5 disabled:opacity-50 ${
                                    localReport.status === 'approved' 
                                        ? 'bg-green-100 text-green-700 cursor-default' 
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                <CheckCircleIcon className="h-4 w-4" />
                                {localReport.status === 'approved' ? t("مقبول ✓") : t("قبول")}
                            </button>
                            <button
                                onClick={() => handleStatusChange('rejected')}
                                disabled={loading || localReport.status === 'rejected'}
                                className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-1.5 disabled:opacity-50 ${
                                    localReport.status === 'rejected' 
                                        ? 'bg-red-100 text-red-700 cursor-default' 
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                            >
                                <XCircleIcon className="h-4 w-4" />
                                {localReport.status === 'rejected' ? t("مرفوض ✗") : t("رفض")}
                            </button>
                            <button
                                onClick={() => handleStatusChange('under_review')}
                                disabled={loading || localReport.status === 'under_review'}
                                className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-1.5 disabled:opacity-50 ${
                                    localReport.status === 'under_review' 
                                        ? 'bg-yellow-100 text-yellow-700 cursor-default' 
                                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                                }`}
                            >
                                <ClockIcon className="h-4 w-4" />
                                {localReport.status === 'under_review' ? t("تحت المراجعة ⟳") : t("تحت المراجعة")}
                            </button>
                        </div>
                    )}

                    <div>
                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {t("الردود")} ({localReport.replies?.length || 0})
                        </h5>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {localReport.replies && localReport.replies
                                .filter(r => !r.parent_id)
                                .map((reply) => renderReply(reply, 0))}
                            
                            {(!localReport.replies || localReport.replies.length === 0) && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    {t("لا توجد ردود حتى الآن")}
                                </p>
                            )}
                        </div>
                    </div>

                    {canReply() && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                {(isAdmin || canManage) ? t("رد جديد") : t("الرد على الإدارة")}
                            </h5>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                                placeholder={t("اكتب ردك هنا...")}
                            />
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {(isAdmin || canManage) && (
                                    <select
                                        value={replyStatus}
                                        onChange={(e) => setReplyStatus(e.target.value)}
                                        className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                                    >
                                        <option value="">{t("بدون تغيير")}</option>
                                        <option value="approved">{t("قبول")}</option>
                                        <option value="rejected">{t("رفض")}</option>
                                        <option value="under_review">{t("تحت المراجعة")}</option>
                                    </select>
                                )}
                                <input type="file" multiple onChange={(e) => handleReplyFileUpload(e, false)} className="hidden" id="reply-files-main" />
                                <label htmlFor="reply-files-main" className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300">
                                    <PaperClipIcon className="h-3 w-3 inline ml-1" />
                                    {t("ملفات")}
                                </label>
                                {replyFiles.map((file, index) => (
                                    <span key={index} className="text-xs flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
                                        {file.name}
                                        <button onClick={() => removeReplyFile(index)} className="text-red-500">×</button>
                                    </span>
                                ))}
                                <button
                                    onClick={handleReplySubmit}
                                    disabled={loading || (!replyText.trim() && replyFiles.length === 0)}
                                    className="px-4 py-1 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {loading ? t("جاري الإرسال...") : t("إرسال")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        {t("إغلاق")}
                    </button>
                </div>
            </div>
        </div>
    );
}