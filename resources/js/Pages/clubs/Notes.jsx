import React, { useState, useEffect } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { PlusIcon, DocumentTextIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import NoteCard from "./components/notes/NoteCard";
import NoteForm from "./components/notes/NoteForm";
import NoteFilters from "./components/notes/NoteFilters";
import ConfirmModal from "./components/ConfirmModal";

export default function Notes() {
    const { app_url, auth, permissions } = usePage().props;
    const { t } = useTranslation();

    const [notes, setNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [showForm, setShowForm] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

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
    const canManageNotes = isAdmin || permission?.manage_notes;
    const canWrite = isAdmin || canManageNotes;

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${app_url}/notes`);
            setNotes(response.data.notes || []);
            setFilteredNotes(response.data.notes || []);
        } catch (error) {
            console.error(t("خطأ في جلب الملاحظات:"), error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    useEffect(() => {
        let filtered = [...notes];

        if (search.trim()) {
            const searchTerm = search.toLowerCase();
            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(searchTerm) ||
                note.content.toLowerCase().includes(searchTerm)
            );
        }

        filtered.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });

        setFilteredNotes(filtered);
        setCurrentPage(1);
    }, [search, notes]);

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentItems = filteredNotes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredNotes.length / rowsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            const listElement = document.querySelector('.space-y-3');
            if (listElement) {
                listElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => paginate(i)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        currentPage === i
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pageNumbers;
    };

    const handleAddNote = () => {
        setFormData({ title: "", content: "" });
        setFormErrors({});
        setIsEdit(false);
        setShowForm(true);
    };

    const handleEditNote = (note) => {
        setSelectedNote(note);
        setFormData({
            title: note.title || "",
            content: note.content || "",
        });
        setFormErrors({});
        setIsEdit(true);
        setShowForm(true);
    };

    const showConfirmDelete = (note) => {
        setConfirmModal({
            isOpen: true,
            onConfirm: () => handleDeleteConfirm(note),
            title: t("هل أنت متأكد من حذف هذه الملاحظة؟"),
            message: t(`سيتم حذف الملاحظة "${note.title}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.`),
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

    const handleDeleteConfirm = async (note) => {
        setConfirmModal(prev => ({ ...prev, loading: true, errorMessage: null }));
        try {
            await axios.delete(`${app_url}/notes/${note.id}`);
            closeConfirmModal();
            fetchNotes();
        } catch (error) {
            console.error(t("خطأ في حذف الملاحظة:"), error);
            let errorMessage = t("حدث خطأ أثناء حذف الملاحظة");
            
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

    const handleTogglePin = async (note) => {
        try {
            await axios.post(`${app_url}/notes/${note.id}/toggle-pin`);
            fetchNotes();
        } catch (error) {
            console.error(t("خطأ في تغيير حالة التثبيت:"), error);
        }
    };

    const handleSaveNote = async () => {
        setSaving(true);
        setFormErrors({});

        try {
            let response;
            if (isEdit && selectedNote) {
                response = await axios.put(`${app_url}/notes/${selectedNote.id}`, formData);
            } else {
                response = await axios.post(`${app_url}/notes`, formData);
            }

            if (response.data.success) {
                setShowForm(false);
                fetchNotes();
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            } else {
                console.error(t("خطأ في حفظ الملاحظة:"), error);
            }
        } finally {
            setSaving(false);
        }
    };

    const resetSearch = () => {
        setSearch("");
    };

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-primary" />
                        {t("الملاحظات")}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            ({filteredNotes.length})
                        </span>
                    </h3>
                    {canWrite && (
                        <button
                            onClick={handleAddNote}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 ml-1" />
                            {t("ملاحظة جديدة")}
                        </button>
                    )}
                </div>

                <NoteFilters
                    search={search}
                    setSearch={setSearch}
                    onReset={resetSearch}
                />

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="mr-3 text-gray-500 dark:text-gray-400 text-sm">
                            {t("جاري تحميل الملاحظات...")}
                        </span>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-base font-semibold">{t("لا توجد ملاحظات")}</p>
                        <p className="text-sm">{t("قم بإنشاء أول ملاحظة لك الآن")}</p>
                        {canWrite && (
                            <button
                                onClick={handleAddNote}
                                className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <PlusIcon className="h-4 w-4 ml-1" />
                                {t("ملاحظة جديدة")}
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {currentItems.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onEdit={handleEditNote}
                                    onDelete={showConfirmDelete}
                                    onTogglePin={handleTogglePin}
                                    isAdmin={isAdmin}
                                    canManage={canManageNotes}
                                />
                            ))}
                        </div>

                        {filteredNotes.length > 0 && (
                            <div className="mt-4 mb-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4 flex-wrap">
                                <span>
                                    {t("عرض:")} {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredNotes.length)} {t("من")} {filteredNotes.length}
                                </span>
                                {search && (
                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs">
                                        {t("نتائج البحث عن:")} {search}
                                    </span>
                                )}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                                    >
                                        <ChevronRightIcon className="h-4 w-4" />
                                        {t("السابق")}
                                    </button>
                                    
                                    <div className="flex items-center gap-1 mx-2">
                                        {renderPageNumbers()}
                                    </div>

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                                    >
                                        {t("التالي")}
                                        <ChevronLeftIcon className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("صفحة")} {currentPage} {t("من")} {totalPages}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <NoteForm
                        note={formData}
                        setNote={setFormData}
                        onSave={handleSaveNote}
                        onClose={() => setShowForm(false)}
                        loading={saving}
                        errors={formErrors}
                        isEdit={isEdit}
                    />
                </div>
            )}

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
        </AdminLayout>
    );
}