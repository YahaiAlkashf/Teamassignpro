// components/members/MemberDetailsModal.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    XMarkIcon,
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    IdentificationIcon,
    BuildingOfficeIcon,
    StarIcon,
    CheckBadgeIcon,
    CalendarIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import ConfirmModal from "../ConfirmModal"; // استيراد موديل التأكيد

export default function MemberDetailsModal({ member, onClose, onNoteUpdated }) {
    const { t } = useTranslation();
    const { app_url, auth } = usePage().props;
    const [memberData, setMemberData] = useState(member);
    const [noteContent, setNoteContent] = useState("");
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);
    
    // حالة موديل التأكيد
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const canManageMembers = auth.user?.role === 'admin' || auth.user?.member?.permission?.manage_members;
    const isAdminUser = member?.role === 'admin';

    useEffect(() => {
        if (member?.id) {
            fetchMemberNotes();
        }
    }, [member?.id]);

    const fetchMemberNotes = async () => {
        setIsLoadingNotes(true);
        try {
            const response = await axios.get(`${app_url}/member-notes/${member.id}`);
            console.log("Notes response:", response.data);
            if (response.data.success) {
                const notes = response.data.notes || [];
                setMemberData(prev => ({
                    ...prev,
                    note: notes.length > 0 ? notes[0] : null
                }));
                if (notes.length > 0) {
                    setNoteContent(notes[0].note);
                } else {
                    setNoteContent("");
                }
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
            setMemberData(prev => ({ ...prev, note: null }));
        } finally {
            setIsLoadingNotes(false);
        }
    };

    const handleAddNote = async () => {
        if (!noteContent.trim()) {
            setError(t("يرجى كتابة الملاحظة"));
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await axios.post(`${app_url}/member-notes`, {
                member_id: member.id,
                note: noteContent,
            });
            console.log("Add note response:", response.data);
            if (response.data.success) {
                setIsEditingNote(false);
                await fetchMemberNotes();
                if (onNoteUpdated) onNoteUpdated();
                setNoteContent("");
            }
        } catch (error) {
            console.error("Error adding note:", error);
            setError(error.response?.data?.message || t("حدث خطأ أثناء إضافة الملاحظة"));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateNote = async () => {
        if (!noteContent.trim()) {
            setError(t("يرجى كتابة الملاحظة"));
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await axios.put(`${app_url}/member-notes/${memberData.note.id}`, {
                note: noteContent,
            });
            console.log("Update note response:", response.data);
            if (response.data.success) {
                setIsEditingNote(false);
                await fetchMemberNotes();
                if (onNoteUpdated) onNoteUpdated();
            }
        } catch (error) {
            console.error("Error updating note:", error);
            setError(error.response?.data?.message || t("حدث خطأ أثناء تحديث الملاحظة"));
        } finally {
            setLoading(false);
        }
    };

    // دالة فتح موديل التأكيد
    const handleDeleteClick = () => {
        setShowConfirmModal(true);
    };

    // دالة تأكيد الحذف
    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await axios.delete(`${app_url}/member-notes/${memberData.note.id}`);
            console.log("Delete note response:", response.data);
            if (response.data.success) {
                setMemberData(prev => ({ ...prev, note: null }));
                setNoteContent("");
                setIsEditingNote(false);
                setShowConfirmModal(false);
                if (onNoteUpdated) onNoteUpdated();
            }
        } catch (error) {
            console.error("Error deleting note:", error);
            setError(error.response?.data?.message || t("حدث خطأ أثناء حذف الملاحظة"));
        } finally {
            setIsDeleting(false);
        }
    };

    // دالة إلغاء الحذف
    const handleCancelDelete = () => {
        setShowConfirmModal(false);
    };

    const renderRatingStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <StarIcon
                    key={i}
                    className={`h-5 w-5 ${i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
            );
        }
        return <div className="flex">{stars}</div>;
    };

    if (!memberData) return null;

    // التحقق من وجود ملاحظة
    const hasNote = memberData.note !== null && memberData.note !== undefined;

    // حالة التحميل
    if (isLoadingNotes) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {t("تفاصيل العضو")}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {t("تفاصيل العضو")}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Profile Header */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {memberData.image ? (
                                    <img
                                        src={`${app_url}/storage/${memberData.image}`}
                                        alt={memberData.name}
                                        className="h-20 w-20 rounded-full object-cover border-4 border-primary/20"
                                    />
                                ) : (
                                    <UserCircleIcon className="h-20 w-20 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                    {memberData.name}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {memberData.jop_title || t("لا يوجد مسمى وظيفي")}
                                </p>
                                <div className="flex items-center mt-1">
                                    {renderRatingStars(memberData.rating)}
                                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                                        ({memberData.rating})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <EnvelopeIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("البريد الإلكتروني")}</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{memberData.user?.email || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <PhoneIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("رقم الهاتف")}</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{memberData.phone || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <IdentificationIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("الرقم التعريفي")}</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{memberData.member_id || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <BuildingOfficeIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("القسم")}</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{memberData.cycle?.name || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <CheckBadgeIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("الدور")}</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {memberData.role === 'admin' ? t('مدير') : t('عضو')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("تاريخ الانضمام")}</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {memberData.created_at ? new Date(memberData.created_at).toLocaleDateString('ar-EG') : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {memberData.attended_events_count || 0}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{t("الأحداث الحاضرة")}</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {memberData.completed_tasks_count || 0}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{t("المهام المكتملة")}</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {memberData.total_score || 0}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{t("المجموع الكلي")}</p>
                            </div>
                        </div>

                        {/* Permissions */}
                        {memberData.permission && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {t("الصلاحيات")}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {memberData.permission.manage_members && (
                                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">👥 {t("إدارة الأعضاء")}</span>
                                    )}
                                    {memberData.permission.add_tasks && (
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">📋 {t("إضافة مهام")}</span>
                                    )}
                                    {memberData.permission.add_events && (
                                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">📅 {t("إضافة فعاليات")}</span>
                                    )}
                                    {memberData.permission.add_library && (
                                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">📚 {t("إضافة للمكتبة")}</span>
                                    )}
                                    {memberData.permission.add_advertisement && (
                                        <span className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full">📢 {t("إدارة الإعلانات")}</span>
                                    )}
                                    {memberData.permission.manage_reports && (
                                        <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">📊 {t("إدارة التقارير")}</span>
                                    )}
                                    {memberData.permission.manage_notes && (
                                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">📝 {t("إدارة الملاحظات")}</span>
                                    )}
                                    {memberData.permission.manage_leaderboard && (
                                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">🏆 {t("لوحة الشرف")}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Note Section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <DocumentTextIcon className="h-5 w-5 text-primary" />
                                    {t("ملاحظة")}
                                </h4>
                            </div>

                            {hasNote ? (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-r-4 border-primary">
                                    {isEditingNote ? (
                                        <div>
                                            <textarea
                                                value={noteContent}
                                                onChange={(e) => setNoteContent(e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder={t("اكتب الملاحظة هنا...")}
                                                disabled={loading}
                                            />
                                            {error && (
                                                <p className="text-red-500 text-sm mt-1">{error}</p>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={handleAddNote}
                                                    disabled={loading || !noteContent.trim()}
                                                    className="px-4 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                                                >
                                                    {loading ? t("جاري الحفظ...") : t("حفظ")}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingNote(false);
                                                        setNoteContent("");
                                                        setError("");
                                                    }}
                                                    className="px-4 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                >
                                                    {t("إلغاء")}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                    {memberData.note.note}
                                                </p>
                                                {canManageMembers && !isAdminUser && (
                                                    <div className="flex gap-1 flex-shrink-0 mr-2">
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingNote(true);
                                                                setNoteContent(memberData.note.note);
                                                                setError("");
                                                            }}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title={t("تعديل")}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={handleDeleteClick} // استدعاء دالة فتح الموديل
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title={t("حذف")}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {t("بواسطة")}: {memberData.note.created_by?.name || t("غير معروف")}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(memberData.note.created_at).toLocaleString('ar-EG')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                    {t("لا توجد ملاحظات")}
                                </p>
                            )}
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

            {/* موديل تأكيد الحذف */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t("تأكيد الحذف")}
                message={t("هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.")}
                confirmText={t("حذف")}
                cancelText={t("إلغاء")}
                confirmColor="bg-red-600 hover:bg-red-700"
                icon="danger"
                loading={isDeleting}
            />
        </>
    );
}