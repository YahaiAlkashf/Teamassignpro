import React from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function NoteFilters({ search, setSearch, onReset }) {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("ابحث في الملاحظات...")}
                        className="w-full pr-10 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                {search && (
                    <button
                        onClick={onReset}
                        className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-1"
                    >
                        <XMarkIcon className="h-4 w-4" />
                        {t("إعادة تعيين")}
                    </button>
                )}
            </div>
        </div>
    );
}