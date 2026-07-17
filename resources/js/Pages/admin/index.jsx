import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    UserGroupIcon,
    ShoppingBagIcon,
    ReceiptPercentIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    StarIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "./layout";
import { CurrencyContext } from "../../Context/CurrencyContext ";
import { useTranslation } from "react-i18next";

export default function Index() {
    const { t } = useTranslation();
    const { app_url } = usePage().props;
    const [customers, setCustomers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currency } = useContext(CurrencyContext);
    const [advancedSubscriptions, setAdvancedSubscriptions] = useState([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState([]);
    const [expiredSubscriptions, setExpiredSubscriptions] = useState([]);
    const { auth } = usePage().props;

    const showAllCustomers = async () => {
        try {
            const response = await axios.get(`${app_url}/customers`);
            const allCustomers = response.data.customers || [];
            setCustomers(allCustomers);
            
            console.log("All Customers:", allCustomers); // للتصحيح
            
            // تصفية العملاء المشتركين في الباقة المتقدمة
            // نفحص جميع الحالات الممكنة للاشتراك
            const advanced = allCustomers.filter(customer => {
                // التحقق من subscription في company
                const subscription = customer.company?.subscription || 
                                   customer.company?.subscription_type || 
                                   customer.subscription ||
                                   customer.subscription_type;
                
                console.log(`Customer ${customer.name}: subscription =`, subscription); // للتصحيح
                
                return subscription && subscription.toLowerCase() === 'advanced';
            });
            
            console.log("Advanced Customers:", advanced); // للتصحيح
            setAdvancedSubscriptions(advanced);

            // تصفية الاشتراكات النشطة (تاريخ الانتهاء في المستقبل)
            const now = new Date();
            const active = allCustomers.filter(customer => {
                // جلب تاريخ الانتهاء من عدة أماكن محتملة
                const expiryDateStr = customer.company?.subscription_expires_at || 
                                     customer.company?.expires_at ||
                                     customer.subscription_expires_at ||
                                     customer.expires_at;
                
                if (!expiryDateStr) return false;
                
                try {
                    const expiryDate = new Date(expiryDateStr);
                    return expiryDate > now;
                } catch (e) {
                    return false;
                }
            });
            setActiveSubscriptions(active);

            // تصفية الاشتراكات المنتهية
            const expired = allCustomers.filter(customer => {
                const expiryDateStr = customer.company?.subscription_expires_at || 
                                     customer.company?.expires_at ||
                                     customer.subscription_expires_at ||
                                     customer.expires_at;
                
                if (!expiryDateStr) return false;
                
                try {
                    const expiryDate = new Date(expiryDateStr);
                    return expiryDate <= now;
                } catch (e) {
                    return false;
                }
            });
            setExpiredSubscriptions(expired);

        } catch (error) {
            console.log("Error fetching customers:", error);
        }
    };

    const showAllUsers = async () => {
        try {
            const response = await axios.get(`${app_url}/users`);
            const allUsers = response.data.users || [];
            setUsers(allUsers);
            
            console.log("All Users:", allUsers); // للتصحيح
            
            // دمج المستخدمين الذين لديهم اشتراكات مع العملاء
            const usersWithSubscriptions = allUsers.filter(user => {
                const subscription = user.company?.subscription || 
                                   user.company?.subscription_type || 
                                   user.subscription ||
                                   user.subscription_type;
                
                return subscription && subscription.toLowerCase() === 'advanced';
            });
            
            // إضافة المستخدمين إلى قائمة العملاء إذا لم يكونوا موجودين بالفعل
            // هذا يحل مشكلة أن بعض المستخدمين قد لا يكونون في قائمة العملاء
            setAdvancedSubscriptions(prev => {
                const existingIds = new Set(prev.map(c => c.id));
                const newUsers = usersWithSubscriptions.filter(u => !existingIds.has(u.id));
                return [...prev, ...newUsers];
            });

        } catch (error) {
            console.log("Error fetching users:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    showAllCustomers(),
                    showAllUsers(),
                ]);
            } catch (error) {
                console.log("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <div className="px-3 max-w-7xl min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    // حساب النسب المئوية للتوزيع
    const totalCustomers = customers.length || 1;
    const totalUsers = users.length || 1;
    const advancedCount = advancedSubscriptions.length;
    const activeCount = activeSubscriptions.length;
    const expiredCount = expiredSubscriptions.length;
    
    const advancedPercentage = Math.round((advancedCount / totalCustomers) * 100);
    const activePercentage = Math.round((activeCount / totalCustomers) * 100);
    const expiredPercentage = Math.round((expiredCount / totalCustomers) * 100);

    return (
        <AdminLayout>
            <div className="px-3 max-w-7xl min-h-screen">
                {/* Header with Date */}
                <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-primary to-primary-dark rounded-2xl text-white">
                    <div className="flex items-center">
                        <CalendarDaysIcon className="h-8 w-8 ml-3" />
                        <div>
                            <p className="text-primary-light">{t("لوحة التحكم")}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-80">{t("التاريخ الحالي")}</div>
                        <div className="font-medium">
                            {new Date().toLocaleDateString("ar-EG", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 flex flex-col items-center justify-center transform transition duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                        <div className="absolute top-4 left-4 bg-blue-400 bg-opacity-20 p-2 rounded-full">
                            <UserGroupIcon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-semibold tracking-wide">
                            {t("إجمالي العملاء")}
                        </span>
                        <span className="text-3xl font-bold mt-2">
                            {customers.length}
                        </span>
                        <span className="text-sm opacity-80 mt-1">
                            {t("عميل")}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white p-6 flex flex-col items-center justify-center transform transition duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up delay-100">
                        <div className="absolute top-4 left-4 bg-green-400 bg-opacity-20 p-2 rounded-full">
                            <UsersIcon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-semibold tracking-wide">
                            {t("إجمالي المستخدمين")}
                        </span>
                        <span className="text-3xl font-bold mt-2">
                            {users.length}
                        </span>
                        <span className="text-sm opacity-80 mt-1">
                            {t("مستخدم")}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 flex flex-col items-center justify-center transform transition duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up delay-200">
                        <div className="absolute top-4 left-4 bg-purple-400 bg-opacity-20 p-2 rounded-full">
                            <StarIcon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-semibold tracking-wide">
                            {t("الباقة المتقدمة")}
                        </span>
                        <span className="text-3xl font-bold mt-2">
                            {advancedCount}
                        </span>
                        <span className="text-sm opacity-80 mt-1">
                            {t("عميل")} • {advancedPercentage}%
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>
                </div>

                {/* Subscription Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold mb-6 text-center text-gray-800">
                            {t("حالة الاشتراكات")}
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-xl border-r-4 border-green-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-green-700">{t("اشتراكات نشطة")}</h4>
                                        <p className="text-sm text-green-500">{t("تاريخ الانتهاء في المستقبل")}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-green-600">{activeCount}</span>
                                        <span className="text-sm text-green-500 block">{t("عميل")}</span>
                                    </div>
                                </div>
                                <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-600 h-2 rounded-full transition-all duration-1000" 
                                        style={{ width: `${activePercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-red-50 p-4 rounded-xl border-r-4 border-red-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-red-700">{t("اشتراكات منتهية")}</h4>
                                        <p className="text-sm text-red-500">{t("تاريخ الانتهاء في الماضي")}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-red-600">{expiredCount}</span>
                                        <span className="text-sm text-red-500 block">{t("عميل")}</span>
                                    </div>
                                </div>
                                <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                                    <div 
                                        className="bg-red-600 h-2 rounded-full transition-all duration-1000" 
                                        style={{ width: `${expiredPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold mb-6 text-center text-gray-800">
                            {t("توزيع الباقات")}
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-purple-50 p-4 rounded-xl border-r-4 border-purple-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-purple-700">⭐ {t("الباقة المتقدمة")}</h4>
                                        <p className="text-sm text-purple-500">{t("جميع المميزات والصلاحيات")}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-purple-600">{advancedCount}</span>
                                        <span className="text-sm text-purple-500 block">{t("عميل")}</span>
                                    </div>
                                </div>
                                <div className="mt-2 w-50 bg-purple-200 rounded-full h-2">
                                    <div 
                                        className="bg-purple-600 h-2 rounded-full transition-all duration-1000" 
                                        style={{ width: `${advancedPercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border-r-4 border-gray-400">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-gray-700">{t("غير مشترك")}</h4>
                                        <p className="text-sm text-gray-500">{t("بدون باقة نشطة")}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-gray-600">
                                            {customers.length - advancedCount}
                                        </span>
                                        <span className="text-sm text-gray-500 block">{t("عميل")}</span>
                                    </div>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-gray-500 h-2 rounded-full transition-all duration-1000" 
                                        style={{ width: `${100 - advancedPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 mb-10">
                    <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
                        {t("إجراءات سريعة")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button 
                            onClick={() => window.location.href = route('customers.index')}
                            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all hover:scale-105 text-center border border-gray-100"
                        >
                            <UserGroupIcon className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700">{t("إدارة العملاء")}</span>
                        </button>
                        <button 
                            onClick={() => window.location.href = route('users.index')}
                            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all hover:scale-105 text-center border border-gray-100"
                        >
                            <UsersIcon className="h-8 w-8 mx-auto text-green-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700">{t("إدارة المستخدمين")}</span>
                        </button>
                        <button 
                            onClick={() => window.location.href = route('plans.index')}
                            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all hover:scale-105 text-center border border-gray-100"
                        >
                            <StarIcon className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700">{t("إدارة الباقات")}</span>
                        </button>
                        <button 
                            onClick={() => window.location.href = route('subscriptions.index')}
                            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all hover:scale-105 text-center border border-gray-100"
                        >
                            <ReceiptPercentIcon className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700">{t("الاشتراكات")}</span>
                        </button>
                    </div>
                </div>

                {/* Animations */}
                <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(40px) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.7s cubic-bezier(0.4,0,0.2,1) both;
                }
                .delay-100 {
                    animation-delay: 0.1s;
                }
                .delay-200 {
                    animation-delay: 0.2s;
                }
                .delay-300 {
                    animation-delay: 0.3s;
                }
            `}</style>
            </div>
        </AdminLayout>
    );
}