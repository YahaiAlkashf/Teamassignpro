import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { XMarkIcon, PaperClipIcon, EyeIcon } from "@heroicons/react/24/outline";
import { usePage } from "@inertiajs/react";
import axios from "axios";

export default function ReportForm({ 
    report, 
    setReport, 
    onSave, 
    onClose, 
    loading, 
    errors,
    isEdit = false,
    files,
    setFiles,
    removeFile,
    existingFiles = [],
    onRemoveExistingFile
}) {
    const { t } = useTranslation();
    const { app_url } = usePage().props;
    const [dateError, setDateError] = useState('');

    const validateDates = (periodStart, periodEnd) => {
        if (periodStart && periodEnd) {
            const start = new Date(periodStart);
            const end = new Date(periodEnd);
            if (end < start) {
                setDateError(t('تاريخ النهاية يجب أن يكون بعد تاريخ البداية'));
                return false;
            }
        }
        setDateError('');
        return true;
    };

    const handleDateChange = (field, value) => {
        const newReport = { ...report, [field]: value };
        setReport(newReport);
        
        if (field === 'period_start' || field === 'period_end') {
            validateDates(
                field === 'period_start' ? value : report.period_start,
                field === 'period_end' ? value : report.period_end
            );
        }
    };

    const handleFileUpload = (e) => {
        const uploadedFiles = Array.from(e.target.files);
        const maxSize = 10 * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
                             'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                             'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                             'text/plain', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                             'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'];
        
        const validFiles = [];
        const errorFiles = [];

        uploadedFiles.forEach(file => {
            if (file.size > maxSize) {
                errorFiles.push(`${file.name} (${t('حجمه كبير جداً، الحد الأقصى 10 ميجابايت')})`);
            } else if (!allowedTypes.includes(file.type)) {
                errorFiles.push(`${file.name} (${t('نوع غير مسموح')})`);
            } else {
                validFiles.push(file);
            }
        });

        if (errorFiles.length > 0) {
            alert(`${t('الملفات التالية غير صالحة')}:\n${errorFiles.join('\n')}`);
        }

        if (validFiles.length > 0) {
            setFiles([...files, ...validFiles]);
        }
    };

    const handleRemoveExistingFile = async (fileId) => {
        if (window.confirm(t('هل أنت متأكد من حذف هذا الملف؟'))) {
            try {
                await axios.delete(`${app_url}/reports/files/${fileId}`);
                if (onRemoveExistingFile) {
                    onRemoveExistingFile(fileId);
                }
            } catch (error) {
                console.error("Error deleting file:", error);
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {isEdit ? t("تعديل التقرير") : t("تقرير جديد")}
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
                        {t("عنوان التقرير")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={report.title || ""}
                        onChange={(e) => setReport({ ...report, title: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t("أدخل عنوان التقرير")}
                    />
                    {errors?.title && (
                        <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("نوع التقرير")} <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={report.type || ""}
                        onChange={(e) => setReport({ ...report, type: e.target.value })}
                        className="w-full px-8 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">{t("اختر النوع")}</option>
                        <option value="daily">{t("يومي")}</option>
                        <option value="weekly">{t("اسبوعي")}</option>
                        <option value="monthly">{t("شهري")}</option>
                        <option value="custom">{t("مخصص")}</option>
                    </select>
                    {errors?.type && (
                        <p className="text-red-500 text-xs mt-1">{errors.type[0]}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("بداية الفترة")}
                        </label>
                        <input
                            type="date"
                            value={report.period_start || ""}
                            onChange={(e) => handleDateChange('period_start', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("نهاية الفترة")}
                        </label>
                        <input
                            type="date"
                            value={report.period_end || ""}
                            onChange={(e) => handleDateChange('period_end', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {dateError && (
                            <p className="text-red-500 text-xs mt-1">{dateError}</p>
                        )}
                        {errors?.period_end && (
                            <p className="text-red-500 text-xs mt-1">{errors.period_end[0]}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("محتوى التقرير")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={report.content || ""}
                        onChange={(e) => setReport({ ...report, content: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t("اكتب محتوى التقرير هنا...")}
                    />
                    {errors?.content && (
                        <p className="text-red-500 text-xs mt-1">{errors.content[0]}</p>
                    )}
                </div>

                {isEdit && existingFiles && existingFiles.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("الملفات المرفقة حالياً")}
                        </label>
                        <div className="space-y-1.5">
                            {existingFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex items-center gap-2">
                                        <PaperClipIcon className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {file.file_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`${app_url}/storage/${file.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title={t("عرض الملف")}
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </a>
                                        <button
                                            onClick={() => handleRemoveExistingFile(file.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title={t("حذف الملف")}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isEdit ? t("إضافة ملفات جديدة") : t("الملفات المرفقة")}
                        <span className="text-xs text-gray-400 block">
                            {t("الحد الأقصى: 10 ميجابايت لكل ملف. الأنواع المسموحة: صور، PDF، DOC، DOCX، XLS، XLSX، TXT، PPT، PPTX، ZIP، RAR، 7Z")}
                        </span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            id="report-file-upload"
                        />
                        <label
                            htmlFor="report-file-upload"
                            className="cursor-pointer text-primary hover:text-primary-dark flex flex-col items-center"
                        >
                            <PaperClipIcon className="h-8 w-8 mb-1" />
                            <span className="text-sm font-medium">
                                {t("انقر لرفع الملفات أو اسحبها هنا")}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                                {t("يمكنك رفع صور، مستندات، عروض تقديمية، ملفات مضغوطة")}
                            </span>
                        </label>
                    </div>

                    {files && files.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
                                >
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {file.name || file.file_name}
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
                </div>
            </div>

            {errors?.general && (
                <div className="mx-4 p-2 bg-red-100 text-red-700 rounded-lg text-xs">
                    {errors.general[0]}
                </div>
            )}

            {errors?.files && (
                <div className="mx-4 p-2 bg-red-100 text-red-700 rounded-lg text-xs">
                    {Array.isArray(errors.files) ? errors.files.join('\n') : errors.files}
                </div>
            )}

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {t("إلغاء")}
                </button>
                <button
                    onClick={() => {
                        if (!dateError) {
                            onSave('draft');
                        } else {
                            alert(dateError);
                        }
                    }}
                    disabled={loading || !!dateError}
                    className="flex-1 px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                    {t("حفظ كمسودة")}
                </button>
                <button
                    onClick={() => {
                        if (!dateError) {
                            onSave('sent');
                        } else {
                            alert(dateError);
                        }
                    }}
                    disabled={loading || !!dateError}
                    className="flex-1 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                    {t("إرسال التقرير")}
                </button>
            </div>
        </div>
    );
}