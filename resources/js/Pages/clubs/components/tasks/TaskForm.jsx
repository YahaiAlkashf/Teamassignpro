import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    XMarkIcon,
    PaperClipIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    UserCircleIcon,
    CalendarIcon,
    DocumentTextIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";
import { usePage } from "@inertiajs/react";

export default function TaskForm({
    isOpen,
    onClose,
    onSave,
    title,
    task,
    setTask,
    members,
    cycles,
    loading,
    errors,
    fileUploads,
    setFileUploads,
    existingFiles = [],
    isEdit = false,
}) {
    const { t } = useTranslation();
    const { app_url, auth } = usePage().props;
    const [memberNameSearch, setMemberNameSearch] = useState("");
    const [memberIdSearch, setMemberIdSearch] = useState("");
    const [selectedMember, setSelectedMember] = useState(null);

    const currentUserId = auth?.user?.id;

    const availableMembers = members.filter(
        (member) => Number(member.user_id) !== Number(currentUserId)
    );

    const filteredMembers = availableMembers.filter(
        (member) =>
            member.name.toLowerCase().includes(memberNameSearch.toLowerCase()) &&
            (member.member_id
                ? member.member_id.toString().includes(memberIdSearch)
                : true)
    );

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setFileUploads([...fileUploads, ...files]);
    };

    const removeFile = (index) => {
        setFileUploads(fileUploads.filter((_, i) => i !== index));
    };

    const handleSelectAll = () => {
        const assignedToArray = Array.isArray(task.assigned_to) ? task.assigned_to : [];
        const availableIds = availableMembers.map((member) => Number(member.user_id));
        
        const allSelected = availableIds.every(id => assignedToArray.includes(id));
        
        if (allSelected) {
            setTask({ ...task, assigned_to: [] });
        } else {
            setTask({ ...task, assigned_to: availableIds });
        }
    };

    const handleSelectCycle = (cycleId) => {
        if (!cycleId) return;
        const id = Number(cycleId);
        const selectedIds = availableMembers
            .filter((member) => member.cycle_id === id)
            .map((member) => Number(member.user_id));
        
        const currentAssignees = Array.isArray(task.assigned_to) ? task.assigned_to : [];
        setTask({
            ...task,
            assigned_to: Array.from(new Set([...currentAssignees, ...selectedIds])),
        });
    };

    if (!isOpen) return null;

    const assignedToArray = Array.isArray(task.assigned_to) ? task.assigned_to : [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t("عنوان المهمة")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={task.title || ""}
                            onChange={(e) => setTask({ ...task, title: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={t("أدخل عنوان المهمة")}
                        />
                        {errors?.title && (
                            <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t("وصف المهمة")}
                        </label>
                        <textarea
                            value={task.description || ""}
                            onChange={(e) => setTask({ ...task, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={t("اكتب وصف المهمة هنا...")}
                        />
                        {errors?.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t("اختيار العضو")} <span className="text-red-500">*</span>
                            <span className="text-xs text-gray-400 block">
                                {t("لا يمكنك اختيار نفسك")}
                            </span>
                        </label>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                            <button
                                onClick={handleSelectAll}
                                className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                {t("تحديد الكل")}
                            </button>
                            <select
                                onChange={(e) => handleSelectCycle(e.target.value)}
                                className="px-8 py-1.5 text-xs border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary"
                                defaultValue=""
                            >
                                <option value="">{t("تحديد حسب القسم")}</option>
                                {cycles?.map((cycle) => (
                                    <option key={cycle.id} value={cycle.id}>
                                        {cycle.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t("البحث بالاسم...")}
                                    value={memberNameSearch}
                                    onChange={(e) => setMemberNameSearch(e.target.value)}
                                    className="w-full pr-10 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t("البحث برقم العضوية...")}
                                    value={memberIdSearch}
                                    onChange={(e) => setMemberIdSearch(e.target.value)}
                                    className="w-full pr-10 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 max-h-48 overflow-y-auto">
                            {filteredMembers.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredMembers.map((member) => {
                                        const assignedToArray2 = Array.isArray(task.assigned_to) 
                                            ? task.assigned_to.map(id => Number(id)) 
                                            : [];
                                        const isSelected = assignedToArray2.includes(Number(member.user_id));
                                        
                                        return (
                                            <div
                                                key={member.id}
                                                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? "bg-primary/10 border border-primary/30"
                                                        : "hover:bg-gray-200 dark:hover:bg-gray-600"
                                                }`}
                                                onClick={() => {
                                                    const updated = isSelected
                                                        ? assignedToArray2.filter((id) => id !== Number(member.user_id))
                                                        : [...assignedToArray2, Number(member.user_id)];
                                                    setTask({ ...task, assigned_to: updated });
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <UserCircleIcon className="h-6 w-6 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                            {member.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {t("رقم العضوية")}: {member.member_id || t("غير محدد")}
                                                            {member.cycle?.name && ` | ${member.cycle.name}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <CheckCircleIcon className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {availableMembers.length === 0 ? (
                                        t("لا يوجد أعضاء آخرين لإضافتهم")
                                    ) : (
                                        t("لا توجد نتائج")
                                    )}
                                </div>
                            )}
                        </div>

                        {assignedToArray.length > 0 && (
                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                    {t("الأعضاء المحددون")}: {assignedToArray.length}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    {assignedToArray
                                        .map((userId) => {
                                            const member = members.find((m) => Number(m.user_id) === Number(userId));
                                            return member?.name;
                                        })
                                        .filter(Boolean)
                                        .join("، ")}
                                </p>
                            </div>
                        )}
                        
                        {assignedToArray.length === 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                    ⚠️ {t("يرجى اختيار عضو واحد على الأقل")}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t("تاريخ التسليم")} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={task.due_date || ""}
                            onChange={(e) => setTask({ ...task, due_date: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {errors?.due_date && (
                            <p className="text-red-500 text-xs mt-1">{errors.due_date[0]}</p>
                        )}
                    </div>

                    {isEdit && existingFiles.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                {t("الملفات المرفقة")}
                            </label>
                            <div className="space-y-1.5">
                                {existingFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <PaperClipIcon className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {file.file_name}
                                            </span>
                                        </div>
                                        <a
                                            href={`${app_url}/storage/${file.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {isEdit ? t("إضافة ملفات جديدة") : t("إرفاق ملفات")}
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                                id="task-file-upload"
                            />
                            <label
                                htmlFor="task-file-upload"
                                className="cursor-pointer text-primary hover:text-primary-dark flex flex-col items-center"
                            >
                                <PaperClipIcon className="h-8 w-8 mb-1" />
                                <span className="text-sm font-medium">
                                    {t("انقر لرفع الملفات أو اسحبها هنا")}
                                </span>
                                <span className="text-xs text-gray-500 mt-0.5">
                                    {t("يمكنك رفع صور، PDF، مستندات")}
                                </span>
                            </label>
                        </div>
                        {fileUploads.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                                {fileUploads.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                                    >
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {file.name}
                                        </span>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors?.files && (
                            <p className="text-red-500 text-xs mt-1">{errors.files[0]}</p>
                        )}
                    </div>

                    {errors?.general && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {errors.general}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t("إلغاء")}
                    </button>
                    <button
                        onClick={onSave}
                        disabled={loading || assignedToArray.length === 0}
                        className="flex-1 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? t("جاري الحفظ...") : t("حفظ")}
                    </button>
                </div>
            </div>
        </div>
    );
}