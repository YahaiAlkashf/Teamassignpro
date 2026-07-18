import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
    PencilIcon, 
    TrashIcon, 
    CalendarIcon,
    UserCircleIcon,
    BookmarkIcon,
    EyeIcon
} from "@heroicons/react/24/outline";
import { usePage } from "@inertiajs/react";

export default function NoteCard({ note, onEdit, onDelete, onTogglePin, isAdmin, canManage }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const currentMemberId = auth.user?.member?.id;
    const [isExpanded, setIsExpanded] = useState(false);

    const isOwner = note.member_id === currentMemberId;
    const canEdit = isOwner || isAdmin || canManage;

    const getDisplayContent = () => {
        if (isExpanded) return note.content;
        const firstLine = note.content.split('\n')[0];
        if (firstLine.length > 100) {
            return firstLine.substring(0, 100) + '...';
        }
        return firstLine;
    };

    const hasMoreContent = () => {
        const firstLine = note.content.split('\n')[0];
        return note.content.length > 100 || note.content.split('\n').length > 1;
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border ${note.is_pinned ? 'border-yellow-400 dark:border-yellow-600' : 'border-gray-200 dark:border-gray-700'} hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {note.is_pinned && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full flex items-center gap-1">
                                <BookmarkIcon className="h-3 w-3" />
                                {t("مثبتة")}
                            </span>
                        )}
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                            {note.title}
                        </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                            <UserCircleIcon className="h-3 w-3" />
                            {note.member?.name || t("غير معروف")}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(note.created_at).toLocaleString('ar-EG')}
                        </span>
                        {note.updated_at !== note.created_at && (
                            <span className="text-xs text-gray-400">
                                ({t("معدلة")})
                            </span>
                        )}
                    </div>
                    
                    <div className="mt-2">
                        <p className={`text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${!isExpanded ? 'line-clamp-1' : ''}`}>
                            {getDisplayContent()}
                        </p>
                        {hasMoreContent() && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-1 text-xs text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
                            >
                                <EyeIcon className="h-3.5 w-3.5" />
                                {isExpanded ? t("عرض أقل") : t("عرض المزيد")}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {canEdit && (
                        <>
                            <button
                                onClick={() => onEdit(note)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                title={t("تعديل")}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(note)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                title={t("حذف")}
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </>
                    )}
                    {(isAdmin || canManage) && (
                        <button
                            onClick={() => onTogglePin(note)}
                            className={`p-1.5 rounded-lg transition-colors ${note.is_pinned ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title={note.is_pinned ? t("إلغاء التثبيت") : t("تثبيت")}
                        >
                            <BookmarkIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}