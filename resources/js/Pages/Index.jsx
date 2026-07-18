import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { 
    SparklesIcon, 
    CheckCircleIcon, 
    RocketLaunchIcon, 
    StarIcon, 
    UserGroupIcon, 
    ChartBarIcon, 
    DocumentTextIcon, 
    CalendarIcon, 
    ChatBubbleLeftRightIcon, 
    ShieldCheckIcon, 
    DevicePhoneMobileIcon, 
    ClockIcon,
    FolderIcon,
    TrophyIcon,
    MegaphoneIcon,
    ClipboardDocumentCheckIcon,
    PuzzlePieceIcon,
    CloudArrowUpIcon,
    EyeIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";

export default function LandingPage() {
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState("ar");
    const [isVisible, setIsVisible] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEgypt, setIsEgypt] = useState(true);
    const [type, setType] = useState("monthly");

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("i18nextLng", lang);
        setLanguage(lang);
    };

    useEffect(() => {
        localStorage.setItem("language", language);
        // Check user country
        fetch("https://ipapi.co/json/")
            .then((res) => res.json())
            .then((data) => {
                setIsEgypt(data.country_code === "EG");
            })
            .catch((err) => {
                console.log(err);
            });
    }, [language]);

    useEffect(() => {
        setIsVisible(true);

        const handleScroll = () => {
            const elements = document.querySelectorAll('.fade-in, .slide-in, .scale-in');
            elements.forEach(el => {
                const elementTop = el.getBoundingClientRect().top;
                const elementVisible = 150;
                if (elementTop < window.innerHeight - elementVisible) {
                    el.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const plan = {
        name: "TeamAssign Pro",
        name2: "الباقة المتقدمة",
        description: "باقة متكاملة لإدارة الشركات والمؤسسات مع كافة الأدوات والصلاحيات المتقدمة",
        priceInsideEgypt: 400,
        priceInsideEgyptYearly: 2800,
        priceOutsideEgypt: 15,
        priceOutsideEgyptYearly: 144,
        icon: (
            <svg className="w-16 h-16 mx-auto text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        features: [
            "إدارة الفرق والمشاريع بشكل متكامل",
            "صلاحيات متقدمة للتحكم الكامل",
            "توزيع المهام ومتابعة الأداء",
            "إشعارات فورية للتحديثات والمهام",
            "دعم فني 24/7 عبر واتساب",
            "اضافة عدد غير محدود من الموظفين(المستخدمين)",
            "تخطيط الفعاليات والأنشطة",
            "مكتبة مركزية للملفات",
            "تقارير وإحصائيات متقدمة",
            "لوحة تحكم شاملة وسهلة الاستخدام",
            "نظام إدارة الملاحظات",
            "لوحة الشرف لتحفيز الموظفين",
            "إدارة الإعلانات الداخلية",
            "تكامل مع أدوات خارجية عبر API",
        ]
    };

    const getPrice = () => {
        if (type === 'yearly') {
            return isEgypt ? plan.priceInsideEgyptYearly : plan.priceOutsideEgyptYearly;
        }
        return isEgypt ? plan.priceInsideEgypt : plan.priceOutsideEgypt;
    };

    const getPriceLabel = () => {
        return type === 'yearly' ? 'سنوياً' : 'شهرياً';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white font-tajawal" dir="rtl">
            <Head>
                <title>TeamAssign - نظام إدارة الفرق والمشاريع</title>
                <meta name="description" content="TeamAssign نظام SaaS متكامل لإدارة الفرق والمشاريع والمهام. منصة احترافية لتنظيم العمل وزيادة الإنتاجية." />
                <meta name="keywords" content="TeamAssign, إدارة الفرق, إدارة المشاريع, إدارة المهام, SaaS, نظام إدارة, إدارة الموظفين" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta property="og:title" content="TeamAssign - نظام إدارة الفرق والمشاريع" />
                <meta property="og:description" content="منصة احترافية لإدارة الفرق والمشاريع والمهام بكل سهولة." />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="TeamAssign - نظام إدارة الفرق والمشاريع" />
                <meta name="twitter:description" content="منصة SaaS متكاملة لإدارة الفرق والمشاريع." />
            </Head>

            {/* Header */}
            <header className="bg-black/50 backdrop-blur-lg border-b border-zinc-800/50 py-4 px-4 md:px-10 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                   < div className='flex gap-2 justify-center items-center'>
                    <span>TeamAssign Pro</span>
                    <img src="logo.png" className="w-10 h-10" />
                    </div>
                </h1>

                <div className="md:hidden flex items-center space-x-4 space-x-reverse">
                    <div className="relative">
                        <select
                            value={i18n.language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="appearance-none w-28 px-3 py-1 pr-6 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-medium shadow-md transition duration-200 hover:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        >
                            <option value="ar">🇪🇬 عربي</option>
                            <option value="en">🇬🇧 English</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-white focus:outline-none"
                        aria-label="قائمة التنقل"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
                    <Link href="/" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">الرئيسية</Link>
                    <Link href="#features" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">المميزات</Link>
                    <Link href="#plans" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">الباقات</Link>
                    <Link href="#faq" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">الأسئلة</Link>
                </nav>

                <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                    <div className="relative">
                        <select
                            value={i18n.language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="appearance-none w-36 px-4 py-2 pr-8 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm font-medium shadow-md transition duration-200 hover:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        >
                            <option value="ar">🇪🇬 عربي</option>
                            <option value="en">🇬🇧 English</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">▼</span>
                    </div>
                    <Link
                        href={route('login')}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 rounded-lg font-semibold text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-600/20"
                    >
                        جرّب الآن
                    </Link>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`md:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-zinc-900 border-l border-zinc-800 p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-violet-400">القائمة</h2>
                        <button onClick={() => setIsMenuOpen(false)} className="text-white p-1 rounded-full hover:bg-zinc-800 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <nav className="flex flex-col space-y-6">
                        <Link href="/" className="text-white hover:text-violet-400 transition-colors py-3 text-lg border-b border-zinc-800" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
                        <Link href="#features" className="text-white hover:text-violet-400 transition-colors py-3 text-lg border-b border-zinc-800" onClick={() => setIsMenuOpen(false)}>المميزات</Link>
                        <Link href="#plans" className="text-white hover:text-violet-400 transition-colors py-3 text-lg border-b border-zinc-800" onClick={() => setIsMenuOpen(false)}>الباقات</Link>
                        <Link href="#faq" className="text-white hover:text-violet-400 transition-colors py-3 text-lg border-b border-zinc-800" onClick={() => setIsMenuOpen(false)}>الأسئلة</Link>
                        <div className="pt-6 mt-6 border-t border-zinc-800">
                            <Link href={route('login')} className="block w-full text-center bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all" onClick={() => setIsMenuOpen(false)}>
                                جرّب الآن
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Hero Section with Floating Animation */}
            <section className="text-center py-16 md:py-32 px-4 md:px-6 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-violet-600/5 blur-[150px] animate-pulse-slow"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px] animate-float-slow"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] animate-float-slower"></div>
                    
                    {/* Floating orbs */}
                    <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-violet-500/10 blur-3xl animate-float-orbit"></div>
                    <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl animate-float-orbit-delay"></div>
                    <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-violet-400/5 blur-2xl animate-float-orbit-2"></div>
                </div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6 animate-pulse-glow">
                        <SparklesIcon className="h-4 w-4 text-violet-400" />
                        <span className="text-xs font-semibold text-violet-400 tracking-wider">✨ نظام إدارة الفرق المتكامل</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-indigo-200 bg-clip-text text-transparent leading-tight animate-slide-up">
                        {t("نظامك لإدارة الفرق والمشاريع بذكاء")}
                    </h2>
                    <p className="text-lg md:text-xl lg:text-2xl mb-10 text-zinc-400 max-w-3xl mx-auto leading-relaxed animate-slide-up-delay">
                        {t("منصة SaaS متكاملة تساعدك على تنظيم فرق العمل، توزيع المهام، ومتابعة الأداء بكل سهولة واحترافية.")}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay-2">
                        <Link
                            href={route('register')}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transform hover:scale-[1.02] duration-200 inline-flex items-center gap-2"
                        >
                            <RocketLaunchIcon className="h-5 w-5" />
                            {t("ابدأ الآن مجاناً")}
                        </Link>
                        <Link
                            href="#plans"
                            className="px-8 py-4 rounded-xl text-lg font-semibold text-zinc-300 border border-zinc-700 hover:border-violet-500 hover:text-white transition-all"
                        >
                            {t("عرض الباقات")}
                        </Link>
                    </div>
                    
                    <div className="mt-8 flex items-center justify-center gap-8 text-sm text-zinc-500 animate-slide-up-delay-3 flex-wrap">
                        <span className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                            {t("فترة تجريبية مجانية")}
                        </span>
                        <span className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                            {t("دعم فني 24/7")}
                        </span>
                        <span className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                            {t("تحديثات مستمرة")}
                        </span>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 px-4 md:px-6 bg-zinc-900/50 border-y border-zinc-800/50">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="fade-in">
                        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">+95%</div>
                        <p className="text-zinc-400 text-sm mt-1">رضا العملاء</p>
                    </div>
                    <div className="fade-in">
                        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">40%</div>
                        <p className="text-zinc-400 text-sm mt-1">زيادة الإنتاجية</p>
                    </div>
                    {/* <div className="fade-in">
                        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">500+</div>
                        <p className="text-zinc-400 text-sm mt-1">شركة تستخدم المنصة</p>
                    </div> */}
                    <div className="fade-in">
                        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">24/7</div>
                        <p className="text-zinc-400 text-sm mt-1">دعم فني متواصل</p>
                    </div>
                </div>
            </section>

            {/* Features Section with Heroicons */}
            <section id="features" className="py-16 md:py-24 px-4 md:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-violet-400 bg-violet-500/10 rounded-full mb-4 border border-violet-500/20">
                            المميزات
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">كل ما تحتاجه لإدارة فريقك</h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">منصة متكاملة تجمع كل أدوات إدارة الفرق والمشاريع في مكان واحد</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={index} className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 fade-in group">
                                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                                        <IconComponent className="h-6 w-6 text-violet-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Plan Section */}
            <section id="plans" className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-zinc-950 to-zinc-900">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-violet-400 bg-violet-500/10 rounded-full mb-4 border border-violet-500/20">
                            الباقات
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">اختر الباقة المناسبة لعملك</h2>
                        <p className="text-zinc-400 text-lg">باقة واحدة متكاملة تحتوي على جميع المميزات التي تحتاجها</p>
                    </div>

                    {/* Monthly/Yearly Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                            <button
                                onClick={() => setType('monthly')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    type === 'monthly'
                                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                اشتراك شهري
                            </button>
                            <button
                                onClick={() => setType('yearly')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    type === 'yearly'
                                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                اشتراك سنوي
                                <span className="mr-2 text-xs text-emerald-400 font-normal">
                                    (وفر 20%)
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 rounded-3xl border-2 border-violet-600/60 shadow-2xl shadow-violet-950/30 w-full relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-violet-600/30">
                                ⭐ الباقة المميزة
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start gap-8">
                            <div className="flex-1">
                                <div className="p-4 bg-zinc-950/50 rounded-2xl inline-block mb-4 border border-zinc-800">
                                    {plan.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name2}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="flex-1">
                                <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/60 text-center relative">
                                    <span className="block text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">تكلفة الاستثمار</span>
                                    <p className="text-3xl font-black text-white">
                                        {getPrice()} {isEgypt ? "ج.م" : "$"} 
                                        <span className="text-zinc-500 text-sm font-normal"> / {getPriceLabel()}</span>
                                    </p>
                                    {type === 'yearly' && (
                                        <p className="text-sm text-emerald-400 mt-1">💰 وفر 20% عند الاشتراك السنوي</p>
                                    )}
                                </div>

                                <Link
                                    href={route('login')}
                                    className="w-full block text-center mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3.5 rounded-xl font-bold text-white transition-all duration-200 shadow-lg shadow-violet-600/20"
                                >
                                    🚀 ابدأ تجربتك المجانية الآن
                                </Link>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 mt-6 pt-6">
                            <h4 className="text-sm font-semibold text-zinc-300 mb-4 text-center">جميع المميزات مشمولة في الباقة</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start text-sm text-zinc-400">
                                        <CheckCircleIcon className="h-4 w-4 text-emerald-500 ml-2 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-zinc-500 text-sm">
                            💡 {t("فترة تجريبية مجانية لمدة 14 أيام - لا حاجة لبطاقة ائتمان")}
                        </p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            {/* <section className="py-16 md:py-24 px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">ماذا يقول عملاؤنا</h2>
                        <p className="text-zinc-400 text-lg">آراء حقيقية من شركات تستخدم TeamAssign</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800 fade-in">
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    ))}
                                </div>
                                <p className="text-zinc-300 text-sm leading-relaxed">"{testimonial.text}"</p>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                        {testimonial.author.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{testimonial.author}</p>
                                        <p className="text-zinc-500 text-xs">{testimonial.position}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* FAQ Section */}
            <section id="faq" className="py-16 md:py-24 px-4 md:px-6 bg-zinc-900/30">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-violet-400 bg-violet-500/10 rounded-full mb-4 border border-violet-500/20">
                            الأسئلة الشائعة
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">إجابات على أسئلتك</h2>
                        <p className="text-zinc-400 text-lg">كل ما تريد معرفته عن TeamAssign</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800 hover:border-violet-500/30 transition-all fade-in">
                                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <span className="text-violet-400">❓</span>
                                    {faq.question}
                                </h4>
                                <p className="text-zinc-400 text-sm leading-relaxed pr-8">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-r from-violet-900/20 via-indigo-900/20 to-violet-900/20">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">جاهز لتنظيم فرقك وزيادة إنتاجيتك؟</h2>
                    {/* <p className="text-zinc-400 text-lg mb-8">انضم إلى أكثر من 500 شركة تستخدم TeamAssign يومياً</p> */}
                    <Link
                        href={route('login')}
                        className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transform hover:scale-[1.02] duration-200"
                    >
                        ابدأ تجربتك المجانية الآن 🚀
                    </Link>
                    <p className="text-zinc-500 text-sm mt-4">💡 فترة تجريبية مجانية 14 أيام - لا حاجة لبطاقة ائتمان</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black/50 border-t border-zinc-800/50 py-8 text-center text-zinc-500 px-4">
                <p className="text-sm">&copy; {new Date().getFullYear()} TeamAssign Inc. {t("جميع الحقوق محفوظة.")}</p>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <a
                            href="https://wa.me/201112678648"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white shadow-md transition-all duration-300 hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 32 32"
                                className="h-5 w-5 fill-current"
                            >
                                <path d="M16.004 3C8.82 3 3 8.82 3 16.004a12.92 12.92 0 001.764 6.52L3 29l6.67-1.748A13.003 13.003 0 0016.004 29C23.18 29 29 23.18 29 16.004 29 8.82 23.18 3 16.004 3zm0 23.7a10.67 10.67 0 01-5.438-1.486l-.39-.23-3.96 1.038 1.057-3.86-.253-.397A10.66 10.66 0 1116.004 26.7zm5.86-8.027c-.32-.16-1.894-.934-2.187-1.04-.293-.106-.507-.16-.72.16-.214.32-.827 1.04-1.014 1.254-.186.214-.373.24-.693.08-.32-.16-1.35-.497-2.57-1.585-.95-.847-1.59-1.893-1.777-2.213-.186-.32-.02-.492.14-.652.145-.144.32-.373.48-.56.16-.186.214-.32.32-.533.107-.214.054-.4-.026-.56-.08-.16-.72-1.734-.986-2.374-.26-.626-.526-.54-.72-.55h-.613c-.214 0-.56.08-.854.4-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.214 2.26 3.453 5.48 4.84.766.33 1.364.527 1.83.674.77.245 1.47.21 2.024.128.617-.092 1.894-.774 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.214-.613-.374z" />
                            </svg>

                            <span>تواصل معنا عبر واتساب</span>
                        </a>
                    </p>
            </footer>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes floatOrbit {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(30px, -20px) scale(1.1); }
                    50% { transform: translate(-10px, -40px) scale(0.9); }
                    75% { transform: translate(-30px, -10px) scale(1.05); }
                }

                @keyframes floatOrbitDelay {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(-20px, 30px) scale(1.1); }
                    50% { transform: translate(10px, 40px) scale(0.9); }
                    75% { transform: translate(30px, 10px) scale(1.05); }
                }

                @keyframes floatOrbit2 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(20px, -20px) rotate(180deg); }
                }

                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }

                @keyframes floatSlower {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(15px); }
                }

                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.1); }
                    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.3); }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .fade-in {
                    opacity: 0;
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }

                .fade-in.active {
                    opacity: 1;
                    animation: fadeIn 0.8s ease-out forwards;
                }

                .slide-in {
                    opacity: 0;
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                }

                .slide-in.active {
                    opacity: 1;
                    animation: slideIn 0.8s ease-out forwards;
                }

                .scale-in {
                    opacity: 0;
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }

                .scale-in.active {
                    opacity: 1;
                    animation: scaleIn 0.6s ease-out forwards;
                }

                .animate-float-orbit {
                    animation: floatOrbit 8s ease-in-out infinite;
                }

                .animate-float-orbit-delay {
                    animation: floatOrbitDelay 10s ease-in-out infinite;
                }

                .animate-float-orbit-2 {
                    animation: floatOrbit2 12s linear infinite;
                }

                .animate-float-slow {
                    animation: floatSlow 6s ease-in-out infinite;
                }

                .animate-float-slower {
                    animation: floatSlower 8s ease-in-out infinite;
                }

                .animate-pulse-slow {
                    animation: pulseGlow 4s ease-in-out infinite;
                }

                .animate-pulse-glow {
                    animation: pulseGlow 3s ease-in-out infinite;
                }

                .animate-slide-up {
                    animation: slideUp 0.8s ease-out forwards;
                }

                .animate-slide-up-delay {
                    animation: slideUp 0.8s ease-out 0.2s forwards;
                    opacity: 0;
                }

                .animate-slide-up-delay-2 {
                    animation: slideUp 0.8s ease-out 0.4s forwards;
                    opacity: 0;
                }

                .animate-slide-up-delay-3 {
                    animation: slideUp 0.8s ease-out 0.6s forwards;
                    opacity: 0;
                }

                html {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
}

const features = [
    { icon: UserGroupIcon, title: "إدارة الفرق والمشاريع", description: "نظم فرق العمل والمشاريع بسهولة مع صلاحيات متقدمة للتحكم الكامل." },
    { icon: ClipboardDocumentCheckIcon, title: "توزيع المهام بذكاء", description: "عيّن المهام، حدد الأولويات، وتابع مؤشرات الأداء الحية والمباشرة." },
    { icon: ChartBarIcon, title: "تقارير وإحصائيات متقدمة", description: "لوحات تحكم قابلة للتخصيص مع رسوم بيانية وتقارير مفصلة." },
    { icon: CalendarIcon, title: "تخطيط الفعاليات والأنشطة", description: "نظم الفعاليات والأنشطة بكل سهولة وتابع حضور الموظفين." },
    { icon: FolderIcon, title: "مكتبة مركزية للملفات", description: "مكان واحد لتخزين ومشاركة جميع ملفات الشركة بطريقة منظمة." },
    { icon: ChatBubbleLeftRightIcon, title: "تواصل داخلي فعال", description: "دردشة داخلية وإعلانات وإشعارات فورية لتحسين التواصل بين الفريق." },
    { icon: TrophyIcon, title: "لوحة الشرف والتحفيز", description: "حفز فريقك من خلال نظام نقاط وتقييم ومكافآت للأداء المتميز." },
    { icon: MegaphoneIcon, title: "إشعارات وتنبيهات ذكية", description: "تنبيهات فورية للمهام المستحقة والفعاليات والتحديثات المهمة." },
    { icon: ShieldCheckIcon, title: "أمان وحماية متقدمة", description: "نظام صلاحيات متكامل مع تشفير البيانات وحماية الخصوصية." }
];

const testimonials = [
    {
        text: "TeamAssign ساعدنا ننظم كل عملياتنا الداخلية. الفريق بقى منظم أكتر وإنتاجيتنا زادت بشكل ملحوظ!",
        author: "أحمد السيد",
        position: "مدير عام، شركة التقنية الحديثة"
    },
    {
        text: "المنصة سهلة جداً في الاستخدام وفريق الدعم متعاون. أوصي بها لأي شركة تبحث عن تنظيم عملها.",
        author: "نورة خالد",
        position: "مديرة الموارد البشرية، شركة الريادة"
    }
];

const faqs = [
    {
        question: "هل هناك فترة تجريبية مجانية؟",
        answer: "نعم! نوفر فترة تجريبية مجانية لمدة 7 أيام بدون الحاجة لإدخال بطاقة ائتمان. يمكنك تجربة جميع المميزات قبل الاشتراك."
    },
    {
        question: "ما هي الباقات المتاحة؟",
        answer: "نقدم باقة واحدة متكاملة تحتوي على جميع المميزات. يمكنك الاختيار بين الاشتراك الشهري أو السنوي مع توفير 20% على الاشتراك السنوي."
    },
    {
        question: "هل يمكنني إضافة أعضاء الفريق؟",
        answer: "نعم! يمكنك إضافة عدد غير محدود من أعضاء الفريق. النظام مصمم ليدعم الفرق من جميع الأحجام."
    },
    {
        question: "هل النظام يدعم اللغة العربية؟",
        answer: "نعم، النظام يدعم اللغة العربية بشكل كامل بالإضافة إلى اللغة الإنجليزية. جميع الواجهات والقوائم متوفرة بالعربية."
    },
    {
        question: "كيف يتم الدعم الفني؟",
        answer: "نوفر دعم فني على مدار الساعة (24/7) عبر واتساب والبريد الإلكتروني. فريقنا مستعد للإجابة على جميع استفساراتك."
    },
    {
        question: "هل يمكنني التراجع عن الاشتراك؟",
        answer: "يمكنك إلغاء اشتراكك في أي وقت. إذا قمت بالإلغاء خلال فترة التجربة، لن يتم تحصيل أي رسوم."
    },
    {
        question: "ما هي متطلبات التشغيل؟",
        answer: "كل ما تحتاجه هو متصفح حديث (Chrome, Firefox, Safari, Edge) واتصال بالإنترنت. النظام يعمل على جميع الأجهزة."
    },
    {
        question: "هل البيانات آمنة؟",
        answer: "نعم، نستخدم أحدث تقنيات التشفير ونظام صلاحيات متكامل لضمان أمان بياناتك. جميع البيانات محفوظة في خوادم آمنة."
    }
];