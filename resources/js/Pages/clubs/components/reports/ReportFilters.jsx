// components/reports/ReportFilters.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { usePage } from "@inertiajs/react";

export default function ReportFilters({ filters, setFilters, onSearch, onReset, showMemberFilter = false }) {
    const { t } = useTranslation();
    const { app_url } = usePage().props;
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showMemberFilter) {
            fetchMembers();
        }
    }, [showMemberFilter]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${app_url}/members`);
            setMembers(response.data.members || []);
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("نوع التقرير")}
                    </label>
                    <select
                        value={filters.type || ""}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="w-full px-8 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">{t("الكل")}</option>
                        <option value="daily">{t("يومي")}</option>
                        <option value="weekly">{t("اسبوعي")}</option>
                        <option value="monthly">{t("شهري")}</option>
                         <option value="custom">{t("مخصص")}</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("الحالة")}
                    </label>
                    <select
                        value={filters.status || ""}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-8 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">{t("الكل")}</option>
                        <option value="draft">{t("مسودة")}</option>
                        <option value="sent">{t("مرسل")}</option>
                        <option value="under_review">{t("تحت المراجعة")}</option>
                        <option value="approved">{t("مقبول")}</option>
                        <option value="rejected">{t("مرفوض")}</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("من تاريخ")}
                    </label>
                    <input
                        type="date"
                        value={filters.date_from || ""}
                        onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("إلى تاريخ")}
                    </label>
                    <input
                        type="date"
                        value={filters.date_to || ""}
                        onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {showMemberFilter && (
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("العضو")}
                        </label>
                        <select
                            value={filters.member_id || ""}
                            onChange={(e) => setFilters({ ...filters, member_id: e.target.value })}
                            className="w-full px-8 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={loading}
                        >
                            <option value="">{t("جميع الأعضاء")}</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name} {member.member_id ? `(${member.member_id})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-3">
                <button
                    onClick={onReset}
                    className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-1"
                >
                    <XMarkIcon className="h-4 w-4" />
                    {t("إعادة تعيين")}
                </button>
                {/* <button
                    onClick={onSearch}
                    className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1"
                >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    {t("بحث")}
                </button> */}
            </div>
        </div>
    );
}