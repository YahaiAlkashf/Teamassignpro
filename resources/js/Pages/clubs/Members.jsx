// pages/admin/Members.jsx
import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    PlusIcon,
    AdjustmentsHorizontalIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

import MemberTableRow from "./components/members/MemberTableRow";
import MemberDetailsModal from "./components/members/MemberDetailsModal";
import MemberModal from "./components/members/MemberModal";
import PermissionsModal from "./components/members/PermissionsModal";
import AddNoteModal from "./components/members/AddNoteModal";
import ConfirmModal from "./components/ConfirmModal";

export default function Members() {
    const { app_url, auth ,permissions} = usePage().props;
    const { t } = useTranslation();
    
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Modal states
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [detailsModal, setDetailsModal] = useState(false);
    const [permissionsModal, setPermissionsModal] = useState(false);
    const [noteModal, setNoteModal] = useState(false);
    const [rolesModal, setRolesModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [errors, setErrors] = useState({});

    // Cycles states
    const [cycles, setCycles] = useState([]);
    const [newCycle, setNewCycle] = useState("");
    const [editingCycle, setEditingCycle] = useState(null);

    // Confirm Modal states
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: null,
        title: '',
        message: '',
        confirmText: 'حذف',
        confirmColor: 'bg-red-600 hover:bg-red-700',
        icon: 'danger',
        loading: false,
        errorMessage: null, 
    });

    // Member form state
    const [memberForm, setMemberForm] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        cycle_id: "",
        member_id: "",
        jop_title: "",
        rating: 0,
        manage_members: 0,
        add_tasks: 0,
        add_events: 0,
        add_library: 0,
        add_advertisement: 0,
        manage_reports: 0,
        manage_notes: 0,
        manage_leaderboard: 0,
    });
    const permission = permissions?.permissions;
    const canManageMembers = auth.user?.role === 'admin' || permission?.manage_members;

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${app_url}/members-with-details`);
            setMembers(response.data.members || []);
            setFilteredMembers(response.data.members || []);
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCycles = async () => {
        try {
            const response = await axios.get(`${app_url}/cycles`);
            setCycles(response.data.cycles || []);
        } catch (error) {
            console.error("Error fetching cycles:", error);
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchCycles();
    }, []);

    useEffect(() => {
        let filtered = members.filter((member) => {
            const searchTerm = search.toLowerCase();
            return (
                member.name?.toLowerCase().includes(searchTerm) ||
                member.user?.email?.toLowerCase().includes(searchTerm) ||
                member.phone?.includes(search) ||
                member.member_id?.toString().includes(search) ||
                member.jop_title?.toLowerCase().includes(searchTerm)
            );
        });
        setFilteredMembers(filtered);
        setCurrentPage(1);
    }, [search, members]);

    const indexOfLastMember = currentPage * rowsPerPage;
    const indexOfFirstMember = indexOfLastMember - rowsPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
    const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);

    
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            const tableElement = document.querySelector('.overflow-x-auto');
            if (tableElement) {
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const handleAddMember = () => {
        setMemberForm({
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            phone: "",
            cycle_id: "",
            member_id: "",
            jop_title: "",
            rating: 0,
            manage_members: 0,
            add_tasks: 0,
            add_events: 0,
            add_library: 0,
            add_advertisement: 0,
            manage_reports: 0,
            manage_notes: 0,
            manage_leaderboard: 0,
        });
        setAddModal(true);
    };

    const handleEditMember = (member) => {
        setSelectedMember(member);
        setMemberForm({
            name: member.name || "",
            email: member.user?.email || "",
            password: "",
            password_confirmation: "",
            phone: member.phone || "",
            cycle_id: member.cycle_id || "",
            member_id: member.member_id || "",
            jop_title: member.jop_title || "",
            rating: member.rating || 0,
            manage_members: member.permission?.manage_members ? 1 : 0,
            add_tasks: member.permission?.add_tasks ? 1 : 0,
            add_events: member.permission?.add_events ? 1 : 0,
            add_library: member.permission?.add_library ? 1 : 0,
            add_advertisement: member.permission?.add_advertisement ? 1 : 0,
            manage_reports: member.permission?.manage_reports ? 1 : 0,
            manage_notes: member.permission?.manage_notes ? 1 : 0,
            manage_leaderboard: member.permission?.manage_leaderboard ? 1 : 0,
        });
        setEditModal(true);
    };

    const handleDeleteMember = (member) => {
        setSelectedMember(member);
        showConfirmDelete(member);
    };

    const handleViewDetails = (member) => {
        setSelectedMember(member);
        setDetailsModal(true);
    };

    const handleViewPermissions = (member) => {
        setSelectedMember(member);
        setPermissionsModal(true);
    };

    const handleAddNote = (member) => {
        setSelectedMember(member);
        setNoteModal(true);
    };

    const handleManageRoles = () => {
        setRolesModal(true);
    };

    const handleAddCycle = async () => {
        if (!newCycle.trim()) return;
        try {
            await axios.post(`${app_url}/cycles`, { name: newCycle });
            setNewCycle("");
            fetchCycles();
        } catch (error) {
            console.error("Error adding cycle:", error);
        }
    };

    const handleSaveEditCycle = async () => {
        if (!editingCycle.name.trim()) return;
        try {
            await axios.put(`${app_url}/cycles/${editingCycle.id}`, {
                name: editingCycle.name,
            });
            fetchCycles();
            setEditingCycle(null);
        } catch (error) {
            console.error("Error editing cycle:", error);
        }
    };


    const handleDeleteCycle = (cycle) => {
        setConfirmModal({
            isOpen: true,
            onConfirm: () => handleDeleteCycleConfirm(cycle.id),
            title: t("تأكيد حذف القسم"),
            message: t(`هل أنت متأكد من حذف القسم "${cycle.name}"؟ سيتم حذف جميع البيانات المرتبطة بهذا القسم. هذا الإجراء لا يمكن التراجع عنه.`),
            confirmText: t("حذف"),
            confirmColor: "bg-red-600 hover:bg-red-700",
            icon: "danger",
            loading: false,
            errorMessage: null, 
        });
    };

    const handleDeleteCycleConfirm = async (cycleId) => {
        setConfirmModal(prev => ({ ...prev, loading: true, errorMessage: null }));
        try {
            await axios.delete(`${app_url}/cycles/${cycleId}`);
            setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
            fetchCycles();
        } catch (error) {
            console.error("Error deleting cycle:", error);
            let errorMessage = t("حدث خطأ أثناء حذف القسم");
            
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
        setAddModal(false);
        setEditModal(false);
        setDeleteModal(false);
        setDetailsModal(false);
        setPermissionsModal(false);
        setNoteModal(false);
        setRolesModal(false);
        setSelectedMember(null);
        setErrors({});
        setMemberForm({
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            phone: "",
            cycle_id: "",
            member_id: "",
            jop_title: "",
            rating: 0,
            manage_members: 0,
            add_tasks: 0,
            add_events: 0,
            add_library: 0,
            add_advertisement: 0,
            manage_reports: 0,
            manage_notes: 0,
            manage_leaderboard: 0,
        });
    };

    const showConfirmDelete = (member) => {
        setConfirmModal({
            isOpen: true,
            onConfirm: () => handleDeleteConfirm(member.id),
            title: t("هل أنت متأكد من حذف هذا العضو؟"),
            message: `سيتم حذف العضو "${member.name}" وجميع بياناته نهائياً. هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: t("حذف"),
            confirmColor: "bg-red-600 hover:bg-red-700",
            icon: "danger",
            loading: false,
            errorMessage: null,
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false, errorMessage: null }));
    };

    const handleDeleteConfirm = async (memberId) => {
        setConfirmModal(prev => ({ ...prev, loading: true, errorMessage: null }));
        try {
            await axios.delete(`${app_url}/members/${memberId}`);
            closeConfirmModal();
            closeModal();
            fetchMembers();
        } catch (error) {
            console.error("Error deleting member:", error);
            let errorMessage = t("حدث خطأ أثناء حذف العضو");
            
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

    const handleSaveAddMember = async () => {
        try {
            await axios.post(`${app_url}/members`, memberForm);
            closeModal();
            fetchMembers();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleSaveEditMember = async () => {
        try {
            await axios.post(`${app_url}/members/${selectedMember.id}`, memberForm);
            closeModal();
            fetchMembers();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleSaveNote = async (memberId, note) => {
        try {
            await axios.post(`${app_url}/member-notes`, {
                member_id: memberId,
                note: note,
            });
            fetchMembers();
        } catch (error) {
            console.error("Error saving note:", error);
            throw new Error(error.response?.data?.message || "حدث خطأ");
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await axios.get(`${app_url}/members/export-excel`, {
                params: { search },
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `أعضاء_${new Date().toISOString().split("T")[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting Excel:", error);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }
    if(!canManageMembers){
        return
    }
    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {t("إدارة الأعضاء")}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                            ({filteredMembers.length})
                        </span>
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={handleExportExcel}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 ml-1" />
                            {t("Excel")}
                        </button>
                        <button
                            onClick={handleManageRoles}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <AdjustmentsHorizontalIcon className="h-4 w-4 ml-1" />
                            {t("إدارة الأقسام")}
                        </button>
                        {canManageMembers && (
                            <button
                                onClick={handleAddMember}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <PlusIcon className="h-4 w-4 ml-1" />
                                {t("إضافة عضو")}
                            </button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 mb-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("بحث عن عضو...")}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* معلومات العرض */}
                {filteredMembers.length > 0 && (
                    <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>
                            {t("عرض:")} {indexOfFirstMember + 1} - {Math.min(indexOfLastMember, filteredMembers.length)} {t("من")} {filteredMembers.length}
                        </span>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">#</th>
                                <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الصورة")}</th>
                                <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الاسم")}</th>
                                <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("التقييم")}</th>
                                <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الصلاحيات")}</th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الإجراءات")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {currentMembers.map((member, idx) => (
                                <MemberTableRow
                                    key={member.id}
                                    member={member}
                                    canManageMembers={canManageMembers}
                                    index={idx + 1 + (currentPage - 1) * rowsPerPage}
                                    onEdit={handleEditMember}
                                    onDelete={handleDeleteMember}
                                    onViewDetails={handleViewDetails}
                                    onAddNote={handleAddNote}
                                    onViewPermissions={handleViewPermissions}
                                />
                            ))}
                        </tbody>
                    </table>

                    {currentMembers.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {t("لا توجد أعضاء لعرضها")}
                        </div>
                    )}
                </div>

                {/* Pagination */}
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
            </div>

            {/* Roles Modal */}
            {rolesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {t("إدارة الأقسام")}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t("إضافة قسم جديد")}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCycle}
                                        onChange={(e) => setNewCycle(e.target.value)}
                                        placeholder={t("أدخل اسم القسم")}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                                    />
                                    <button
                                        onClick={handleAddCycle}
                                        className="px-4 py-2 bg-primary text-white rounded-lg"
                                    >
                                        {t("إضافة")}
                                    </button>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
                                    {t("الأقسام الحالية")}
                                </h4>
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                                    {cycles.map((cycle) => (
                                        <li key={cycle.id} className="py-3 flex items-center justify-between">
                                            {editingCycle?.id === cycle.id ? (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <input
                                                        type="text"
                                                        value={editingCycle.name}
                                                        onChange={(e) => setEditingCycle({
                                                            ...editingCycle,
                                                            name: e.target.value
                                                        })}
                                                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg"
                                                    />
                                                    <button
                                                        onClick={handleSaveEditCycle}
                                                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
                                                    >
                                                        {t("حفظ")}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCycle(null)}
                                                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm"
                                                    >
                                                        {t("إلغاء")}
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {cycle.name}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingCycle(cycle)}
                                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCycle(cycle)}
                                                            className="p-1 text-red-600 hover:bg-red-100 rounded-lg"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={closeModal}
                                className="w-full px-4 py-2 bg-primary text-white rounded-lg"
                            >
                                {t("إغلاق")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Member Modals */}
            {addModal && (
                <MemberModal
                    title={t("إضافة عضو جديد")}
                    member={memberForm}
                    setMember={setMemberForm}
                    handleSave={handleSaveAddMember}
                    closeModal={closeModal}
                    errors={errors}
                    isEdit={false}
                />
            )}

            {editModal && selectedMember && (
                <MemberModal
                    title={t("تعديل العضو")}
                    member={memberForm}
                    setMember={setMemberForm}
                    handleSave={handleSaveEditMember}
                    closeModal={closeModal}
                    errors={errors}
                    isEdit={true}
                />
            )}

            {detailsModal && selectedMember && (
                <MemberDetailsModal member={selectedMember} onClose={closeModal} />
            )}

            {permissionsModal && selectedMember && (
                <PermissionsModal member={selectedMember} onClose={closeModal} />
            )}

            {noteModal && selectedMember && (
                <AddNoteModal
                    member={selectedMember}
                    onClose={closeModal}
                    onSave={handleSaveNote}
                />
            )}

            {/* Confirm Modal */}
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