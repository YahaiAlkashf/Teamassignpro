import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { usePage } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Building2, Mail, Lock, User, UploadCloud, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function AddUserModel({
    closeModal,
    mode = "add",
    customer = null,
    showAllCustomers
}) {
    const { app_url } = usePage().props;
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: customer?.name || "",
        email: customer?.email || "",
        password: "",
        password_confirmation: "",
        company_name: customer?.company?.company_name || "",
        country: customer?.country || "EG",
        logo: null,
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

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

    const [logoPreview, setLogoPreview] = useState(
        customer?.company?.logo ? `${app_url}/storage/${customer.company.logo}` : null
    );
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
            setFormData({ ...formData, logo: file });
            const reader = new FileReader();
            reader.onload = (e) => setLogoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('company_name', formData.company_name);
        formDataToSend.append('country', formData.country);

        if (mode === "add") {
            formDataToSend.append('password', formData.password);
            formDataToSend.append('password_confirmation', formData.password_confirmation);
        } else if (mode === "edit" && formData.password) {
            formDataToSend.append('password', formData.password);
            formDataToSend.append('password_confirmation', formData.password_confirmation);
        }

        if (formData.logo) {
            formDataToSend.append('logo', formData.logo);
        }

        try {
            let response;
            if (mode === "add") {
                response = await axios.post(`${app_url}/users`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else if (mode === "edit" && customer) {
                response = await axios.post(`${app_url}/users/${customer.id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            if (response.data.success) {
                closeModal();
                if (showAllCustomers) {
                    showAllCustomers();
                }
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    password_confirmation: "",
                    company_name: "",
                    country: "EG",
                    logo: null,
                });
                setLogoPreview(null);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setProcessing(false);
        }
    };

    const selectedCountry = countries.find(c => c.code === formData.country) || {};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-auto">
            <div className="w-full max-w-4xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h3 className="text-xl font-bold text-white">
                        {mode === "add" ? t("إضافة مستخدم جديد") : t("تعديل بيانات المستخدم")}
                    </h3>
                    <button
                        onClick={closeModal}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 md:p-10 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="mb-8">
                        <span className="text-xs font-bold tracking-wider text-violet-400 uppercase bg-violet-500/10 px-3 py-1 rounded-full">
                            {t("TeamAssign SaaS")}
                        </span>
                        <h2 className="text-3xl font-extrabold mt-3 text-white tracking-tight">
                            {mode === "add" ? t("إضافة مستخدم جديد") : t("تعديل بيانات المستخدم")}
                        </h2>
                        <p className="text-zinc-400 text-sm mt-2">
                            {mode === "add"
                                ? t("أضف مستخدم جديد إلى منصتك مع كامل الصلاحيات.")
                                : t("قم بتعديل بيانات المستخدم حسب الحاجة.")}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value={t("الاسم الشخصي")} className="text-zinc-300 mb-1.5" />
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        className="block w-full pr-10 rounded-xl border-zinc-800 bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600"
                                        placeholder={t("جون دو")}
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-1 text-red-500 text-sm" />
                            </div>

                            <div>
                                <InputLabel htmlFor="company_name" value={t("اسم الشركة")} className="text-zinc-300 mb-1.5" />
                                <div className="relative">
                                    <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <TextInput
                                        id="company_name"
                                        name="company_name"
                                        value={formData.company_name}
                                        className="block w-full pr-10 rounded-xl border-zinc-800 bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600"
                                        placeholder={t("شركتك الناشئة ذ.م.م")}
                                        autoComplete="organization"
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    />
                                </div>
                                <InputError message={errors.company_name} className="mt-1 text-red-500 text-sm" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value={t("البريد الإلكتروني للعمل")} className="text-zinc-300 mb-1.5" />
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    className="block w-full pr-10 rounded-xl border-zinc-800 bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600"
                                    placeholder="name@company.com"
                                    autoComplete="username"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1 text-red-500 text-sm" />
                        </div>

                        <div className="relative" ref={countryDropdownRef}>
                            <InputLabel htmlFor="country" value={t("دولة المقر")} className="text-zinc-300 mb-1.5" />
                            <button
                                type="button"
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 text-white text-right flex items-center justify-between focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
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
                                                    setFormData({ ...formData, country: country.code });
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
                            <InputLabel htmlFor="logo" value={t("شعار الشركة")} className="text-zinc-300 mb-1.5" />
                            <div className="flex items-center gap-4 mt-1 p-4 rounded-xl bg-zinc-950/30 border border-zinc-800">
                                <label className="flex flex-col items-center justify-center w-20 h-20 border border-zinc-800 rounded-xl cursor-pointer bg-zinc-950 hover:bg-zinc-900 transition-colors group">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt={t("Logo preview")} className="w-full h-full object-contain rounded-xl" />
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
                                <InputLabel htmlFor="password" value={t("كلمة المرور")} className="text-zinc-300 mb-1.5" />
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        className="block w-full pr-10 rounded-xl border-zinc-800 bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600"
                                        autoComplete="new-password"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                      
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-1 text-red-500 text-sm" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value={t("تأكيد كلمة المرور")} className="text-zinc-300 mb-1.5" />
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        className="block w-full pr-10 rounded-xl border-zinc-800 bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600"
                                        autoComplete="new-password"
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                   
                                    />
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-1 text-red-500 text-sm" />
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors font-medium"
                            >
                                {t("إلغاء")}
                            </button>
                            <PrimaryButton
                                type="submit"
                                className="flex-1 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold shadow-lg shadow-violet-600/20 transition-all text-center justify-center border-none"
                                disabled={processing}
                            >
                                {processing ? t("جاري الحفظ...") : (mode === "add" ? t("إضافة المستخدم") : t("تحديث البيانات"))}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}