import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Building2, Mail, Lock, User, UploadCloud } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Register() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        company_name: "",
        country: "EG",
        logo: null,
    });

    const countries = [
        { code: "EG", name: t("مصر"), flag: "🇪🇬" },
        { code: "SA", name: t("السعودية"), flag: "🇸🇦" },
        { code: "AE", name: t("الإمارات"), flag: "🇦🇪" },
        { code: "QA", name: t("قطر"), flag: "🇶🇦" },
        { code: "KW", name: t("الكويت"), flag: "🇰🇼" },
        { code: "BH", name: t("البحرين"), flag: "🇧🇭" },
        { code: "OM", name: t("عمان"), flag: "🇴🇲" },
        { code: "JO", name: t("الأردن"), flag: "🇯🇴" },
        { code: "LB", name: t("لبنان"), flag: "🇱🇧" },
        { code: "SY", name: t("سوريا"), flag: "🇸🇾" },
        { code: "IQ", name: t("العراق"), flag: "🇮🇶" },
        { code: "PS", name: t("فلسطين"), flag: "🇵🇸" },
        { code: "YE", name: t("اليمن"), flag: "🇾🇪" },
        { code: "DZ", name: t("الجزائر"), flag: "🇩🇿" },
        { code: "MA", name: t("المغرب"), flag: "🇲🇦" },
        { code: "TN", name: t("تونس"), flag: "🇹🇳" },
        { code: "LY", name: t("ليبيا"), flag: "🇱🇾" },
        { code: "SD", name: t("السودان"), flag: "🇸🇩" },
        { code: "SO", name: t("الصومال"), flag: "🇸🇴" },
        { code: "US", name: t("الولايات المتحدة"), flag: "🇺🇸" },
        { code: "GB", name: t("المملكة المتحدة"), flag: "🇬🇧" },
        { code: "FR", name: t("فرنسا"), flag: "🇫🇷" },
        { code: "DE", name: t("ألمانيا"), flag: "🇩🇪" },
        { code: "CA", name: t("كندا"), flag: "🇨🇦" },
        { code: "AU", name: t("أستراليا"), flag: "🇦🇺" },
        { code: "TR", name: t("تركيا"), flag: "🇹🇷" },
    ];

    const [logoPreview, setLogoPreview] = useState(null);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [countryQuery, setCountryQuery] = useState("");
    const countryDropdownRef = useRef(null);

    const filteredCountries = countries.filter(c =>
        c.name.includes(countryQuery) || c.code.toLowerCase().includes(countryQuery.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
                setIsCountryDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("logo", file);
            const reader = new FileReader();
            reader.onload = (e) => setLogoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        post(route("register"), {
            data: formData,
            forceFormData: true,
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    const selectedCountry = countries.find(c => c.code === data.country) || {};

    const hasError = (field) => {
        return errors[field] !== undefined;
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden" dir="rtl">
            <Head title={t("تسجيل حساب جديد")} />
            
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-800/10 blur-[150px] pointer-events-none" />

            <div className="w-full max-w-6xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    
                    <div className="lg:col-span-7 p-6 md:p-10 border-b lg:border-b-0 lg:border-l border-zinc-800">
                        <div className="mb-8">
                            <span className="text-xs font-bold tracking-wider text-violet-400 uppercase bg-violet-500/10 px-3 py-1 rounded-full">
                                {t("TeamAssign SaaS")}
                            </span>
                            <h2 className="text-3xl font-extrabold mt-3 text-white tracking-tight">
                                {t("ابدأ إدارة فريقك بذكاء")}
                            </h2>
                            <p className="text-zinc-400 text-sm mt-2">
                                {t("أنشئ حساب شركتك الآن ووحّد عمليات التكليف والمتابعة في مكان واحد.")}
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel 
                                        htmlFor="name" 
                                        value={t("الاسم الشخصي")} 
                                        className={`text-zinc-300 mb-1.5 ${hasError('name') ? 'text-red-500' : ''}`} 
                                    />
                                    <div className="relative">
                                        <User className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 ${hasError('name') ? 'text-red-500' : 'text-zinc-500'}`} />
                                        <TextInput
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            className={`block w-full pr-10 rounded-xl border ${hasError('name') ? 'border-red-500 ring-2 ring-red-500/20' : 'border-zinc-800'} bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600`}
                                            placeholder={t("جون دو")}
                                            autoComplete="name"
                                            isFocused={true}
                                            onChange={(e) => setData("name", e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.name} className="mt-1 text-red-500 text-sm" />
                                </div>

                                <div>
                                    <InputLabel 
                                        htmlFor="company_name" 
                                        value={t("اسم الشركة")} 
                                        className={`text-zinc-300 mb-1.5 ${hasError('company_name') ? 'text-red-500' : ''}`} 
                                    />
                                    <div className="relative">
                                        <Building2 className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 ${hasError('company_name') ? 'text-red-500' : 'text-zinc-500'}`} />
                                        <TextInput
                                            id="company_name"
                                            name="company_name"
                                            value={data.company_name}
                                            className={`block w-full pr-10 rounded-xl border ${hasError('company_name') ? 'border-red-500 ring-2 ring-red-500/20' : 'border-zinc-800'} bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600`}
                                            placeholder={t("شركتك الناشئة ذ.م.م")}
                                            autoComplete="organization"
                                            onChange={(e) => setData("company_name", e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.company_name} className="mt-1 text-red-500 text-sm" />
                                </div>
                            </div>

                            <div>
                                <InputLabel 
                                    htmlFor="email" 
                                    value={t("البريد الإلكتروني للعمل")} 
                                    className={`text-zinc-300 mb-1.5 ${hasError('email') ? 'text-red-500' : ''}`} 
                                />
                                <div className="relative">
                                    <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 ${hasError('email') ? 'text-red-500' : 'text-zinc-500'}`} />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className={`block w-full pr-10 rounded-xl border ${hasError('email') ? 'border-red-500 ring-2 ring-red-500/20' : 'border-zinc-800'} bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600`}
                                        placeholder="name@company.com"
                                        autoComplete="username"
                                        onChange={(e) => setData("email", e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1 text-red-500 text-sm" />
                            </div>

                            <div className="relative" ref={countryDropdownRef}>
                                <InputLabel 
                                    htmlFor="country" 
                                    value={t("دولة المقر")} 
                                    className={`text-zinc-300 mb-1.5 ${hasError('country') ? 'text-red-500' : ''}`} 
                                />
                                <button
                                    type="button"
                                    className={`w-full rounded-xl border ${hasError('country') ? 'border-red-500 ring-2 ring-red-500/20' : 'border-zinc-800'} bg-zinc-950/50 p-3 text-white text-right flex items-center justify-between focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20`}
                                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                >
                                    <div className="flex items-center gap-2">
                                        {selectedCountry.flag && <span className="text-lg">{selectedCountry.flag}</span>}
                                        <span className="text-zinc-200">{selectedCountry.name || t("اختر الدولة")}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isCountryDropdownOpen && (
                                    <div className="absolute z-20 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-56 overflow-auto">
                                        <div className="p-2 border-b border-zinc-800 sticky top-0 bg-zinc-900">
                                            <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-950 rounded-lg border border-zinc-800">
                                                <Search className="w-4 h-4 text-zinc-500" />
                                                <input
                                                    type="text"
                                                    placeholder={t("ابحث عن دولة...")}
                                                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder-zinc-600 border-none p-0 focus:ring-0"
                                                    value={countryQuery}
                                                    onChange={(e) => setCountryQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            {filteredCountries.map(country => (
                                                <button
                                                    type="button"
                                                    key={country.code}
                                                    className="w-full text-right px-4 py-2 text-sm flex items-center gap-2 text-zinc-300 hover:bg-violet-600/20 hover:text-white transition-colors"
                                                    onClick={() => {
                                                        setData("country", country.code);
                                                        setIsCountryDropdownOpen(false);
                                                        setCountryQuery("");
                                                    }}
                                                >
                                                    <span className="text-lg">{country.flag}</span>
                                                    <span>{country.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <InputError message={errors.country} className="mt-1 text-red-500 text-sm" />
                            </div>

                            <div>
                                <InputLabel 
                                    htmlFor="logo" 
                                    value={t("شعار الشركة")} 
                                    className={`text-zinc-300 mb-1.5 ${hasError('logo') ? 'text-red-500' : ''}`} 
                                />
                                <div className={`flex items-center gap-4 mt-1 p-4 rounded-xl border ${hasError('logo') ? 'border-red-500 ring-2 ring-red-500/20' : 'border-zinc-800'} bg-zinc-950/30`}>
                                    <label className="flex flex-col items-center justify-center w-20 h-20 border border-zinc-800 rounded-xl cursor-pointer bg-zinc-950 hover:bg-zinc-900 transition-colors group">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-xl" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-zinc-500 group-hover:text-violet-400">
                                                <UploadCloud className="w-6 h-6 mb-1" />
                                                <span className="text-[10px] font-medium">{t("رفع")}</span>
                                            </div>
                                        )}
                                        <input id="logo" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                    </label>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-zinc-300">{t("اختر هوية شركتك البصرية")}</p>
                                        <p className="text-xs text-zinc-500 mt-0.5">{t("يفضل صيغة PNG بخلفية شفافة وحجم أقل من 2 ميجابايت.")}</p>
                                    </div>
                                </div>
                                <InputError message={errors.logo} className="mt-1 text-red-500 text-sm" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel 
                                        htmlFor="password" 
                                        value={t("كلمة المرور")} 
                                        className={`text-zinc-300 mb-1.5 ${hasError('password') ? 'text-red-500' : ''}`} 
                                    />
                                    <div className="relative">
                                        <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 ${hasError('password') ? 'text-red-500' : 'text-zinc-500'}`} />
                                        <TextInput
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className={`block w-full pr-10 rounded-xl border ${hasError('password') ? 'border-red-500 ring-2 ring-red-500/20' : 'border-zinc-800'} bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600`}
                                            autoComplete="new-password"
                                            onChange={(e) => setData("password", e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.password} className="mt-1 text-red-500 text-sm" />
                                </div>

                                <div>
                                    <InputLabel 
                                        htmlFor="password_confirmation" 
                                        value={t("تأكيد كلمة المرور")} 
                                        className={`text-zinc-300 mb-1.5 ${hasError('password_confirmation') ? 'text-red-500' : ''}`} 
                                    />
                                    <div className="relative">
                                        <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 ${hasError('password_confirmation') ? 'text-red-500' : 'text-zinc-500'}`} />
                                        <TextInput
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className={`block w-full pr-10 rounded-xl border ${hasError('password_confirmation') ? 'border-red-500 ring-2 ring-red-500/20' : 'border-zinc-800'} bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600`}
                                            autoComplete="new-password"
                                            onChange={(e) => setData("password_confirmation", e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-1 text-red-500 text-sm" />
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <PrimaryButton 
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold shadow-lg shadow-violet-600/20 transition-all text-center justify-center border-none" 
                                    disabled={processing}
                                >
                                    {processing ? t("جاري الإنشاء...") : t("إنشاء حساب الشركة")}
                                </PrimaryButton>

                                <Link
                                    href={route("login")}
                                    className="text-sm text-zinc-400 hover:text-white transition-colors text-center underline underline-offset-4 decoration-zinc-700 hover:decoration-white"
                                >
                                    {t("لديك حساب بالفعل؟ تسجيل الدخول")}
                                </Link>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-5 bg-zinc-950/40 p-8 md:p-12 flex flex-col justify-between relative">
                        <div className="space-y-8 my-auto">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{t("لماذا تعتمد الشركات على TeamAssign؟")}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{t("نظام متكامل صُمم لإنهاء عشوائية توزيع المهام داخل فرق العمل وزيادة الإنتاجية بمعدل 40%.")}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-3 items-start">
                                    <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-zinc-200">{t("هيكلة مرنة للشركات")}</h4>
                                        <p className="text-xs text-zinc-400 mt-0.5">{t("أضف فروعك، أقسامك، وموظفيك في شجرة تنظيمية واضحة.")}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start">
                                    <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-zinc-200">{t("إسناد ذكي للمهام")}</h4>
                                        <p className="text-xs text-zinc-400 mt-0.5">{t("عيّن المهام، حدد الأولويات، وتابع مؤشرات الأداء الحية والمباشرة.")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-zinc-800/60 text-center lg:text-right">
                            <p className="text-xs text-zinc-500">
                                &copy; {new Date().getFullYear()} TeamAssign Inc. {t("جميع الحقوق محفوظة.")}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}