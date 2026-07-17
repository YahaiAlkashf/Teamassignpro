import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function AddNoteModal({ member, onClose, onSave }) {
    const { t } = useTranslation();
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!note.trim()) {
            setError(t("يرجى كتابة الملاحظة"));
            return;
        }

        setLoading(true);
        setError("");
        try {
            await onSave(member.id, note);
            onClose();
        } catch (err) {
            setError(err.message || t("حدث خطأ أثناء إضافة الملاحظة"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {t("إضافة ملاحظة")}
                    </h3>
                    <button
                        onClick={onClose}
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
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t("اكتب الملاحظة هنا...")}
                    />
                    {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        {t("إلغاء")}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                    >
                        {loading ? t("جاري الحفظ...") : t("إضافة")}
                    </button>
                </div>
            </div>
        </div>
    );
}