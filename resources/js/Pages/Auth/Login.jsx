import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, Building2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Login({ status, canResetPassword }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden" dir="rtl">
            <Head title={t('تسجيل الدخول')} />

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
                                {t("مرحباً بعودتك")}
                            </h2>
                            <p className="text-zinc-400 text-sm mt-2">
                                {t("سجل الدخول لإدارة شركتك ومتابعة أعمالك")}
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 p-3 bg-green-900/30 border border-green-600 rounded-lg text-sm text-green-400">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel htmlFor="email" value={t("البريد الإلكتروني للعمل")} className="text-zinc-300 mb-1.5" />
                                <div className="relative">
                                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full pr-10 rounded-xl border border-zinc-800 bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600"
                                        placeholder="name@company.com"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1 text-red-500 text-sm" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value={t("كلمة المرور")} className="text-zinc-300 mb-1.5" />
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="block w-full pr-10 rounded-xl border border-zinc-800 bg-zinc-950/50 text-white focus:border-violet-500 focus:ring-violet-500/20 placeholder-zinc-600"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-1 text-red-500 text-sm" />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="border-zinc-700 bg-zinc-950/50 text-violet-600 focus:ring-violet-500 rounded"
                                    />
                                    <span className="mr-2 text-sm text-zinc-400">
                                        {t('تذكرني')}
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="rounded-md text-sm text-violet-400 underline hover:text-violet-300 transition-colors"
                                    >
                                        {t('نسيت كلمة المرور؟')}
                                    </Link>
                                )}
                            </div>

                            <div className="pt-4 flex flex-col gap-4">
                                <PrimaryButton 
                                    className="w-full px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold shadow-lg shadow-violet-600/20 transition-all text-center justify-center border-none" 
                                    disabled={processing}
                                >
                                    {processing ? t('جاري التسجيل...') : t('تسجيل الدخول')}
                                </PrimaryButton>

                                <div className="text-center">
                                    <p className="text-sm text-zinc-400">
                                        {t('ليس لديك حساب؟')}{' '}
                                        <Link
                                            href={route('register')}
                                            className="text-violet-400 hover:text-violet-300 transition-colors"
                                        >
                                            {t('إنشاء حساب جديد')}
                                        </Link>
                                    </p>
                                </div>
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