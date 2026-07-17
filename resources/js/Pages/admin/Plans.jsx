import React, { useState, useEffect } from "react";
import AdminLayout from "./layout";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import {
    XMarkIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const emptyCouponForm = {
    code: "",
    plan_id: "",
    price_in_egp: "",
    price_outside_egp: "",
    plan: "monthly"
};

export default function Plans() {
    const { auth, app_url } = usePage().props;
    const [coupons, setCoupons] = useState([]);
    const [plans, setPlans] = useState([]);
    const { t } = useTranslation();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [isAddCouponModalOpen, setAddCouponModalOpen] = useState(false);
    const [isEditCouponModalOpen, setEditCouponModalOpen] = useState(false);
    const [isDeleteCouponModalOpen, setDeleteCouponModalOpen] = useState(false);
    const [isEditPlansModalOpen, setEditPlansModalOpen] = useState(false);

    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [couponFormData, setCouponFormData] = useState(emptyCouponForm);
    const [plansFormData, setPlansFormData] = useState({
        advanced: { 
            price_in_egp: "", 
            price_outside_egp: "",
            price_year_in_egp: "",
            price_year_outside_egp: "" 
        }
    });

    useEffect(() => {
        showAllPlans();
    }, []);

    const showAllPlans = async () => {
        try {
            const response = await axios.get(`${app_url}/plans`);
            const allPlans = response.data.plans || [];
            setPlans(allPlans);
            const allCoupons = [];
            allPlans.forEach(plan => {
                if (plan.coupons && plan.coupons.length > 0) {
                    plan.coupons.forEach(coupon => {
                        allCoupons.push({
                            ...coupon,
                            plan_name: plan.name
                        });
                    });
                }
            });
            setCoupons(allCoupons);
        } catch (error) {
            console.log(error);
        }
    };

    const sendDataAddCoupon = async () => {
        setIsLoading(true);
        setErrors({});

        try {
            const response = await axios.post(`${app_url}/coupons`, {
                code: couponFormData.code,
                plan_id: couponFormData.plan_id,
                price_in_egp: couponFormData.price_in_egp,
                price_outside_egp: couponFormData.price_outside_egp,
                plan: couponFormData.plan
            });

            if (response.data.success) {
                closeModal();
                showAllPlans();
            } else {
                if (response.data.errors) {
                    setErrors(response.data.errors);
                }
                console.error(t("فشل في إضافة الكوبون:"), response.data.errors);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error(t("خطأ في إضافة الكوبون:"), error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sendDataUpdateCoupon = async () => {
        setIsLoading(true);
        setErrors({});

        try {
            const response = await axios.put(`${app_url}/coupons/${selectedCoupon.id}`, {
                code: couponFormData.code,
                plan_id: couponFormData.plan_id,
                price_in_egp: couponFormData.price_in_egp,
                price_outside_egp: couponFormData.price_outside_egp,
                plan: couponFormData.plan
            });

            if (response.data.success) {
                closeModal();
                showAllPlans();
            } else {
                if (response.data.errors) {
                    setErrors(response.data.errors);
                }
                console.error(t("فشل في تحديث الكوبون:"), response.data.errors);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error(t("خطأ في تحديث الكوبون:"), error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sendDataDeleteCoupon = async () => {
        setIsLoading(true);

        try {
            const response = await axios.delete(`${app_url}/coupons/${selectedCoupon.id}`);

            if (response.data.success) {
                closeModal();
                showAllPlans();
            } else {
                console.error(t("فشل في حذف الكوبون:"), response.data.errors);
            }
        } catch (error) {
            console.error(t("خطأ في حذف الكوبون:"), error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendDataUpdatePlans = async () => {
        setIsLoading(true);
        setErrors({});

        try {
            const updates = [];
            for (const [planName, planData] of Object.entries(plansFormData)) {
                // البحث عن الباقة بالاسم أو إنشاؤها إذا لم توجد
                let plan = plans.find(p => p.name === planName);
                
                if (plan) {
                    // تحديث الباقة الموجودة
                    const response = await axios.put(`${app_url}/plans/${plan.id}`, {
                        name: planName,
                        price_in_egp: planData.price_in_egp,
                        price_outside_egp: planData.price_outside_egp,
                        price_year_in_egp: planData.price_year_in_egp,
                        price_year_outside_egp: planData.price_year_outside_egp
                    });
                    updates.push(response);
                } else {
                    // إنشاء باقة جديدة إذا لم توجد
                    const response = await axios.post(`${app_url}/plans`, {
                        name: planName,
                        price_in_egp: planData.price_in_egp,
                        price_outside_egp: planData.price_outside_egp,
                        price_year_in_egp: planData.price_year_in_egp,
                        price_year_outside_egp: planData.price_year_outside_egp
                    });
                    updates.push(response);
                }
            }

            const allSuccess = updates.every(update => update.data.success);

            if (allSuccess) {
                closeModal();
                showAllPlans();
            } else {
                console.error(t("فشل في تحديث الباقات"));
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error(t("خطأ في تحديث الباقات:"), error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const openAddCouponModal = () => {
        // تعيين الباقة المتقدمة كقيمة افتراضية
        const advancedPlan = plans.find(p => p.name === "advanced");
        setCouponFormData({
            ...emptyCouponForm,
            plan_id: advancedPlan ? advancedPlan.id : ""
        });
        setErrors({});
        setAddCouponModalOpen(true);
    };

    const openEditCouponModal = (coupon) => {
        setSelectedCoupon(coupon);
        setCouponFormData({
            code: coupon.code,
            plan_id: coupon.plan_id,
            price_in_egp: coupon.price_in_egp,
            price_outside_egp: coupon.price_outside_egp,
            plan: coupon.plan
        });
        setErrors({});
        setEditCouponModalOpen(true);
    };

    const openDeleteCouponModal = (coupon) => {
        setSelectedCoupon(coupon);
        setDeleteCouponModalOpen(true);
    };

    const openEditPlansModal = () => {
        // التأكد من وجود الباقة المتقدمة
        const advancedPlan = plans.find(p => p.name === "advanced");
        
        if (advancedPlan) {
            setPlansFormData({
                advanced: {
                    price_in_egp: advancedPlan.price_in_egp || "",
                    price_outside_egp: advancedPlan.price_outside_egp || "",
                    price_year_in_egp: advancedPlan.price_year_in_egp || "",
                    price_year_outside_egp: advancedPlan.price_year_outside_egp || "",
                }
            });
        } else {
            // إذا لم توجد الباقة، نضع قيم فارغة
            setPlansFormData({
                advanced: {
                    price_in_egp: "",
                    price_outside_egp: "",
                    price_year_in_egp: "",
                    price_year_outside_egp: "",
                }
            });
        }
        setErrors({});
        setEditPlansModalOpen(true);
    };

    const closeModal = () => {
        setAddCouponModalOpen(false);
        setEditCouponModalOpen(false);
        setDeleteCouponModalOpen(false);
        setEditPlansModalOpen(false);
        setSelectedCoupon(null);
        setErrors({});
    };

    const handleSaveCoupon = () => {
        if (selectedCoupon) {
            sendDataUpdateCoupon();
        } else {
            sendDataAddCoupon();
        }
    };

    const handleDeleteCoupon = () => {
        sendDataDeleteCoupon();
    };

    const handleSavePlans = () => {
        sendDataUpdatePlans();
    };

    const renderError = (field) => {
        if (errors[field]) {
            return (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                    <ExclamationCircleIcon className="h-4 w-4 ml-1" />
                    {errors[field][0]}
                </div>
            );
        }
        return null;
    };

    const advancedPlan = plans.find(plan => plan.name === "advanced");

    return (
        <AdminLayout auth={auth}>
            <div className="mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {t("إدارة الكوبونات والباقات")}
                    </h3>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={openAddCouponModal}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 ml-1.5" />
                            {t("إضافة كوبون خصم")}
                        </button>
                        <button
                            onClick={openEditPlansModal}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <PencilIcon className="h-4 w-4 ml-1.5" />
                            {t("تعديل الباقة المتقدمة")}
                        </button>
                    </div>
                </div>

                {/* Coupons Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("كود الكوبون")}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الباقة المستهدفة")}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("نوع الباقة")}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("السعر (داخل مصر)")}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("السعر (خارج مصر)")}</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t("الإجراءات")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {coupons.map((coupon, idx) => (
                                <tr key={coupon.id} className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"} hover:bg-gray-100 dark:hover:bg-gray-600`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{coupon.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{coupon.plan_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{coupon.plan}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{coupon.price_in_egp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{coupon.price_outside_egp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => openEditCouponModal(coupon)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => openDeleteCouponModal(coupon)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {coupons.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {t("لا توجد كوبونات لعرضها حالياً.")}
                        </div>
                    )}
                </div>

                {/* Advanced Plan Details */}
                <div className="mt-10">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t("أسعار الباقة المتقدمة الحالية")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        {advancedPlan ? (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-500">
                                <h4 className="font-semibold text-xl text-gray-800 dark:text-gray-200 mb-3">{t("الباقة المتقدمة (Advanced)")}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t("الشهرية داخل مصر")}</p>
                                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{advancedPlan.price_in_egp} {t("ج.م")}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t("الشهرية خارج مصر")}</p>
                                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">${advancedPlan.price_outside_egp}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t("السنوية داخل مصر")}</p>
                                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{advancedPlan.price_year_in_egp} {t("ج.م")}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t("السنوية خارج مصر")}</p>
                                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">${advancedPlan.price_year_outside_egp}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-2 border-yellow-200 dark:border-yellow-500">
                                <p className="text-yellow-800 dark:text-yellow-200">
                                    {t("لم يتم إعداد الباقة المتقدمة بعد. يرجى النقر على زر 'تعديل الباقة المتقدمة' لإضافتها.")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Coupon Modal */}
                {(isAddCouponModalOpen || isEditCouponModalOpen) && (
                    <FormModal
                        title={isAddCouponModalOpen ? t("إضافة كوبون جديد") : t("تعديل الكوبون")}
                        onClose={closeModal}
                        onSave={handleSaveCoupon}
                        isLoading={isLoading}
                        t={t}
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("كود الكوبون")}</label>
                            <input
                                type="text"
                                value={couponFormData.code}
                                onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                                }`}
                            />
                            {renderError('code')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("الباقة")}</label>
                            <select
                                value={couponFormData.plan_id}
                                onChange={(e) => setCouponFormData({ ...couponFormData, plan_id: e.target.value })}
                                className={`w-full px-8 py-2 border rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    errors.plan_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                                }`}
                            >
                                <option value="">{t("اختر الباقة")}</option>
                                {plans.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name === "advanced" ? t("الباقة المتقدمة") : plan.name}</option>
                                ))}
                            </select>
                            {renderError('plan_id')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("نوع الباقة")}</label>
                            <select
                                value={couponFormData.plan}
                                onChange={(e) => setCouponFormData({ ...couponFormData, plan: e.target.value })}
                                className={`w-full px-8 py-2 border rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    errors.plan ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                                }`}
                            >
                                <option value="monthly">{t("شهري")}</option>
                                <option value="yearly">{t("سنوي")}</option>
                            </select>
                            {renderError('plan')}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("السعر بعد الخصم (داخل مصر)")}</label>
                                <input
                                    type="number"
                                    value={couponFormData.price_in_egp}
                                    onChange={(e) => setCouponFormData({ ...couponFormData, price_in_egp: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                        errors.price_in_egp ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                                    }`}
                                />
                                {renderError('price_in_egp')}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("السعر بعد الخصم (خارج مصر)")}</label>
                                <input
                                    type="number"
                                    value={couponFormData.price_outside_egp}
                                    onChange={(e) => setCouponFormData({ ...couponFormData, price_outside_egp: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                        errors.price_outside_egp ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                                    }`}
                                />
                                {renderError('price_outside_egp')}
                            </div>
                        </div>
                    </FormModal>
                )}

                {/* Edit Plans Modal - مخصص للباقة المتقدمة فقط */}
                {isEditPlansModalOpen && (
                    <FormModal
                        title={t("تعديل أسعار الباقة المتقدمة")}
                        onClose={closeModal}
                        onSave={handleSavePlans}
                        isLoading={isLoading}
                        t={t}
                    >
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-xl text-gray-800 dark:text-gray-200 mb-4 text-center">
                                    {t("الباقة المتقدمة (Advanced)")}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t("السعر الشهري داخل مصر")}
                                        </label>
                                        <input
                                            type="number"
                                            value={plansFormData.advanced?.price_in_egp || ""}
                                            onChange={(e) => setPlansFormData({
                                                ...plansFormData,
                                                advanced: {
                                                    ...plansFormData.advanced,
                                                    price_in_egp: e.target.value
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder={t("أدخل السعر")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t("السعر الشهري خارج مصر")}
                                        </label>
                                        <input
                                            type="number"
                                            value={plansFormData.advanced?.price_outside_egp || ""}
                                            onChange={(e) => setPlansFormData({
                                                ...plansFormData,
                                                advanced: {
                                                    ...plansFormData.advanced,
                                                    price_outside_egp: e.target.value
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder={t("أدخل السعر")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t("السعر السنوي داخل مصر")}
                                        </label>
                                        <input
                                            type="number"
                                            value={plansFormData.advanced?.price_year_in_egp || ""}
                                            onChange={(e) => setPlansFormData({
                                                ...plansFormData,
                                                advanced: {
                                                    ...plansFormData.advanced,
                                                    price_year_in_egp: e.target.value
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder={t("أدخل السعر")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t("السعر السنوي خارج مصر")}
                                        </label>
                                        <input
                                            type="number"
                                            value={plansFormData.advanced?.price_year_outside_egp || ""}
                                            onChange={(e) => setPlansFormData({
                                                ...plansFormData,
                                                advanced: {
                                                    ...plansFormData.advanced,
                                                    price_year_outside_egp: e.target.value
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder={t("أدخل السعر")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FormModal>
                )}

                {/* Delete Coupon Modal */}
                {isDeleteCouponModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t("هل أنت متأكد من حذف هذا الكوبون؟")}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                    {t('لا يمكن التراجع عن هذا الإجراء. سيتم حذف الكوبون "{0}" نهائياً.', selectedCoupon?.code)}
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        {t("إلغاء")}
                                    </button>
                                    <button
                                        onClick={handleDeleteCoupon}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? t('جاري الحذف...') : t('حذف')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

// Generic Modal Component for Forms
function FormModal({ title, children, onClose, onSave, isLoading = false, t }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {children}
                </div>
                <div className="flex gap-3 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t("إلغاء")}
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {isLoading ? t('جاري الحفظ...') : t('حفظ')}
                    </button>
                </div>
            </div>
        </div>
    );
}