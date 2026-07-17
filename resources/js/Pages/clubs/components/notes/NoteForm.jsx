// resources/js/Components/notes/NoteForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function NoteForm({ 
    note, 
    setNote, 
    onSave, 
    onClose, 
    loading, 
    errors,
    isEdit = false
}) {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {isEdit ? t("تعديل الملاحظة") : t("ملاحظة جديدة")}
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="p-4 space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("عنوان الملاحظة")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={note.title || ""}
                        onChange={(e) => setNote({ ...note, title: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t("أدخل عنوان الملاحظة")}
                    />
                    {errors?.title && (
                        <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("المحتوى")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={note.content || ""}
                        onChange={(e) => setNote({ ...note, content: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t("اكتب محتوى الملاحظة هنا...")}
                    />
                    {errors?.content && (
                        <p className="text-red-500 text-xs mt-1">{errors.content[0]}</p>
                    )}
                </div>

                {errors?.general && (
                    <div className="p-2 bg-red-100 text-red-700 rounded-lg text-xs">
                        {errors.general[0]}
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
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                    {loading ? t("جاري الحفظ...") : t("حفظ")}
                </button>
            </div>
        </div>
    );
}