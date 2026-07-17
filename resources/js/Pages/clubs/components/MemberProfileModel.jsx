import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    PencilIcon,
    DevicePhoneMobileIcon,
    IdentificationIcon,
    BuildingOfficeIcon,
    StarIcon,
    UserCircleIcon,
    CheckBadgeIcon,
    XMarkIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function MemberProfileModel() {
    const { t } = useTranslation();
    const { app_url, auth } = usePage().props;
    const [member, setMember] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [myEvents, setMyEvents] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [myReports, setMyReports] = useState([]);
    const [memberNotes, setMemberNotes] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [modelImage, setModelImage] = useState(false);
    const [memberId, setMemberId] = useState(null);
    const [image, setImage] = useState(null);
    const [showEditTitle, setShowEditTitle] = useState(true);
    const [title, setTitle] = useState(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [noteContent, setNoteContent] = useState("");

    const canManageMembers = auth.user?.role === 'admin' || auth.user?.member?.permission?.manage_members;

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchMemberProfile(),
                showAllEvents(),
                showAllTasks(),
                fetchMemberReports(),
                fetchMemberNotes(),
            ]);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMemberProfile = async () => {
        try {
            const response = await axios.get(`${app_url}/member/profile`);
            setMember(response.data.member);
        } catch (error) {
            console.log(error);
        }
    };

    const showAllEvents = async () => {
        try {
            const response = await axios.get(`${app_url}/events`);
            const allEvents = response.data.events || [];
            const userEvents = allEvents.filter((event) =>
                event.attendances?.some((att) => att.user_id === auth.user.id)
            );
            setMyEvents(userEvents);
        } catch (error) {
            console.log(error);
        }
    };

    const showAllTasks = async () => {
        try {
            const response = await axios.get(`${app_url}/tasks`);
            const allTasks = response.data.tasks || [];
            const userTasks = allTasks.filter(
                (task) => task.assigned_to === auth.user.id
            );
            setMyTasks(userTasks);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchMemberReports = async () => {
        try {
            const response = await axios.get(`${app_url}/reports`);
            const allReports = response.data.reports || [];
            const userReports = allReports.filter(
                (report) => report.member_id === auth.user?.member?.id
            );
            setMyReports(userReports);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchMemberNotes = async () => {
        try {
            const memberId = auth.user?.member?.id;
            if (!memberId) return;
            const response = await axios.get(`${app_url}/member-notes/${memberId}`);
            setMemberNotes(response.data.notes || []);
        } catch (error) {
            console.log(error);
        }
    };

    const handleAddNote = async () => {
        if (!noteContent.trim()) return;
        try {
            await axios.post(`${app_url}/member-notes`, {
                member_id: member.id,
                note: noteContent,
            });
            setNoteContent("");
            setShowNoteModal(false);
            fetchMemberNotes();
        } catch (error) {
            console.log(error);
        }
    };

    const handleEditNote = async (noteId) => {
        if (!noteContent.trim()) return;
        try {
            await axios.put(`${app_url}/member-notes/${noteId}`, {
                note: noteContent,
            });
            setNoteContent("");
            setEditingNote(null);
            setShowNoteModal(false);
            fetchMemberNotes();
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm(t('هل أنت متأكد من حذف هذه الملاحظة؟'))) return;
        try {
            await axios.delete(`${app_url}/member-notes/${noteId}`);
            fetchMemberNotes();
        } catch (error) {
            console.log(error);
        }
    };

    const openAddNoteModal = () => {
        setNoteContent("");
        setEditingNote(null);
        setShowNoteModal(true);
    };

    const openEditNoteModal = (note) => {
        setEditingNote(note);
        setNoteContent(note.note);
        setShowNoteModal(true);
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                        i <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                    }`}
                />
            );
        }
        return stars;
    };

    const showModleImage = ($id) => {
        setModelImage(true);
        setMemberId($id);
    };

    const handelImage = async () => {
        try {
            const formData = new FormData();
            formData.append("image", image);
            await axios.post(`${app_url}/memberimage/${memberId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setModelImage(false);
            fetchMemberProfile();
        } catch (error) {
            console.log(error);
        }
    };

    const handelMemberId = async ($id) => {
        try {
            await axios.post(`${app_url}/memberId/${$id}`, {
                member_id: memberId,
            });
            fetchMemberProfile();
        } catch (error) {
            console.log(error);
        }
    };

    const handelTitle = async ($id) => {
        try {
            await axios.post(`${app_url}/memberTitle/${$id}`, {
                title: title,
            });
            fetchMemberProfile();
            setShowEditTitle(true);
        } catch (error) {
            console.log(error);
        }
    };

    if (loading) {
        return (
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse text-gray-500">
                        {t("جاري تحميل البيانات...")}
                    </div>
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="text-center text-red-500 py-8">
                    {t("لم يتم العثور على بيانات العضو")}
                </div>
            </div>
        );
    }

    const attendedEvents = myEvents.filter((event) =>
        event.attendances?.some((att) => att.status === "attending")
    ).length;

    const apologizedEvents = myEvents.filter((event) =>
        event.attendances?.some((att) => att.status === "apologizing")
    ).length;

    const completedTasks = myTasks.filter(
        (task) => task.status === "completed"
    ).length;
    const inProgressTasks = myTasks.filter(
        (task) => task.status === "in_progress"
    ).length;
    const pendingTasks = myTasks.filter(
        (task) => task.status === "pending"
    ).length;


    const approvedReports = myReports.filter((r) => r.status === "approved").length;
    const rejectedReports = myReports.filter((r) => r.status === "rejected").length;
    const pendingReports = myReports.filter(
        (r) => r.status === "under_review" || r.status === "sent"
    ).length;
    const draftReports = myReports.filter((r) => r.status === "draft").length;

    return (
        <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {t("الملف الشخصي")}
                </h3>
                {canManageMembers && (
                    <button
                        onClick={openAddNoteModal}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm flex items-center gap-2"
                    >
                        <DocumentTextIcon className="h-4 w-4" />
                        {t("إضافة ملاحظة")}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
                <div className="lg:col-span-2 space-y-6">
                 
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <div className="relative group w-20 h-20">
                                    {member.image ? (
                                        <>
                                            <img
                                                src={`${app_url}/storage/${member.image}`}
                                                alt="image"
                                                className="h-20 w-20 rounded-full object-cover"
                                            />
                                            <div
                                                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full
                                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                                                onClick={() =>
                                                    showModleImage(member.id)
                                                }
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <UserCircleIcon className="h-20 w-20 text-gray-400" />
                                            <div
                                                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full
                                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                                                onClick={() =>
                                                    showModleImage(member.id)
                                                }
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="absolute bottom-0 right-0 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                    {member.jop_title || t("بدون مسمى")}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                    {member.name}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {member.company?.company_name}
                                </p>
                                <div className="flex items-center mt-2">
                                    {renderStars(member.rating)}
                                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                                        ({member.rating})
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                                <DevicePhoneMobileIcon className="h-6 w-6 text-primary ml-2" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("رقم الهاتف")}
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                                        {member.phone || t("غير محدد")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                                <BuildingOfficeIcon className="h-6 w-6 text-primary ml-2" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("المسمى الوظيفى")}
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                                        {showEditTitle ? (
                                            <>
                                                {member.jop_title || t("غير محدد")}{" "}
                                                <PencilIcon
                                                    className="w-4 h-4 inline-block hover:text-primary cursor-pointer"
                                                    onClick={() => {
                                                        setShowEditTitle(false);
                                                        setTitle(member.jop_title);
                                                    }}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <input
                                                    type="text"
                                                    className="text-black dark:text-white dark:bg-gray-700 border rounded px-2 py-1"
                                                    value={title}
                                                    onChange={(e) =>
                                                        setTitle(e.target.value)
                                                    }
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() =>
                                                            handelTitle(member.id)
                                                        }
                                                        className="px-4 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                                                    >
                                                        {t("حفظ")}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setShowEditTitle(true)
                                                        }
                                                        className="px-4 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                                                    >
                                                        {t("إلغاء")}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                                <IdentificationIcon className="h-6 w-6 text-primary ml-2" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("الرقم التعريفي")}
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                                        {member.member_id || t("غير محدد")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                                <CheckBadgeIcon className="h-6 w-6 text-primary ml-2" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("القسم")}
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                                        {member.cycle?.name || t("غير محدد")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* الملاحظات */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <DocumentTextIcon className="h-5 w-5 text-primary" />
                            {t("الملاحظات")}
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({memberNotes.length})
                            </span>
                        </h3>

                        {memberNotes.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                                {t("لا توجد ملاحظات")}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {memberNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="bg-white dark:bg-gray-600 p-4 rounded-lg border-r-4 border-primary"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                    {note.note}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {t("بواسطة")}: {note.created_by?.name || t("غير معروف")}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(note.created_at).toLocaleString('ar-EG')}
                                                    </span>
                                                </div>
                                            </div>
                                            {canManageMembers && (
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => openEditNoteModal(note)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title={t("تعديل")}
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title={t("حذف")}
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* العمود الأيسر - الإحصائيات */}
                <div className="space-y-6">
                    {/* إحصائيات التقارير */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <PaperAirplaneIcon className="h-5 w-5 text-primary" />
                            {t("التقارير")}
                        </h3>

                        <div className="space-y-3">
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    <CheckCircleIcon className="h-4 w-4 inline ml-1 text-green-500" />
                                    {t("مقبولة")}
                                </span>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                    {approvedReports}
                                </span>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    <XCircleIcon className="h-4 w-4 inline ml-1 text-red-500" />
                                    {t("مرفوضة")}
                                </span>
                                <span className="font-bold text-red-600 dark:text-red-400">
                                    {rejectedReports}
                                </span>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    <ClockIcon className="h-4 w-4 inline ml-1 text-yellow-500" />
                                    {t("بانتظار المراجعة")}
                                </span>
                                <span className="font-bold text-yellow-600 dark:text-yellow-400">
                                    {pendingReports}
                                </span>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    <DocumentTextIcon className="h-4 w-4 inline ml-1 text-gray-500" />
                                    {t("مسودة")}
                                </span>
                                <span className="font-bold text-gray-600 dark:text-gray-400">
                                    {draftReports}
                                </span>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                    {t("الإجمالي")}
                                </span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">
                                    {myReports.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* إحصائيات المهام والفعاليات */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                            {t("الإحصائيات")}
                        </h3>

                        <div className="space-y-3">
                            <div className="bg-white dark:bg-gray-600 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {t("الفعاليات الحاضرة")}
                                </span>
                                <span className="font-bold text-primary">
                                    {attendedEvents}
                                </span>
                            </div>

                            <div className="bg-white dark:bg-gray-600 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {t("الفعاليات المعتذر عنها")}
                                </span>
                                <span className="font-bold text-red-500">
                                    {apologizedEvents}
                                </span>
                            </div>

                            <div className="bg-white dark:bg-gray-600 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {t("المهام المنجزة")}
                                </span>
                                <span className="font-bold text-primary">
                                    {completedTasks}
                                </span>
                            </div>

                            <div className="bg-white dark:bg-gray-600 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {t("المهام الجارية")}
                                </span>
                                <span className="font-bold text-yellow-500">
                                    {inProgressTasks}
                                </span>
                            </div>

                            <div className="bg-white dark:bg-gray-600 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {t("المهام المعلقة")}
                                </span>
                                <span className="font-bold text-gray-500">
                                    {pendingTasks}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

       
            {modelImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {t("تحديث الصورة الشخصية")}
                            </h3>
                            <button
                                onClick={() => setModelImage(false)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <input
                                type="file"
                                onChange={(e) => setImage(e.target.files[0])}
                                className="w-full"
                            />
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                            <button
                                onClick={handelImage}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                            >
                                {t("حفظ")}
                            </button>
                            <button
                                onClick={() => setModelImage(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                {t("إغلاق")}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {showNoteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {editingNote ? t("تعديل الملاحظة") : t("إضافة ملاحظة")}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowNoteModal(false);
                                    setEditingNote(null);
                                    setNoteContent("");
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {t("ملاحظة على")}: <span className="font-semibold">{member?.name}</span>
                            </p>
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder={t("اكتب الملاحظة هنا...")}
                            />
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                            <button
                                onClick={() => {
                                    setShowNoteModal(false);
                                    setEditingNote(null);
                                    setNoteContent("");
                                }}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                {t("إلغاء")}
                            </button>
                            <button
                                onClick={editingNote ? () => handleEditNote(editingNote.id) : handleAddNote}
                                disabled={!noteContent.trim()}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                            >
                                {editingNote ? t("تحديث") : t("إضافة")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}