import React, { useState, useEffect } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    MegaphoneIcon
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import ConfirmModal from "./components/ConfirmModal";

export default function Announcements() {
    const { app_url, auth, permissions } = usePage().props;
    const { t } = useTranslation();
    const [announcement, setAnnouncement] = useState("");
    const [currentAnnouncement, setCurrentAnnouncement] = useState("");
    const [editAnnouncementMode, setEditAnnouncementMode] = useState(false);
    const [deleteAnnouncementMode, setDeleteAnnouncementMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: null,
        title: '',
        message: '',
        confirmText: 'حذف',
        confirmColor: 'bg-red-600 hover:bg-red-700',
        icon: 'warning',
        loading: false,
        errorMessage: null,
    });

    const permission = permissions?.permissions;
    const isAdmin = auth.user?.role === 'admin';
    const canManage = isAdmin || permission?.add_advertisement;

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const response = await axios.get(`${app_url}/announcement`);
            setCurrentAnnouncement(response.data.announcement || "");
        } catch (error) {
            console.error(t("خطأ في جلب الإعلان:"), error);
        }
    };

    const handleSaveAnnouncement = async () => {
        if (!announcement.trim()) return;
        
        setLoading(true);
        try {
            await axios.post(`${app_url}/announcement`, {
                content: announcement
            });
            setCurrentAnnouncement(announcement);
            setAnnouncement("");
            setEditAnnouncementMode(false);
            await fetchAnnouncement();
        } catch (error) {
            console.error(t("خطأ في حفظ الإعلان:"), error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditAnnouncement = () => {
        setAnnouncement(currentAnnouncement);
        setEditAnnouncementMode(true);
    };

    const showConfirmDelete = () => {
        setConfirmModal({
            isOpen: true,
            onConfirm: handleDeleteAnnouncement,
            title: t("هل أنت متأكد من حذف هذا الإعلان؟"),
            message: t("سيتم حذف الإعلان نهائياً ولا يمكن استعادته."),
            confirmText: t("حذف"),
            confirmColor: "bg-red-600 hover:bg-red-700",
            icon: "warning",
            loading: false,
            errorMessage: null,
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false, errorMessage: null }));
    };

    const handleDeleteAnnouncement = async () => {
        setConfirmModal(prev => ({ ...prev, loading: true, errorMessage: null }));
        try {
            await axios.delete(`${app_url}/announcement`);
            setCurrentAnnouncement("");
            closeConfirmModal();
            await fetchAnnouncement();
        } catch (error) {
            console.error(t("خطأ في حذف الإعلان:"), error);
            let errorMessage = t("حدث خطأ أثناء حذف الإعلان");
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join('\n');
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setConfirmModal(prev => ({ 
                ...prev, 
                loading: false,
                errorMessage: errorMessage
            }));
        }
    };

    const closeModal = () => {
        setDeleteAnnouncementMode(false);
    };

    const cancelEdit = () => {
        setEditAnnouncementMode(false);
        setAnnouncement("");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <MegaphoneIcon className="h-8 w-8 text-primary" />
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            {t("لوحة الإعلانات")}
                        </h3>
                    </div>
                    {canManage && !currentAnnouncement && !editAnnouncementMode && (
                        <button
                            onClick={() => {
                                setAnnouncement("");
                                setEditAnnouncementMode(true);
                            }}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 ml-1.5" />
                            {t("إعلان جديد")}
                        </button>
                    )}
                </div>

                {canManage && editAnnouncementMode ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                        <div className="flex items-start mb-3">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 ml-2 flex-shrink-0" />
                            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                {t("هذا الإعلان سيكون ظاهراً لجميع أعضاء الشركة")}
                            </p>
                        </div>
                        <textarea
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            placeholder={t("اكتب إعلانك هنا...")}
                        ></textarea>
                        <div className="flex gap-3 mt-3">
                            <button
                                onClick={cancelEdit}
                                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                            >
                                {t("إلغاء")}
                            </button>
                            <button
                                onClick={handleSaveAnnouncement}
                                disabled={loading || !announcement.trim()}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center"
                            >
                                {loading ? (
                                    <span>{t("جاري الحفظ...")}</span>
                                ) : (
                                    <span>{t("حفظ الإعلان")}</span>
                                )}
                            </button>
                        </div>
                    </div>
                ) : null}

                {currentAnnouncement ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg">📢</span>
                                    <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                                        {t("إعلان هام")}
                                    </h4>
                                    <span className="text-xs text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/50 px-2 py-0.5 rounded-full">
                                        {formatDate(new Date())}
                                    </span>
                                </div>
                                <p className="text-blue-700 dark:text-blue-300 whitespace-pre-wrap text-sm leading-relaxed">
                                    {currentAnnouncement}
                                </p>
                            </div>
                            {canManage && (
                                <div className="flex gap-1 flex-shrink-0 mr-2">
                                    <button
                                        onClick={handleEditAnnouncement}
                                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                        title={t("تعديل الإعلان")}
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={showConfirmDelete}
                                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                                        title={t("حذف الإعلان")}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : canManage ? (
                    <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all mb-6"
                        onClick={() => {
                            setAnnouncement("");
                            setEditAnnouncementMode(true);
                        }}
                    >
                        <MegaphoneIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 mb-1">
                            {t("لا يوجد إعلان حالياً")}
                        </p>
                        <p className="text-primary font-medium">
                            {t("انقر هنا لإضافة إعلان جديد")}
                        </p>
                    </div>
                ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center mb-6">
                        <MegaphoneIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {t("لا توجد إعلانات حالياً")}
                        </p>
                    </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <MegaphoneIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {t("هذه الصفحة مخصصة لعرض الإعلانات المهمة من الإدارة")}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {canManage ? t("لديك صلاحية إدارة الإعلانات") : t("يمكنك مشاهدة الإعلانات فقط")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
                errorMessage={confirmModal.errorMessage}
            />

            <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s cubic-bezier(0.4,0,0.2,1) both;
                }
            `}</style>
        </AdminLayout>
    );
}