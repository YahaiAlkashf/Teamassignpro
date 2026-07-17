import React, { useState, useEffect } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    XMarkIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    FolderIcon,
    DocumentIcon,
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import ConfirmModal from "./Components/ConfirmModal";

export default function Library() {
    const { app_url, auth, permissions } = usePage().props;
    const { t } = useTranslation();
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [addFolderModal, setAddFolderModal] = useState(false);
    const [renameFolderModal, setRenameFolderModal] = useState(false);
    const [deleteFolderModal, setDeleteFolderModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newFolderName, setNewFolderName] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [uploadFiles, setUploadFiles] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [viewFileModal, setViewFileModal] = useState(false);
    const [viewFileUrl, setViewFileUrl] = useState('');
    const [viewFileName, setViewFileName] = useState('');

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: null,
        title: '',
        message: '',
        confirmText: 'حذف',
        confirmColor: 'bg-red-600 hover:bg-red-700',
        icon: 'warning',
        loading: false,
        errorMessage: null,
    });

    const permission = permissions?.permissions;
    const isAdmin = auth.user?.role === 'admin';
    const canManageLibrary = isAdmin || permission?.add_library;

    const showAllFolders = async () => {
        try {
            const response = await axios.get(`${app_url}/library/folders`);
            setFolders(response.data.folders);
        } catch (error) {
            console.log(error);
        }
    };

    const showFilesInFolder = async (folderId = null) => {
        try {
            const url = folderId
                ? `${app_url}/library/folders/${folderId}/files`
                : `${app_url}/library/files`;

            const response = await axios.get(url);
            setFiles(response.data.files);
            setCurrentFolder(folderId);
            setCurrentPage(1);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        showAllFolders();
        showFilesInFolder();
    }, []);

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentItems = files.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(files.length / rowsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            const tableElement = document.querySelector('.overflow-x-auto');
            if (tableElement) {
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const handleAddFolder = () => {
        setAddFolderModal(true);
    };

    const handleRenameFolder = (folder) => {
        setSelectedFolder(folder);
        setNewFolderName(folder.name);
        setRenameFolderModal(true);
    };

    const handleDeleteFolder = (folder) => {
        setSelectedFolder(folder);
        setDeleteFolderModal(true);
    };

    const handleOpenFolder = (folder) => {
        showFilesInFolder(folder.id);
    };

    const handleUploadFile = () => {
        setUploadModal(true);
    };

    const handleDownloadFile = (file) => {
        const downloadUrl = `${app_url}/library/files/${file.id}/download`;
        window.open(downloadUrl, '_blank');
    };

    const handleViewFile = (file) => {
        const viewUrl = `${app_url}/library/files/${file.id}/view`;
        setViewFileUrl(viewUrl);
        setViewFileName(file.name);
        setViewFileModal(true);
    };

    const showConfirmDeleteFile = (file) => {
        setConfirmModal({
            isOpen: true,
            onConfirm: () => handleDeleteFileConfirm(file),
            title: t("هل أنت متأكد من حذف هذا الملف؟"),
            message: `سيتم حذف الملف "${file.name}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: t("حذف"),
            confirmColor: "bg-red-600 hover:bg-red-700",
            icon: "warning",
            loading: false,
            errorMessage: null,
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false, errorMessage: null }));
    };

    const handleDeleteFileConfirm = async (file) => {
        setConfirmModal(prev => ({ ...prev, loading: true, errorMessage: null }));
        try {
            await axios.delete(`${app_url}/library/files/${file.id}`);
            closeConfirmModal();
            showFilesInFolder(currentFolder);
        } catch (error) {
            console.error("Error deleting file:", error);
            let errorMessage = t("حدث خطأ أثناء حذف الملف");
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join('\n');
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setConfirmModal(prev => ({ 
                ...prev, 
                loading: false,
                errorMessage: errorMessage
            }));
        }
    };

    const closeModal = () => {
        setAddFolderModal(false);
        setRenameFolderModal(false);
        setDeleteFolderModal(false);
        setUploadModal(false);
        setViewFileModal(false);
        setSelectedFolder(null);
        setSelectedFile(null);
        setNewFolderName("");
        setUploadProgress(0);
        setUploading(false);
        setErrors({});
        setUploadFiles([]);
        setViewFileUrl('');
        setViewFileName('');
    };

    const handleSaveAddFolder = async () => {
        try {
            const response = await axios.post(`${app_url}/library/folders`, {
                name: newFolderName,
            });
            showAllFolders();
            closeModal();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleSaveRenameFolder = async () => {
        try {
            await axios.post(`${app_url}/library/folders/${selectedFolder.id}`, {
                name: newFolderName,
                _method: 'PUT'
            });
            showAllFolders();
            closeModal();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${app_url}/library/folders/${selectedFolder.id}`);
            showAllFolders();

            if (currentFolder === selectedFolder.id) {
                showFilesInFolder();
            }

            closeModal();
        } catch (error) {
            console.log(error);
        }
    };

    const handleFileUpload = async () => {
        if (uploadFiles.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();

        for (let i = 0; i < uploadFiles.length; i++) {
            formData.append('files[]', uploadFiles[i]);
        }

        if (currentFolder) {
            formData.append('folder_id', currentFolder);
        }

        try {
            const response = await axios.post(`${app_url}/library/files`, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            showFilesInFolder(currentFolder);
            closeModal();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
            setUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const maxSize = 10 * 1024 * 1024;
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'ppt', 'pptx', 'zip', 'rar', '7z'];
        
        const validFiles = [];
        const errorFiles = [];

        selectedFiles.forEach(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            if (file.size > maxSize) {
                errorFiles.push(`${file.name} (حجمه كبير جداً، الحد الأقصى 10 ميجابايت)`);
            } else if (!allowedExtensions.includes(extension)) {
                errorFiles.push(`${file.name} (نوع غير مسموح)`);
            } else {
                validFiles.push(file);
            }
        });

        if (errorFiles.length > 0) {
            alert(`الملفات التالية غير صالحة:\n${errorFiles.join('\n')}`);
        }

        setUploadFiles(validFiles);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("ar-EG", options);
    };

    const getFileIcon = (file) => {
        const extension = file.extension?.toLowerCase() || '';
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const pdfExtensions = ['pdf'];
        const documentExtensions = ['doc', 'docx', 'xls', 'xlsx', 'txt'];
        const presentationExtensions = ['ppt', 'pptx'];
        const archiveExtensions = ['zip', 'rar', '7z'];

        if (imageExtensions.includes(extension)) {
            return <img src={`${app_url}/storage/${file.path}`} className="h-8 w-8 object-cover rounded" alt={file.name} />;
        } else if (pdfExtensions.includes(extension)) {
            return <span className="text-red-500 text-2xl">📄</span>;
        } else if (documentExtensions.includes(extension)) {
            return <span className="text-blue-500 text-2xl">📝</span>;
        } else if (presentationExtensions.includes(extension)) {
            return <span className="text-orange-500 text-2xl">📊</span>;
        } else if (archiveExtensions.includes(extension)) {
            return <span className="text-yellow-500 text-2xl">📦</span>;
        } else {
            return <DocumentIcon className="h-8 w-8 text-gray-400" />;
        }
    };

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {t("مكتبة الملفات")}
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => showFilesInFolder()}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    !currentFolder
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                }`}
                            >
                                {t("المجلد الرئيسى")}
                            </button>
                        </div>
                        {canManageLibrary && (
                            <>
                                 <button
                                    onClick={handleAddFolder}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1.5" />
                                    {t("إنشاء مجلد")}
                                </button>
                                <button
                                    onClick={handleUploadFile}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <CloudArrowUpIcon className="h-4 w-4 mr-1.5" />
                                    {t("رفع ملف")}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 gap-2">
                    {t("المسار الحالى:")}
                    <span className="font-medium ml-2 gap-2">
                        {currentFolder
                            ? folders.find(f => f.id === currentFolder)?.name
                            : t("المجلد الرئيسي")}
                    </span>
                    <span className="mx-2">•</span>
                    {t("عدد الملفات:")} {files.length}
                </div>

                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("المجلدات")}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {folders.map((folder) => (
                            <div
                                key={folder.id}
                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                onClick={() => handleOpenFolder(folder)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 ">
                                        <FolderIcon className="h-8 w-8 text-yellow-500 mr-2" />
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{folder.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {folder.files_count} {t("ملف")}
                                            </p>
                                        </div>
                                    </div>
                                    {canManageLibrary && (
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRenameFolder(folder);
                                                }}
                                                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFolder(folder);
                                                }}
                                                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {folders.length === 0 && (
                            <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
                                {t("لا توجد مجلدات")}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("الملفات")}</h4>
                    
                    {files.length > 0 && (
                        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                                {t("عرض:")} {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, files.length)} {t("من")} {files.length}
                            </span>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed">
                            <colgroup>
                                <col className="w-16" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/6" />
                                <col className="w-1/6" />
                                <col className="w-1/4" />
                            </colgroup>
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("اسم الملف")}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("تم الرفع من قبل")}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الحجم")}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("تاريخ الرفع")}
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الإجراءات")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {currentItems.map((file, idx) => (
                                    <tr
                                        key={file.id}
                                        className={`transition-colors duration-200 ${
                                            idx % 2 === 0
                                                ? "bg-white dark:bg-gray-800"
                                                : "bg-gray-50 dark:bg-gray-700"
                                        } hover:bg-gray-100 dark:hover:bg-gray-600`}
                                    >
                                        <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                                            {indexOfFirstItem + idx + 1}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 font-medium">
                                            <div className="flex items-center">
                                                {getFileIcon(file)}
                                                <span className="mr-2 truncate">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 font-medium">
                                            <div className="flex items-center">
                                                {file.uploaded_by?.name || t("غير معروف")}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                            {formatFileSize(file.size)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                            {formatDate(file.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleViewFile(file)}
                                                    className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1"
                                                    title={t("عرض الملف")}
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    {t("عرض")}
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadFile(file)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1"
                                                    title={t("تحميل الملف")}
                                                >
                                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                                    {t("تحميل")}
                                                </button>
                                                {canManageLibrary && (
                                                    <button
                                                        onClick={() => showConfirmDeleteFile(file)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                                        title={t("حذف الملف")}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {files.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                {t("لا توجد ملفات لعرضها")}
                            </div>
                        )}
                    </div>

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

                {addFolderModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("إنشاء مجلد جديد")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اسم المجلد")}
                                    </label>
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.name[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleSaveAddFolder}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    {t("إنشاء")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {renameFolderModal && selectedFolder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("إعادة تسمية المجلد")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اسم المجلد")}
                                    </label>
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.name[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleSaveRenameFolder}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                >
                                    {t("حفظ")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {deleteFolderModal && selectedFolder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("هل أنت متأكد من حذف هذا المجلد؟")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {t("سيتم حذف المجلد")}{" "}
                                    <span className="font-bold">
                                        {selectedFolder.name}
                                    </span>{" "}
                                    {t("وجميع الملفات بداخله بشكل دائم.")}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {t("إلغاء")}
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        {t("حذف")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {uploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("رفع ملفات جديدة")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اختر الملفات")}
                                        <span className="text-xs text-gray-400 block">
                                            {t("الحد الأقصى: 10 ميجابايت لكل ملف. الأنواع المسموحة: صور، PDF، DOC، DOCX، XLS، XLSX، TXT، PPT، PPTX، ZIP، RAR، 7Z")}
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        disabled={uploading}
                                    />
                                    {errors.files && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.files[0]}
                                        </p>
                                    )}
                                </div>

                                {uploadFiles.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {t("الملفات المحددة:")}
                                        </p>
                                        <ul className="text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
                                            {uploadFiles.map((file, index) => (
                                                <li key={index} className="truncate py-1 border-b border-gray-100 dark:border-gray-600">
                                                    {file.name} ({formatFileSize(file.size)})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {uploading && (
                                    <div className="mb-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div
                                                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                                            {t("جاري الرفع:")} {uploadProgress}%
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    disabled={uploading}
                                >
                                    {t("إلغاء")}
                                </button>
                                <button
                                    onClick={handleFileUpload}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                                    disabled={uploading || uploadFiles.length === 0}
                                >
                                    {uploading ? (
                                        <>
                                            <span>{t("جاري الرفع...")}</span>
                                        </>
                                    ) : (
                                        <>
                                            <CloudArrowUpIcon className="h-4 w-4 ml-1.5" />
                                            {t("رفع الملفات")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {viewFileModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">
                                    {t("عرض الملف:")} {viewFileName}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-transform hover:rotate-90"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                                <iframe
                                    src={viewFileUrl}
                                    className="w-full h-full min-h-[500px] rounded-lg"
                                    title={viewFileName}
                                    frameBorder="0"
                                />
                            </div>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("إغلاق")}
                                </button>
                                <a
                                    href={viewFileUrl}
                                    download={viewFileName}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-center"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4 inline ml-1.5" />
                                    {t("تحميل الملف")}
                                </a>
                            </div>
                        </div>
                    </div>
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
                    errorMessage={confirmModal.errorMessage}
                />
            </div>
        </AdminLayout>
    );
}