// pages/admin/Reports.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { PlusIcon, DocumentTextIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import ReportFilters from "./components/reports/ReportFilters";
import ReportCard from "./components/reports/ReportCard";
import ReportForm from "./components/reports/ReportForm";
import ReportDetails from "./components/reports/ReportDetails";

export default function Reports() {
    const { app_url, auth, permissions } = usePage().props;
    const { t } = useTranslation();

    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [filters, setFilters] = useState({
        type: "",
        status: "",
        date_from: "",
        date_to: "",
        member_id: "",
    });

    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        type: "",
        content: "",
        period_start: "",
        period_end: "",
    });
    const [files, setFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const permission = permissions?.permissions;
    const isAdmin = auth.user?.role === 'admin';
    const canManageReports = isAdmin || permission?.manage_reports;
    const showMemberFilter = isAdmin || canManageReports;

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${app_url}/reports`);
            setReports(response.data.reports || []);
            setFilteredReports(response.data.reports || []);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        let filtered = [...reports];

        if (filters.type) {
            filtered = filtered.filter(r => r.type === filters.type);
        }
        if (filters.status) {
            filtered = filtered.filter(r => r.status === filters.status);
        }
        if (filters.date_from) {
            filtered = filtered.filter(r => new Date(r.created_at) >= new Date(filters.date_from));
        }
        if (filters.date_to) {
            filtered = filtered.filter(r => new Date(r.created_at) <= new Date(filters.date_to));
        }
        if (filters.member_id) {
            filtered = filtered.filter(r => r.member_id === parseInt(filters.member_id));
        }

        setFilteredReports(filtered);
        setCurrentPage(1);
    }, [filters, reports]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            const listElement = document.querySelector('.space-y-2');
            if (listElement) {
                listElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setShowDetails(true);
    };

    const handleAddReport = () => {
        setFormData({
            title: "",
            type: "",
            content: "",
            period_start: "",
            period_end: "",
        });
        setFiles([]);
        setExistingFiles([]);
        setFormErrors({});
        setIsEdit(false);
        setShowForm(true);
    };

    const handleEditReport = (report) => {
        setSelectedReport(report);
        setFormData({
            title: report.title || "",
            type: report.type || "",
            content: report.content || "",
            period_start: report.period_start || "",
            period_end: report.period_end || "",
        });
        setFiles([]);
        setExistingFiles(report.files || []);
        setFormErrors({});
        setIsEdit(true);
        setShowForm(true);
    };

    const handleRemoveExistingFile = (fileId) => {
        setExistingFiles(existingFiles.filter(f => f.id !== fileId));
    };

    const handleDeleteReport = async (report) => {
      
            try {
                await axios.delete(`${app_url}/reports/${report.id}`);
                fetchReports();
            } catch (error) {
                console.error("Error deleting report:", error);
            }
        
    };

    const handleSaveReport = async (status) => {
        setSaving(true);
        setFormErrors({});

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('content', formData.content);
            formDataToSend.append('status', status);
            formDataToSend.append('period_start', formData.period_start || '');
            formDataToSend.append('period_end', formData.period_end || '');

            files.forEach((file) => {
                formDataToSend.append('files[]', file);
            });

            let response;
            if (isEdit && selectedReport) {
                formDataToSend.append('_method', 'PUT');
                response = await axios.post(`${app_url}/reports/${selectedReport.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                response = await axios.post(`${app_url}/reports`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            if (response.data.success) {
                setShowForm(false);
                fetchReports();
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            } else {
                console.error("Error saving report:", error);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleReplyUpdated = () => {
        fetchReports();
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const resetFilters = () => {
        setFilters({
            type: "",
            status: "",
            date_from: "",
            date_to: "",
            member_id: "",
        });
    };

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-primary" />
                        {t("التقارير")}
                        {/* <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            ({filteredReports.length})
                        </span> */}
                    </h3>
                   
                        <button
                            onClick={handleAddReport}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 ml-1" />
                            {t("تقرير جديد")}
                        </button>
                 
                </div>

                <ReportFilters
                    filters={filters}
                    setFilters={setFilters}
                    onSearch={() => {}}
                    onReset={resetFilters}
                    showMemberFilter={showMemberFilter}
                />

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="mr-3 text-gray-500 dark:text-gray-400 text-sm">
                            {t("جاري تحميل التقارير...")}
                        </span>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-base font-semibold">{t("لا توجد تقارير")}</p>
                        <p className="text-sm">{t("قم بإنشاء أول تقرير لك الآن")}</p>
                       
                            <button
                                onClick={handleAddReport}
                                className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <PlusIcon className="h-4 w-4 ml-1" />
                                {t("تقرير جديد")}
                            </button>
                        
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {currentReports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onView={handleViewReport}
                                    onEdit={handleEditReport}
                                    onDelete={handleDeleteReport}
                                    isAdmin={isAdmin}
                                    canManage={canManageReports}
                                />
                            ))}
                        </div>

                        {filteredReports.length > 0 && (
                            <div className="mt-4 mb-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4 flex-wrap">
                                <span>
                                    {t("عرض:")} {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredReports.length)} {t("من")} {filteredReports.length}
                                </span>
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
                    </>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <ReportForm
                        report={formData}
                        setReport={setFormData}
                        onSave={handleSaveReport}
                        onClose={() => setShowForm(false)}
                        loading={saving}
                        errors={formErrors}
                        isEdit={isEdit}
                        files={files}
                        setFiles={setFiles}
                        removeFile={removeFile}
                        existingFiles={existingFiles}
                        onRemoveExistingFile={handleRemoveExistingFile}
                    />
                </div>
            )}

            {showDetails && selectedReport && (
                <ReportDetails
                    report={selectedReport}
                    onClose={() => {
                        setShowDetails(false);
                        setSelectedReport(null);
                    }}
                    onReplyUpdated={handleReplyUpdated}
                    isAdmin={isAdmin}
                    canManage={canManageReports}
                />
            )}
        </AdminLayout>
    );
}