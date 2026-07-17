import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function Plans() {
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [country, setCountry] = useState(null);
    const [isEgypt, setIsEgypt] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [allPlans, setAllPlans] = useState([]);
    const [type, setType] = useState("monthly");
    const [coupons, setCoupons] = useState([]);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [discountedPrice, setDiscountedPrice] = useState(null);
    
    const { auth, app_url } = usePage().props;
    const { t } = useTranslation();

    const showAllPlans = async () => {
        try {
            const response = await axios.get(`${app_url}/plans`);
            setAllPlans(response.data.plans);
            
            const allCoupons = [];
            response.data.plans.forEach(plan => {
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

    const handleSubscribe = (plan) => {
        setSelectedPlan(plan);
        setShowModal(true);
        setCouponError("");
        setCouponSuccess("");
    };

    const applyCoupon = async (plan) => {
        if (!couponCode.trim()) {
            setCouponError(t("يرجى إدخال كود الكوبون"));
            return;
        }
        setSelectedPlan(plan);
        setIsApplyingCoupon(true);
        setCouponError("");
        setCouponSuccess("");
        try {

            const response = await axios.post(`${app_url}/subscription/coupons`, {
                code: couponCode,
                planName: selectedPlan?.name,
                type: type
            });

            if (response.data.success) {
                if (response.data.free_subscription) {
                    setAppliedCoupon({ 
                        code: couponCode,
                        price_in_egp: 0,
                        price_outside_egp: 0,
                        is_free: true
                    });
                    setDiscountedPrice(0);
                    setCouponSuccess(t("كوبون مجاني! سيتم تفعيل الباقة مجاناً"));
                } else {
                    const coupon = response.data.coupon;
                    setAppliedCoupon(coupon);
                    setCouponSuccess(t("تم تطبيق الكوبون بنجاح!"));
                    
                    const newPrice = isEgypt ? coupon.price_in_egp : coupon.price_outside_egp;
                    setDiscountedPrice(newPrice);
                }
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMsg = error.response.data.errors.code;
                if (Array.isArray(errorMsg)) {
                    setCouponError(errorMsg[0]);
                } else {
                    setCouponError(t("كود الكوبون غير صالح"));
                }
            } else {
                setCouponError(t("حدث خطأ أثناء التحقق من الكوبون"));
            }
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        showAllPlans();
        fetch("https://ipapi.co/json/")
            .then((res) => res.json())
            .then((data) => {
                setCountry(data.country_name);
                setIsEgypt(data.country_code === "EG");
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
            });
    }, []);

    const advancedPlan = allPlans.find(plan => plan.name === "advanced");

    const plan = {
        name2: t("الباقة المتقدمة"),
        name: "advanced",
        description: t("باقة متكاملة لإدارة الشركات والمؤسسات مع كافة الأدوات والصلاحيات المتقدمة"),
        priceInsideEgypt: advancedPlan?.price_in_egp || 0,
        priceInsideEgyptYearly: advancedPlan?.price_year_in_egp || 0,
        priceOutsideEgypt: advancedPlan?.price_outside_egp || 0,
        priceOutsideEgyptYearly: advancedPlan?.price_year_outside_egp || 0,
        icon: (
            <svg
                className="w-16 h-16 mx-auto text-violet-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                />
            </svg>
        ),
        features: [
            t("إدارة الفرق والمشاريع بشكل متكامل"),
            t("صلاحيات متقدمة للتحكم الكامل"),
            t("توزيع المهام ومتابعة الأداء"),
            t("إشعارات فورية للتحديثات والمهام"),
            t("دعم فني 24/7 عبر واتساب"),
            t("اضافة عدد غير محدود من الموظفين(المستخدمين)"),
            t("تخطيط الفعاليات والأنشطة"),
            t("مكتبة مركزية للملفات"),
            t("تقارير وإحصائيات متقدمة"),
            t("لوحة تحكم شاملة وسهلة الاستخدام"),
            t("نظام إدارة الملاحظات"),
            t("لوحة الشرف لتحفيز الموظفين"),
            t("إدارة الإعلانات الداخلية"),
            t("تكامل مع أدوات خارجية عبر API"),
        ]
    };

    const getFinalPrice = () => {
        if (!advancedPlan) return 0;
        
        if (discountedPrice !== null) {
            return discountedPrice;
        }
        
        if (type === 'yearly') {
            return isEgypt ? plan.priceInsideEgyptYearly : plan.priceOutsideEgyptYearly;
        } else {
            return isEgypt ? plan.priceInsideEgypt : plan.priceOutsideEgypt;
        }
    };

    const getOriginalPrice = () => {
        if (!advancedPlan) return 0;
        return type === 'yearly' 
            ? (isEgypt ? plan.priceInsideEgyptYearly : plan.priceOutsideEgyptYearly)
            : (isEgypt ? plan.priceInsideEgypt : plan.priceOutsideEgypt);
    };

    const hasDiscount = () => {
        return discountedPrice !== null && discountedPrice < getOriginalPrice();
    };

    const isFreeCoupon = () => {
        return appliedCoupon && (appliedCoupon.price_in_egp === 0 || appliedCoupon.price_outside_egp === 0 || appliedCoupon.is_free);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans" dir="rtl">
            <section id="plans" className="py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-violet-400 bg-violet-500/10 rounded-full mb-4 border border-violet-500/20">
                        {t("خطط أسعار TeamAssign")}
                    </span>
                    <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                        {t("اختر الباقة المناسبة لعملك")}
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        {t("باقة واحدة متكاملة تحتوي على جميع المميزات التي تحتاجها")}
                    </p>
                </div>

                <div className="mb-12">
                    <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                        <button
                            onClick={() => {
                                setType('monthly');
                                setAppliedCoupon(null);
                                setCouponCode("");
                                setCouponSuccess("");
                                setCouponError("");
                                setDiscountedPrice(null);
                            }}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                type === 'monthly'
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            {t("اشتراك شهري")}
                        </button>
                        <button
                            onClick={() => {
                                setType('yearly');
                                setAppliedCoupon(null);
                                setCouponCode("");
                                setCouponSuccess("");
                                setCouponError("");
                                setDiscountedPrice(null);
                            }}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                type === 'yearly'
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            {t("اشتراك سنوي")}
                            <span className="mr-2 text-xs text-emerald-400 font-normal">
                                {t("(وفر 20%)")}
                            </span>
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                        <span className="mr-3 text-zinc-400">{t("جاري تحميل الخطط...")}</span>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
                        {advancedPlan && (
                            <div
                                className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 rounded-3xl border-2 border-violet-600/60 shadow-2xl shadow-violet-950/30 w-full max-w-md relative flex flex-col justify-between"
                            >
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-violet-600/30">
                                        {t("⭐ الباقة المميزة")}
                                    </span>
                                </div>

                                <div>
                                    <div className="p-4 bg-zinc-950/50 rounded-2xl inline-block mb-6 border border-zinc-800">
                                        {plan.icon}
                                    </div>

                                    <h3 className="text-3xl font-bold text-white mb-3">
                                        {plan.name2}
                                    </h3>
                                    <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                        {plan.description}
                                    </p>

                                    <div className="border-t border-zinc-800 my-6"></div>

                                    <ul className="text-right space-y-3 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <CheckCircleIcon className="w-5 h-5 mt-0.5 text-emerald-400 flex-shrink-0 ml-3" />
                                                <span className="text-zinc-300 text-sm font-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <div className="bg-zinc-950/40 p-4 rounded-xl mb-4 border border-zinc-800/60 text-center relative">
                                        {hasDiscount() && (
                                            <div className="absolute -top-2 -right-2">
                                                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    {t("خصم!")}
                                                </span>
                                            </div>
                                        )}
                                        {isFreeCoupon() && (
                                            <div className="absolute -top-2 -right-2">
                                                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    {t("مجاني!")}
                                                </span>
                                            </div>
                                        )}
                                        <span className="block text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">
                                            {t("تكلفة الاستثمار")}
                                        </span>
                                        
                                        {hasDiscount() || isFreeCoupon() ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <span className="text-zinc-500 text-lg line-through">
                                                    {getOriginalPrice()} {isEgypt ? t("ج.م") : "$"}
                                                </span>
                                                <p className={`text-3xl font-black ${isFreeCoupon() ? 'text-emerald-400' : 'text-emerald-400'}`}>
                                                    {getFinalPrice()} {isEgypt ? t("ج.م") : "$"}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-3xl font-black text-white">
                                                {getFinalPrice()} {isEgypt ? t("ج.م") : "$"}
                                            </p>
                                        )}
                                        
                                        <span className="text-zinc-500 text-sm font-normal mr-1">
                                            {type === 'yearly' ? t("سنوياً") : t("شهرياً")}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => {
                                                    setCouponCode(e.target.value);
                                                    setCouponError("");
                                                    setCouponSuccess("");
                                                }}
                                                placeholder={t("أدخل كود الخصم")}
                                                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                                                disabled={!!appliedCoupon}
                                            />
                                            <button
                                                onClick={()=>applyCoupon(plan)}
                                                disabled={!!appliedCoupon || isApplyingCoupon}
                                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                                    appliedCoupon
                                                        ? "bg-emerald-600 text-white cursor-default"
                                                        : "bg-violet-600 hover:bg-violet-700 text-white"
                                                }`}
                                            >
                                                {appliedCoupon ? t("✓ مطبق") : t("تطبيق")}
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="text-red-400 text-xs mt-1 text-right">{couponError}</p>
                                        )}
                                        {couponSuccess && (
                                            <p className="text-emerald-400 text-xs mt-1 text-right">{couponSuccess}</p>
                                        )}
                                        {appliedCoupon && (
                                            <button
                                                onClick={() => {
                                                    setAppliedCoupon(null);
                                                    setCouponCode("");
                                                    setCouponSuccess("");
                                                    setDiscountedPrice(null);
                                                }}
                                                className="text-xs text-zinc-500 hover:text-zinc-300 mt-1 transition-colors"
                                            >
                                                {t("إزالة الكوبون")}
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleSubscribe(plan)}
                                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] py-3.5 rounded-xl font-bold text-white transition-all duration-200 shadow-lg shadow-violet-600/20"
                                    >
                                        {auth.user.subscription === plan.name
                                            ? t("✅ الباقة مفعلة حالياً")
                                            : t("🚀 اشترك الآن")
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl relative text-white" dir="rtl">
                        
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-5 left-5 text-zinc-500 hover:text-zinc-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center pt-2">
                            <div className="w-14 h-14 bg-violet-600/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">
                                {isFreeCoupon() ? t("تفعيل باقة مجانية") : t("تفعيل باقة")} {selectedPlan?.name2}
                            </h3>
                            
                            <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 mb-4 text-right">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-zinc-400 text-sm">{t("نوع الباقة")}</span>
                                    <span className="text-white font-semibold">{type === 'yearly' ? t('سنوي') : t('شهري')}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-zinc-400 text-sm">{t("السعر")}</span>
                                    <span className={`font-bold ${isFreeCoupon() ? 'text-emerald-400' : 'text-white'}`}>
                                        {getFinalPrice()} {isEgypt ? t("ج.م") : "$"}
                                    </span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-400 text-sm">{t("كود الخصم")}</span>
                                        <span className="text-emerald-400 font-semibold">{appliedCoupon.code}</span>
                                    </div>
                                )}
                            </div>

                            <p className="mb-6 text-zinc-400 text-sm leading-relaxed">
                                {isFreeCoupon() 
                                    ? t("سيتم تفعيل الباقة المجانية فوراً. اضغط على زر التفعيل للمتابعة.")
                                    : t("سيتم تفعيل الباقة يدوياً بواسطة فريق الدعم لضمان تجهيز كافة الإعدادات والصلاحيات بشكل مثالي.")
                                }
                            </p>
                            
                            <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 mb-2">
                                {isFreeCoupon() ? (
                                    <button
                                        onClick={() => {
                                            window.location.href = '/dashboard';
                                        }}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-emerald-950/30"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                        {t("تفعيل الباقة المجانية")}
                                    </button>
                                ) : (
                                    <>
                                        <p className="text-xs text-zinc-400 mb-3 text-right">
                                            {t("اضغط على الزر أدناه للتواصل مع فريق الدعم عبر واتساب")}
                                        </p>
                                        <button
                                            onClick={() => {
                                                const message = `مرحباً إدارة TeamAssign، أريد تفعيل ${selectedPlan?.name2} (${type === 'yearly' ? 'سنوي' : 'شهري'}) لحسابي.${appliedCoupon ? `\nكود الخصم: ${appliedCoupon.code}` : ''}`;
                                                window.open(`https://wa.me/+971556127735?text=${encodeURIComponent(message)}`, '_blank');
                                            }}
                                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-emerald-950/30"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12.017 2.047c-5.511 0-9.98 4.468-9.98 9.98 0 1.766.465 3.42 1.277 4.85L2 22l5.255-1.386c1.425.802 3.078 1.267 4.843 1.267 5.512 0 9.98-4.468 9.98-9.98s-4.468-9.98-9.98-9.98zm-.005 1.818c4.52 0 8.162 3.642 8.162 8.162s-3.642 8.162-8.162 8.162c-1.6 0-3.102-.46-4.367-1.257l-.3-.18-3.12.82.834-3.047-.197-.314c-.87-1.322-1.362-2.87-1.362-4.524 0-4.52 3.642-8.162 8.162-8.162zM8.898 7.462c-.24 0-.36.117-.554.39-.195.273-1.04 1.016-1.04 2.476 0 1.46 1.06 2.87 1.208 3.07.148.195 2.09 3.332 5.16 4.562 2.578 1.03 3.105.82 3.652.78.547-.04 1.76-.72 2.01-1.415.25-.695.25-1.29.175-1.415-.074-.125-.273-.195-.566-.34-.293-.145-1.76-.87-2.03-.967-.274-.1-.47-.15-.664.146-.195.293-.75.967-.92 1.17-.17.2-.34.224-.625.075-.293-.15-1.235-.455-2.35-1.45-.87-.78-1.46-1.74-1.63-2.04-.17-.29-.018-.45.13-.59.133-.133.293-.35.44-.525.146-.175.195-.29.293-.487.097-.195.05-.367-.025-.515-.075-.146-.664-1.595-.91-2.18-.24-.57-.48-.475-.664-.484l-.566-.01z"/>
                                            </svg>
                                            {t("مراسلة الدعم المباشر للتفعيل")}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <footer className="bg-zinc-950 border-t border-zinc-900 py-12 text-center text-zinc-500 text-sm">
                <p>&copy; {new Date().getFullYear()} TeamAssign Inc. {t("جميع الحقوق محفوظة.")}</p>
            </footer>
        </div>
    );
}