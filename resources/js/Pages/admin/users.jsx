import React, { useState, useEffect } from "react";
import AdminLayout from "./layout";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    XMarkIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import AddUserModel from "./components/AddUserModel";
import { useTranslation } from "react-i18next";

export default function CustomersRetailFlow() {
    const { app_url } = usePage().props;
    const { t } = useTranslation();
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [editSubscription, setEditSubscription] = useState(false);
    const [editSubscriptionValue, setEditSubscriptionValue] = useState({
        subscription: "advanced",
        plan: "monthly",
    });
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const showAllCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${app_url}/users`);
            const allUsers = response.data.users || [];
            
            const advancedCustomers = allUsers.filter(
                user => 
                    user.role === 'admin'  
                    
            );
            
            setCustomers(advancedCustomers);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        showAllCustomers();
    }, []);

    const filteredCustomers = customers.filter((customer) => {
        const searchTerm = search.toLowerCase();
        return (
            customer.name?.toLowerCase().includes(searchTerm) ||
            customer.email?.toLowerCase().includes(searchTerm) ||
            customer.company?.company_name?.toLowerCase().includes(searchTerm)
        );
    });

    const filteredNonManagers = filteredCustomers.filter(
        customer => customer.system_type !== 'manager'
    );

    const indexOfLastCustomer = currentPage * rowsPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - rowsPerPage;
    const currentCustomers = filteredNonManagers.slice(
        indexOfFirstCustomer,
        indexOfLastCustomer
    );

    // Open modals
    const handleAddCustomer = () => {
        setAddModal(true);
    };

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setEditModal(true);
    };

    const handleDeleteCustomer = (customer) => {
        setSelectedCustomer(customer);
        setDeleteModal(true);
    };

    const closeModal = () => {
        setAddModal(false);
        setEditModal(false);
        setDeleteModal(false);
        setEditSubscription(false);
        setErrors({});
        setSelectedCustomer(null);
    };

    // Delete Customer
    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${app_url}/users/${selectedCustomer.id}`);
            closeModal();
            showAllCustomers();
            setSelectedCustomer(null);
        } catch (error) {
            console.log(error);
        }
    };

    // تعديل الباقة (بما في ذلك إلغاء التفعيل)
    const handleEditSubscription = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${app_url}/addSubscription/${selectedCustomer.company.id}`,
                {
                    subscription: editSubscriptionValue.subscription,
                    plan: editSubscriptionValue.plan,
                }
            );
            closeModal();
            showAllCustomers();
            setSelectedCustomer(null);
            setEditSubscription(false);
        } catch (error) {
            console.log(error);
            setErrors(error.response?.data?.errors || {});
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModelEditSubscription = (customer) => {
        setSelectedCustomer(customer);
        setEditSubscriptionValue({
            subscription: customer.company?.subscription || "none",
            plan: customer.company?.plan || "monthly"
        });
        setEditSubscription(true);
    };

    // Export functions
    const handleExportPDF = async () => {
        try {
            const response = await axios.get(`${app_url}/admin/export-users-pdf`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'تقرير_المستخدمين.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.log(error);
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await axios.get(`${app_url}/admin/export-users-excel`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'المستخدمين.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.log(error);
        }
    };

    const getSubscriptionBadgeColor = (subscription) => {
        if (subscription === 'advanced') {
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        } else if (subscription === 'none' || !subscription) {
            return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
        }
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    const formatDate = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };


    const getSubscriptionLabel = (subscription) => {
        if (subscription === 'advanced') {
            return t('متقدمة ⭐');
        } else if (subscription === 'none' || !subscription) {
            return t('غير مشترك');
        }
        return subscription || t('غير مشترك');
    };

    return (
        <AdminLayout>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {t("المستخدمين")}
                    </h3>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center">
                            <button
                                onClick={() => setCurrentPage(1)}
                                className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-dark transition-colors"
                            >
                                {t("بحث")}
                            </button>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("ابحث عن مستخدم")}
                                className="w-60 px-3 py-2 border border-gray-300 rounded-l-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportExcel}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                title={t("تصدير Excel")}
                            >
                                <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                                Excel
                            </button>
                            <button
                                onClick={handleAddCustomer}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <PlusIcon className="h-4 w-4 mr-1.5" />
                                {t("اضافة مستخدم")}
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="mr-3 text-gray-500 dark:text-gray-400">{t("جاري التحميل...")}</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed">
                            <colgroup>
                                <col className="w-12" />
                                <col className="w-32" />
                                <col className="w-24" />
                                <col className="w-40" />
                                <col className="w-24" />
                                <col className="w-24" />
                                <col className="w-32" />
                                <col className="w-80" />
                                <col className="w-24" />
                                <col className="w-32" />
                                <col className="w-32" />
                                <col className="w-24" />
                                <col className="w-36" />
                                <col className="w-36" />
                            </colgroup>
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("#")}
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الاسم")}
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الرتبه")}
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("البريد الإلكتروني")}
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الدولة")}
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("اسم الشركة")}
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("شعار الشركة")}
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الباقة")}
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("تاريخ الانتهاء")}
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الخطة")}
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("الإجراءات")}
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        {t("تعديل الباقة")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {currentCustomers.map((customer, idx) => {
                                    const globalIdx = indexOfFirstCustomer + idx + 1;
                                    const isAdvanced = customer.company?.subscription === 'advanced';
                                    const isNone = customer.company?.subscription === 'none' || !customer.company?.subscription;
                                    
                                    return (
                                        <tr
                                            key={customer.id}
                                            className={`transition-colors duration-200 ${
                                                isAdvanced ? 'bg-purple-50/50 dark:bg-purple-900/20' : ''
                                            } ${
                                                isNone ? 'opacity-60' : ''
                                            } ${
                                                idx % 2 === 0
                                                    ? "bg-white dark:bg-gray-800"
                                                    : "bg-gray-50 dark:bg-gray-700"
                                            } hover:bg-gray-100 dark:hover:bg-gray-600`}
                                        >
                                            <td className="px-3 py-3 text-right text-gray-500 dark:text-gray-400">
                                                {globalIdx}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-200 font-medium">
                                                {customer.name}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-300">
                                                {customer.role}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-300 truncate">
                                                {customer.email}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-300">
                                                {customer.country}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-300 truncate">
                                                {customer.company?.company_name || '-'}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-300">
                                                {customer.company?.logo ? (
                                                    <img
                                                        src={`${app_url}/storage/${customer.company.logo}`}
                                                        alt={t("logo")}
                                                        className="h-8 w-10 object-cover object-center rounded border border-gray-200 dark:border-gray-600"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSubscriptionBadgeColor(customer.company?.subscription)}`}>
                                                    {getSubscriptionLabel(customer.company?.subscription)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-300 text-sm">
                                                {formatDate(customer.company?.subscription_expires_at)}
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-300">
                                                {customer.company?.subscription && customer.company?.subscription !== 'none' ? (
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        customer.company?.plan === 'yearly'
                                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                                                            : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200'
                                                    }`}>
                                                        {customer.company?.plan === 'yearly' ? t('سنوي') : t('شهري')}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditCustomer(customer)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                                        title={t("تعديل")}
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCustomer(customer)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                                        title={t("حذف")}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    onClick={() => handleOpenModelEditSubscription(customer)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                                                    title={t("تعديل الباقة")}
                                                >
                                                    <PencilIcon className="h-3 w-3 ml-1" />
                                                    {t("تعديل")}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {currentCustomers.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                {search ? t("لا توجد نتائج مطابقة للبحث") : t("لا يوجد مستخدمين لعرضهم")}
                            </div>
                        )}

                        {filteredNonManagers.length > rowsPerPage && (
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("السابق")}
                                </button>
                                <span className="text-gray-700 dark:text-gray-300">
                                    {t("صفحة")} {currentPage} {t("من")}{" "}
                                    {Math.ceil(filteredNonManagers.length / rowsPerPage)}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={
                                        currentPage ===
                                        Math.ceil(filteredNonManagers.length / rowsPerPage)
                                    }
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t("التالي")}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Customer Modal */}
                {addModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
                        <AddUserModel
                            closeModal={closeModal}
                            mode="add"
                            showAllCustomers={showAllCustomers}
                        />
                    </div>
                )}

                {/* Edit Customer Modal */}
                {editModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
                        <AddUserModel
                            closeModal={closeModal}
                            mode="edit"
                            customer={selectedCustomer}
                            showAllCustomers={showAllCustomers}
                        />
                    </div>
                )}

                {/* Delete Customer Modal */}
                {deleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("هل انت متأكد من حذف هذا المستخدم ؟")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                    {t('سيتم حذف المستخدم "{0}" وجميع بياناته نهائياً.', selectedCustomer?.name)}
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

                {/* Edit Subscription Modal - مع خيار إلغاء الباقة */}
                {editSubscription && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {t("تعديل باقة المستخدم")}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                {/* خيارات الباقة */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("اختر نوع الباقة")}
                                    </label>
                                    <select
                                        value={editSubscriptionValue.subscription}
                                        onChange={(e) =>
                                            setEditSubscriptionValue({
                                                ...editSubscriptionValue,
                                                subscription: e.target.value
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="advanced">
                                            {t("Advanced (متقدمة) ⭐")}
                                        </option>
                                        <option value="none">
                                            {t("❌ إلغاء التفعيل (غير مشترك)")}
                                        </option>
                                    </select>
                                </div>

                                {/* عرض تفاصيل الباقة المتقدمة */}
                                {editSubscriptionValue.subscription === 'advanced' && (
                                    <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">⭐</div>
                                            <h4 className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                                {t("الباقة المتقدمة")}
                                            </h4>
                                            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                                {t("باقة متكاملة تحتوي على جميع المميزات والصلاحيات")}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* عرض تحذير إلغاء التفعيل */}
                                {editSubscriptionValue.subscription === 'none' && (
                                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-300 dark:border-red-700">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">⚠️</div>
                                            <h4 className="text-xl font-bold text-red-700 dark:text-red-300">
                                                {t("إلغاء تفعيل الباقة")}
                                            </h4>
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                {t("سيتم إلغاء جميع مميزات الباقة عن هذا المستخدم")}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* خيار الخطة - يظهر فقط إذا كانت الباقة مفعلة */}
                                {editSubscriptionValue.subscription !== 'none' && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t("نوع الخطة")}
                                        </label>
                                        <select
                                            value={editSubscriptionValue.plan}
                                            onChange={(e) =>
                                                setEditSubscriptionValue({
                                                    ...editSubscriptionValue,
                                                    plan: e.target.value
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            <option value="monthly">{t("شهري")}</option>
                                            <option value="yearly">{t("سنوي")}</option>
                                        </select>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {t("إلغاء")}
                                    </button>
                                    <button
                                        onClick={handleEditSubscription}
                                        disabled={isLoading}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 font-medium ${
                                            editSubscriptionValue.subscription === 'none'
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-primary hover:bg-primary-dark text-white'
                                        }`}
                                    >
                                        {isLoading ? t('جاري الحفظ...') : 
                                            editSubscriptionValue.subscription === 'none' 
                                                ? t('إلغاء التفعيل') 
                                                : t('تأكيد التعديل')
                                        }
                                    </button>
                                </div>

                                {errors.subscription && (
                                    <p className="text-red-500 text-sm mt-2">{errors.subscription}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}