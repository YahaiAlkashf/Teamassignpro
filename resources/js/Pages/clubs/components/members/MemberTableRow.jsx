// components/members/MemberTableRow.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    UserCircleIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import { usePage } from "@inertiajs/react";

export default function MemberTableRow({
    member,
    index,
    onEdit,
    onDelete,
    onViewDetails,
    onAddNote,
    onViewPermissions,
    canManageMembers,
   
}) {
    const { t } = useTranslation();
    const { app_url, auth } = usePage().props;
   // const canManageMembers = auth.user?.role === 'admin' || auth.user?.member?.permission?.manage_members;
    const isAdminUser = member?.role === 'admin';

 
    const hasNote = member?.notes && member.notes.length > 0;
    const renderRatingStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`text-sm ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
                >
                    ★
                </span>
            );
        }
        return <div className="flex">{stars}</div>;
    };

    return (
        <tr className="transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
            <td className="px-3 py-3 text-right text-gray-500 dark:text-gray-400 text-sm">
                {index}
            </td>
            <td className="px-3 py-3 text-right">
                {member.image ? (
                    <img
                        src={`${app_url}/storage/${member.image}`}
                        alt={member.name}
                        className="h-10 w-10 rounded-full object-cover"
                    />
                ) : (
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                )}
            </td>
            <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-200 font-medium text-sm">
                {member.name}
            </td>
            <td className="px-3 py-3 text-right">
                {renderRatingStars(member.rating)}
            </td>
            <td className="px-3 py-3 text-right">
                {member.role != 'admin' && (
                <button
                    onClick={() => onViewPermissions(member)}
                    className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark text-xs transition-colors"
                >
                    {t("عرض الصلاحيات")}
                </button>
                )}
            </td>
            <td className="px-3 py-3 text-center">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <button
                        onClick={() => onViewDetails(member)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title={t("التفاصيل")}
                    >
                        <EyeIcon className="h-4 w-4" />
                    </button>
                    
                
                    {!hasNote && (
                        <button
                            onClick={() => onAddNote(member)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title={t("إضافة ملاحظة")}
                        >
                            <PlusIcon className="h-4 w-4" />
                        </button>
                    )}

                    
                    
                   
                    {canManageMembers && !isAdminUser && (
                        <button
                            onClick={() => onEdit(member)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title={t("تعديل")}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                    )}
                    
                    {canManageMembers && !isAdminUser && (
                        <button
                            onClick={() => onDelete(member)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                            title={t("حذف")}
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}