// resources/js/pages/clubs/Leaderboard.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { 
    TrophyIcon, 
    UserCircleIcon,
    PencilIcon,
    XMarkIcon,
    CheckIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import ConfirmModal from "./Components/ConfirmModal";

export default function Leaderboard() {
    const { app_url, auth, permissions } = usePage().props;
    const { t } = useTranslation();

    const [leaderboard, setLeaderboard] = useState([]);
    const [settings, setSettings] = useState(null);
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canManage, setCanManage] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [showSettings, setShowSettings] = useState(false);
    const [selectedCriteria, setSelectedCriteria] = useState([]);
    const [timePeriod, setTimePeriod] = useState('all');
    const [savingSettings, setSavingSettings] = useState(false);

    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'bg-red-600 hover:bg-red-700',
        icon: 'warning',
        loading: false,
    });

    const permission = permissions?.permissions;
    const isAdmin = auth.user?.role === 'admin';
    const canManageLeaderboard = isAdmin || permission?.manage_leaderboard;

    const criteriaOptions = [
        { value: 'tasks', label: 'المهام المكتملة' },
        { value: 'events', label: 'الأحداث المحضورة' },
        { value: 'rating', label: 'التقييم' },
        { value: 'daily_reports', label: 'التقارير اليومية المقبولة' },
        { value: 'weekly_reports', label: 'التقارير الأسبوعية المقبولة' },
        { value: 'monthly_reports', label: 'التقارير الشهرية المقبولة' },
        { value: 'custom_reports', label: 'التقارير المخصصة المقبولة' },
        { value: 'all_reports', label: 'جميع التقارير المقبولة' },
    ];

    const timePeriods = [
        { value: 'weekly', label: 'أسبوعي' },
        { value: 'monthly', label: 'شهري' },
        { value: 'yearly', label: 'سنوي' },
        { value: 'all', label: 'كل الوقت' },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${app_url}/leaderboard`);
            if (response.data.success) {
                setLeaderboard(response.data.leaderboard || []);
                setSettings(response.data.settings);
                setNote(response.data.note);
                setCanManage(canManageLeaderboard);
            }
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentItems = leaderboard.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(leaderboard.length / rowsPerPage);

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

    const openSettings = () => {
        if (!canManageLeaderboard) return;
        setSelectedCriteria(settings?.criteria || ['tasks', 'rating']);
        setTimePeriod(settings?.time_period || 'all');
        setShowSettings(true);
    };

    const handleSaveSettings = async () => {
        if (selectedCriteria.length === 0) {
            alert(t('يرجى اختيار معيار واحد على الأقل'));
            return;
        }

        setSavingSettings(true);
        try {
            const response = await axios.post(`${app_url}/leaderboard/settings`, {
                criteria: selectedCriteria,
                time_period: timePeriod,
            });
            if (response.data.success) {
                setShowSettings(false);
                fetchData();
            }
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setSavingSettings(false);
        }
    };

    const openNoteModal = () => {
        if (!canManageLeaderboard) return;
        setNoteContent(note?.content || '');
        setShowNoteModal(true);
    };

    const handleSaveNote = async () => {
        if (!noteContent.trim()) {
            alert(t('يرجى كتابة محتوى الملاحظة'));
            return;
        }

        setSavingNote(true);
        try {
            const response = await axios.post(`${app_url}/leaderboard/note`, {
                content: noteContent,
            });
            if (response.data.success) {
                setShowNoteModal(false);
                fetchData();
            }
        } catch (error) {
            console.error("Error saving note:", error);
        } finally {
            setSavingNote(false);
        }
    };

    const handleDeleteNote = async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
            const response = await axios.delete(`${app_url}/leaderboard/note`);
            if (response.data.success) {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                fetchData();
            }
        } catch (error) {
            console.error("Error deleting note:", error);
        } finally {
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const showConfirmDeleteNote = () => {
        setConfirmModal({
            isOpen: true,
            onConfirm: handleDeleteNote,
            title: t("هل أنت متأكد من حذف الملاحظة؟"),
            message: t("سيتم حذف ملاحظة المدير نهائياً. هذا الإجراء لا يمكن التراجع عنه."),
            confirmText: t("حذف"),
            confirmColor: "bg-red-600 hover:bg-red-700",
            icon: "warning",
            loading: false,
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const getMedalColor = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
        if (rank === 3) return 'bg-gradient-to-r from-orange-300 to-orange-500';
        return 'bg-gray-100';
    };

    const renderScoreDetails = (item) => {
        const details = [];
        const criteriaMap = {
            tasks: { icon: '📋', label: 'المهام' },
            events: { icon: '📅', label: 'الأحداث' },
            rating: { icon: '⭐', label: 'التقييم' },
            daily_reports: { icon: '📊', label: 'تقارير يومية' },
            weekly_reports: { icon: '📊', label: 'تقارير أسبوعية' },
            monthly_reports: { icon: '📊', label: 'تقارير شهرية' },
            custom_reports: { icon: '📊', label: 'تقارير مخصصة' },
            all_reports: { icon: '📊', label: 'جميع التقارير' },
        };

        const activeCriteria = settings?.criteria || ['tasks', 'rating', 'events', 'all_reports'];
        activeCriteria.forEach(criterion => {
            const score = item.scores?.[criterion] || 0;
            if (score > 0) {
                const info = criteriaMap[criterion] || { icon: '📌', label: criterion };
                details.push(
                    <span key={criterion} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {info.icon} {score} {info.label}
                    </span>
                );
            }
        });

        return details;
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

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <TrophyIcon className="h-8 w-8 text-yellow-500" />
                        {t("لوحة الشرف")}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                            ({leaderboard.length} {t("عضو")})
                        </span>
                    </h2>
                    {canManageLeaderboard && (
                        <div className="flex gap-2">
                            <button
                                onClick={openNoteModal}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <PencilIcon className="h-4 w-4" />
                                {t("ملاحظة المدير")}
                            </button>
                            <button
                                onClick={openSettings}
                                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {t("الإعدادات")}
                            </button>
                        </div>
                    )}
                </div>

                {note && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-r-4 border-blue-500">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {t("ملاحظة المدير:")}
                                    </span>
                                    {note.content}
                                </p>
                            </div>
                            {canManageLeaderboard && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={openNoteModal}
                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                        title={t("تعديل")}
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={showConfirmDeleteNote}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                        title={t("حذف")}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {leaderboard.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {leaderboard.slice(0, 3).map((item) => (
                            <div
                                key={item.id}
                                className={`text-center p-6 rounded-2xl ${getMedalColor(item.rank)} text-white shadow-lg transform transition-all duration-300 hover:scale-105`}
                            >
                                <div className="text-6xl mb-2">{item.medal}</div>
                                <div className="flex justify-center mb-2">
                                    {item.image ? (
                                        <img
                                            src={`${app_url}/storage/${item.image}`}
                                            className="h-20 w-20 rounded-full border-4 border-white object-cover"
                                            alt={item.name}
                                        />
                                    ) : item.user?.company?.logo ? (
                                        <img
                                            src={`${app_url}/storage/${item.user.company.logo}`}
                                            className="h-20 w-20 rounded-full border-4 border-white object-cover"
                                            alt={item.name}
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-20 w-20 text-white/80" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold">{item.name}</h3>
                                <p className="text-sm opacity-90">{item.medal_label}</p>
                                <div className="mt-2 space-y-1 text-sm">
                                    <p>⭐ {item.rating} نقطة من التقييم</p>
                                    {settings?.criteria?.includes('tasks') && (
                                        <p>📋 {item.scores?.tasks || 0} نقطة من المهام</p>
                                    )}
                                    {settings?.criteria?.includes('events') && (
                                        <p>📅 {item.scores?.events || 0} نقطة من الأحداث</p>
                                    )}
                                    {settings?.criteria?.some(c => c.includes('reports')) && (
                                        <p>📊 {item.scores?.all_reports || item.scores?.daily_reports || item.scores?.weekly_reports || item.scores?.monthly_reports || 0} نقطة من التقارير</p>
                                    )}
                                </div>
                                <p className="text-3xl font-bold mt-3">
                                    {item.total_score} <span className="text-lg font-normal">{t("نقطة")}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {leaderboard.length > 0 && (
                    <div className="mb-3 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4 flex-wrap">
                        <span>
                            {t("عرض:")} {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, leaderboard.length)} {t("من")} {leaderboard.length}
                        </span>
                        {settings && (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs">
                                {t("المعايير:")} {settings.criteria.map(c => {
                                    const option = criteriaOptions.find(o => o.value === c);
                                    return option ? option.label : c;
                                }).join('، ')}
                            </span>
                        )}
                        {settings && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs">
                                {t("الفترة:")} {timePeriods.find(p => p.value === settings.time_period)?.label || 'كل الوقت'}
                            </span>
                        )}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("#")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("الموظف")}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("التقييم")}
                                    <span className="text-xs font-normal text-gray-400 block">(1 نقطة لكل نجمة)</span>
                                </th>
                                {settings?.criteria?.includes('tasks') && (
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("المهام")}
                                        <span className="text-xs font-normal text-gray-400 block">(1 نقطة لكل مهمة)</span>
                                    </th>
                                )}
                                {settings?.criteria?.includes('events') && (
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الأحداث")}
                                        <span className="text-xs font-normal text-gray-400 block">(1 نقطة لكل حدث)</span>
                                    </th>
                                )}
                                {settings?.criteria?.some(c => c.includes('reports')) && (
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("التقارير")}
                                        <span className="text-xs font-normal text-gray-400 block">(1 نقطة لكل تقرير)</span>
                                    </th>
                                )}
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    {t("المجموع")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {currentItems.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className={`transition-colors duration-200 ${
                                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                                    } hover:bg-gray-100 dark:hover:bg-gray-600`}
                                >
                                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            {item.medal && <span className="text-lg">{item.medal}</span>}
                                            <span>#{item.rank}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center gap-3">
                                            {item.image ? (
                                                <img
                                                    src={`${app_url}/storage/${item.image}`}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                    alt={item.name}
                                                />
                                            ) : item.user?.company?.logo ? (
                                                <img
                                                    src={`${app_url}/storage/${item.user.company.logo}`}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                    alt={item.name}
                                                />
                                            ) : (
                                                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                            )}
                                            <div>
                                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                                    {item.name}
                                                </span>
                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                    {renderScoreDetails(item)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center">
                                                {'⭐'.repeat(Math.min(Math.round(item.rating), 5))}
                                                <span className="mr-1 text-sm font-bold">{item.rating}</span>
                                            </div>
                                            <span className="text-xs text-green-600 dark:text-green-400">+{item.rating} نقطة</span>
                                        </div>
                                    </td>
                                    {settings?.criteria?.includes('tasks') && (
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold">{item.scores?.tasks || 0}</span>
                                                <span className="text-xs text-green-600 dark:text-green-400">+{item.scores?.tasks || 0} نقطة</span>
                                            </div>
                                        </td>
                                    )}
                                    {settings?.criteria?.includes('events') && (
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold">{item.scores?.events || 0}</span>
                                                <span className="text-xs text-green-600 dark:text-green-400">+{item.scores?.events || 0} نقطة</span>
                                            </div>
                                        </td>
                                    )}
                                    {settings?.criteria?.some(c => c.includes('reports')) && (
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold">
                                                    {item.scores?.all_reports || 
                                                     item.scores?.daily_reports || 
                                                     item.scores?.weekly_reports || 
                                                     item.scores?.monthly_reports || 
                                                     item.scores?.custom_reports || 0}
                                                </span>
                                                <span className="text-xs text-green-600 dark:text-green-400">
                                                    +{item.scores?.all_reports || 
                                                      item.scores?.daily_reports || 
                                                      item.scores?.weekly_reports || 
                                                      item.scores?.monthly_reports || 
                                                      item.scores?.custom_reports || 0} نقطة
                                                </span>
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-primary dark:text-primary-light text-lg">
                                                {item.total_score}
                                            </span>
                                            <span className="text-xs text-gray-400">{t("نقطة")}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {leaderboard.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <TrophyIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-lg font-semibold">{t("لا توجد بيانات لعرضها")}</p>
                        <p className="text-sm">{t("قم بتحديث الإعدادات لبدء عرض الترتيب")}</p>
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
            </div>

            {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {t("إعدادات لوحة الشرف")}
                            </h3>
                            <button 
                                onClick={() => setShowSettings(false)} 
                                className="text-gray-400 hover:text-gray-600 transition-transform hover:rotate-90"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t("المعايير")}
                                    <span className="text-xs text-gray-400 block">
                                        {t("اختر المعايير التي تريد حساب النقاط بناءً عليها")}
                                    </span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {criteriaOptions.map((option) => (
                                        <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedCriteria.includes(option.value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCriteria([...selectedCriteria, option.value]);
                                                    } else {
                                                        setSelectedCriteria(selectedCriteria.filter(c => c !== option.value));
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                                {selectedCriteria.length === 0 && (
                                    <p className="text-red-500 text-sm mt-1">{t("يرجى اختيار معيار واحد على الأقل")}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t("الفترة الزمنية")}
                                    <span className="text-xs text-gray-400 block">
                                        {t("اختر الفترة الزمنية لحساب النقاط")}
                                    </span>
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {timePeriods.map((period) => (
                                        <button
                                            key={period.value}
                                            onClick={() => setTimePeriod(period.value)}
                                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                                timePeriod === period.value
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {period.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-bold">💡 {t("ملاحظة:")}</span>
                                    {t("سيتم حساب النقاط كالتالي:")}
                                </p>
                                <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                                    <li>⭐ {t("التقييم: 1 نقطة لكل نجمة")}</li>
                                    <li>📋 {t("المهام المكتملة: 1 نقطة لكل مهمة")}</li>
                                    <li>📅 {t("الأحداث المحضورة: 1 نقطة لكل حدث")}</li>
                                    <li>📊 {t("التقارير المقبولة: 1 نقطة لكل تقرير")}</li>
                                </ul>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                            <button 
                                onClick={() => setShowSettings(false)} 
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {t("إلغاء")}
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                disabled={savingSettings || selectedCriteria.length === 0}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                            >
                                {savingSettings ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t("جاري الحفظ...")}
                                    </span>
                                ) : (
                                    t("حفظ الإعدادات")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNoteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {note ? t("تعديل ملاحظة المدير") : t("إضافة ملاحظة المدير")}
                            </h3>
                            <button 
                                onClick={() => setShowNoteModal(false)} 
                                className="text-gray-400 hover:text-gray-600 transition-transform hover:rotate-90"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder={t("اكتب ملاحظة للموظفين...")}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {t("سيتم عرض هذه الملاحظة في أعلى صفحة لوحة الشرف")}
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {t("إلغاء")}
                            </button>
                            <button
                                onClick={handleSaveNote}
                                disabled={savingNote || !noteContent.trim()}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                            >
                                {savingNote ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t("جاري الحفظ...")}
                                    </span>
                                ) : (
                                    t("حفظ")
                                )}
                            </button>
                        </div>
                    </div>
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
            />
        </AdminLayout>
    );
}