import React, { useState, useEffect } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    PlusIcon,
    DocumentTextIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FunnelIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import TaskForm from "./components/tasks/TaskForm";
import TaskCard from "./components/tasks/TaskCard";
import TasksModel from "./components/tasks/TasksModel";
import ConfirmModal from "./components/ConfirmModal";

export default function Tasks() {
    const { app_url, auth, permissions } = usePage().props;
    const { t } = useTranslation();

    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTask, setSearchTask] = useState("");
    const [selectedMemberFilter, setSelectedMemberFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [addTaskModal, setAddTaskModal] = useState(false);
    const [editTaskModal, setEditTaskModal] = useState(false);
    const [tasksModel, setTasksModel] = useState(false);
    const [selectedTaskGroup, setSelectedTaskGroup] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [fileUploads, setFileUploads] = useState([]);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: null,
        title: '',
        message: '',
        confirmText: 'حذف',
        confirmColor: 'bg-red-600 hover:bg-red-700',
        icon: 'danger',
        loading: false,
    });

    const permission = permissions.permissions;
    const isAdmin = auth.user?.role === 'admin';
    const canManageTasks = permission?.add_tasks || isAdmin;
    const userId = auth.user?.id;

    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assigned_to: [],
        due_date: "",
        files: [],
        status: "pending",
    });

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${app_url}/tasks`);
            let tasksData = response.data.tasks || [];

            if (!canManageTasks) {
                tasksData = tasksData.filter(task => task.assigned_to === userId);
            }

            const grouped = Object.values(
                tasksData.reduce((acc, task) => {
                    const key = task.task_id || task.id;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(task);
                    return acc;
                }, {})
            );
            const sorted = grouped.sort((a, b) => {
                const latestA = Math.max(...a.map((t) => new Date(t.updated_at || t.created_at).getTime()));
                const latestB = Math.max(...b.map((t) => new Date(t.updated_at || t.created_at).getTime()));
                return latestB - latestA;
            });
            setTasks(sorted);
            setFilteredTasks(sorted);
        } catch (error) {
            console.error(t("خطأ في جلب المهام:"), error);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await axios.get(`${app_url}/members`);
            console.log(t("بيانات الأعضاء:"), response.data.members);
            setMembers(response.data.members || []);
        } catch (error) {
            console.error(t("خطأ في جلب الأعضاء:"), error);
        }
    };

    const fetchCycles = async () => {
        try {
            const response = await axios.get(`${app_url}/cycles`);
            setCycles(response.data.cycles || []);
        } catch (error) {
            console.error(t("خطأ في جلب الأقسام:"), error);
        }
    };

    const handleTaskStatusChange = async (taskId, status) => {
        try {
            await axios.post(`${app_url}/tasks/${taskId}/status`, { status });
            await fetchTasks();
        } catch (error) {
            console.error(t("خطأ في تحديث حالة المهمة:"), error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchTasks(), fetchMembers(), fetchCycles()]);
            setLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        let filtered = tasks.filter((group) => {
            const matchesSearch = group.some(
                (task) =>
                    task.title?.toLowerCase().includes(searchTask.toLowerCase()) ||
                    task.assignee?.name?.toLowerCase().includes(searchTask.toLowerCase()) ||
                    task.assigned_to?.toString().includes(searchTask)
            );

            let matchesMember = true;
            if (selectedMemberFilter) {
                const filterValue = parseInt(selectedMemberFilter);
                matchesMember = group.some((task) => {
                    const taskAssignedTo = parseInt(task.assigned_to);
                    const member = members.find(m => m.user_id === taskAssignedTo);
                    return member && member.id === filterValue;
                });
            }

            return matchesSearch && matchesMember;
        });

        setFilteredTasks(filtered);
        setCurrentPage(1);
    }, [searchTask, selectedMemberFilter, tasks, members]);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            const listElement = document.querySelector('.space-y-2');
            if (listElement) {
                listElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);

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

    const resetFilters = () => {
        setSearchTask("");
        setSelectedMemberFilter("");
    };

    const handleAddTask = () => {
        setNewTask({
            title: "",
            description: "",
            assigned_to: [],
            due_date: "",
            files: [],
            status: "pending",
        });
        setFileUploads([]);
        setErrors({});
        setAddTaskModal(true);
    };

    const handleEditTask = (task) => {
        const taskGroup = tasks.find(group =>
            group.some(t => t.id === task.id || t.task_id === task.task_id)
        );

        const assignedToArray = taskGroup
            ? taskGroup.map(t => Number(t.assigned_to)).filter(Boolean)
            : [];

        setSelectedTask({
            ...task,
            assigned_to: assignedToArray,
        });
        setFileUploads([]);
        setErrors({});
        setEditTaskModal(true);
    };

    const handleViewTask = (task) => {
        const taskGroup = tasks.find(group =>
            group.some(t => t.id === task.id || t.task_id === task.task_id)
        );
        setSelectedTaskGroup(taskGroup || [task]);
        setTasksModel(true);
    };

    const handleDeleteTask = (task) => {
        setSelectedTask(task);
        showConfirmDelete(task);
    };

    const showConfirmDelete = (task) => {
        setConfirmModal({
            isOpen: true,
            onConfirm: () => handleDeleteConfirm(task),
            title: t("هل أنت متأكد من حذف هذه المهمة؟"),
            message: t(`سيتم حذف المهمة "${task.title}" وجميع بياناتها نهائياً. هذا الإجراء لا يمكن التراجع عنه.`),
            confirmText: t("حذف"),
            confirmColor: "bg-red-600 hover:bg-red-700",
            icon: "danger",
            loading: false,
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleDeleteConfirm = async (task) => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
            await axios.delete(`${app_url}/tasks/${task.id}`);
            closeConfirmModal();
            setSelectedTask(null);
            await fetchTasks();
        } catch (error) {
            console.error(t("خطأ في حذف المهمة:"), error);
            setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleSaveTask = async (isEdit = false) => {
        setSaving(true);
        setErrors({});

        try {
            const formData = new FormData();
            const taskData = isEdit ? selectedTask : newTask;

            const assignedToArray = Array.isArray(taskData.assigned_to)
                ? taskData.assigned_to
                : [];

            if (!taskData.title || !taskData.due_date || assignedToArray.length === 0) {
                setErrors({ general: [t("جميع الحقول المطلوبة يجب ملؤها")] });
                setSaving(false);
                return;
            }

            formData.append("title", taskData.title);
            formData.append("description", taskData.description || "");
            formData.append("due_date", taskData.due_date);

            assignedToArray.forEach((userId) => {
                formData.append("assigned_to[]", userId);
            });

            fileUploads.forEach((file) => {
                formData.append("files[]", file);
            });

            let response;
            if (isEdit && selectedTask) {
                formData.append("_method", "PUT");
                response = await axios.post(`${app_url}/tasks/${selectedTask.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                response = await axios.post(`${app_url}/tasks`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            if (response.data.success) {
                setAddTaskModal(false);
                setEditTaskModal(false);
                setSelectedTask(null);
                setFileUploads([]);
                await fetchTasks();
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: [t("حدث خطأ أثناء حفظ المهمة")] });
            }
        } finally {
            setSaving(false);
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

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-primary" />
                        {canManageTasks ? t("إدارة المهام") : t("المهام المطلوبة مني")}
                    </h2>
                    {canManageTasks && (
                        <button
                            onClick={handleAddTask}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 ml-1" />
                            {t("مهمة جديدة")}
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={searchTask}
                            onChange={(e) => setSearchTask(e.target.value)}
                            placeholder={t("بحث عن مهمة أو شخص...")}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {canManageTasks && members.length > 0 && (
                        <div className="sm:w-64">
                            <select
                                value={selectedMemberFilter}
                                onChange={(e) => setSelectedMemberFilter(e.target.value)}
                                className="w-full px-8 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">{t("جميع الموظفين")}</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} {member.member_id ? `(${member.member_id})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(searchTask || selectedMemberFilter) && (
                        <button
                            onClick={resetFilters}
                            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                        >
                            <XMarkIcon className="h-4 w-4" />
                            {t("إعادة الضبط")}
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    {currentTasks.length > 0 ? (
                        currentTasks.map((group) => (
                            <TaskCard
                                key={group[0].id}
                                task={group[0]}
                                onView={() => handleViewTask(group[0])}
                                onEdit={canManageTasks ? () => handleEditTask(group[0]) : null}
                                onDelete={canManageTasks ? () => handleDeleteTask(group[0]) : null}
                                isAdmin={isAdmin}
                                canManage={canManageTasks}
                                isMemberView={!canManageTasks}
                                userId={userId}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                            <p className="text-base font-semibold">{t("لا توجد مهام")}</p>
                            <p className="text-sm">
                                {selectedMemberFilter
                                    ? t("لا توجد مهام لهذا الموظف")
                                    : canManageTasks
                                        ? t("قم بإنشاء أول مهمة لك الآن")
                                        : t("ليس لديك مهام مطلوبة حالياً")}
                            </p>
                            {canManageTasks && !selectedMemberFilter && (
                                <button
                                    onClick={handleAddTask}
                                    className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    <PlusIcon className="h-4 w-4 ml-1" />
                                    {t("مهمة جديدة")}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {filteredTasks.length > 0 && (
                    <div className="mt-4 mb-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4 flex-wrap">
                        <span>
                            {t("عرض:")} {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredTasks.length)} {t("من")} {filteredTasks.length}
                        </span>
                        {selectedMemberFilter && (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs">
                                {t("مرشح حسب:")} {members.find(m => m.id === parseInt(selectedMemberFilter))?.name || ''}
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
            </div>

            <TaskForm
                isOpen={addTaskModal}
                onClose={() => {
                    setAddTaskModal(false);
                    setFileUploads([]);
                    setErrors({});
                }}
                onSave={() => handleSaveTask(false)}
                title={t("إضافة مهمة جديدة")}
                task={newTask}
                setTask={setNewTask}
                members={members}
                cycles={cycles}
                loading={saving}
                errors={errors}
                fileUploads={fileUploads}
                setFileUploads={setFileUploads}
                isEdit={false}
            />

            {selectedTask && editTaskModal && (
                <TaskForm
                    isOpen={editTaskModal}
                    onClose={() => {
                        setEditTaskModal(false);
                        setSelectedTask(null);
                        setFileUploads([]);
                        setErrors({});
                    }}
                    onSave={() => handleSaveTask(true)}
                    title={t("تعديل المهمة")}
                    task={selectedTask}
                    setTask={setSelectedTask}
                    members={members}
                    cycles={cycles}
                    loading={saving}
                    errors={errors}
                    fileUploads={fileUploads}
                    setFileUploads={setFileUploads}
                    existingFiles={selectedTask.files || []}
                    isEdit={true}
                />
            )}

            {tasksModel && selectedTaskGroup.length > 0 && (
                <TasksModel
                    task={selectedTaskGroup}
                    closeModal={() => {
                        setTasksModel(false);
                        setSelectedTaskGroup([]);
                    }}
                    handleTaskStatusChange={handleTaskStatusChange}
                    canManage={canManageTasks}
                    userId={userId}
                />
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