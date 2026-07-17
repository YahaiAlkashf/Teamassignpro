// components/Header.jsx
import React, { useContext, useState, useEffect } from "react";
import {
    SunIcon,
    MoonIcon,
    Bars3Icon,
    BellIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link, usePage } from "@inertiajs/react";
import ThemeContext from "../../../Context/ThemeContext";
import { CurrencyContext } from "../../../Context/CurrencyContext ";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function Header({ isOpen, setIsOpen, sidebarWidth = 64 }) {
    const { auth } = usePage().props;
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [notifications, setNotifications] = useState([]);
    const { app_url } = usePage().props;
    const [showNotifications, setShowNotifications] = useState(false);
    const [clickedOnce, setClickedOnce] = useState(false);
    const { t, i18n } = useTranslation();

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("i18nextLng", lang);
    };

    const getNotifications = async () => {
        try {
            const response = await axios.get(`${app_url}/notifications`);
            setNotifications(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const readNotification = async () => {
        try {
            const response = await axios.post(`${app_url}/notifications/read`);
            getNotifications();
        } catch (error) {
            console.log(error);
        }
    };

    const handleBellClick = () => {
        if (!clickedOnce) {
            setClickedOnce(true);
        } else {
            readNotification();
            setClickedOnce(false);
        }
        setShowNotifications(!showNotifications);
    };

    useEffect(() => {
        getNotifications();
    }, []);

    // Calculate header width based on sidebar state
    const sidebarWidthClass = isOpen ? 'lg:right-64' : 'lg:right-20';
    const sidebarMarginClass = isOpen ? 'lg:mr-64' : 'lg:mr-20';

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-between
                    px-4 py-3 bg-white dark:bg-gray-900 shadow-md transition-all duration-300
                    ${sidebarWidthClass}`}
            >
                {/* Left side - Company Name & Mobile Menu Button */}
                <div className="flex items-center gap-3">
                    <button
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle sidebar"
                    >
                        {isOpen ? (
                            <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        ) : (
                            <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        )}
                    </button>
                    
                    <h1 className="text-xl font-bold text-primary dark:text-primary-light truncate">
                        {auth?.user?.company?.company_name || t("سيستمى")}
                    </h1>
                </div>

                {/* Right side - Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Language Selector */}
                    <div className="relative hidden sm:block">
                        <select
                            value={i18n.language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="appearance-none w-32 px-3 py-1.5 pr-8 rounded-lg
                                border border-gray-300 dark:border-gray-700
                                bg-white dark:bg-gray-800
                                text-gray-700 dark:text-gray-200 text-sm font-medium
                                focus:ring-2 focus:ring-primary focus:border-primary
                                transition-all duration-200 cursor-pointer"
                        >
                            <option value="ar" className="py-1">🇪🇬 {t("عربي")}</option>
                            <option value="en" className="py-1">🇬🇧 {t("English")}</option>
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">
                            ▼
                        </span>
                    </div>

                    {/* Mobile Language Selector */}
                    <div className="relative sm:hidden">
                        <select
                            value={i18n.language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="appearance-none w-16 px-2 py-1.5 pr-6 rounded-lg
                                border border-gray-300 dark:border-gray-700
                                bg-white dark:bg-gray-800
                                text-gray-700 dark:text-gray-200 text-xs font-medium
                                focus:ring-2 focus:ring-primary focus:border-primary
                                transition-all duration-200 cursor-pointer"
                        >
                            <option value="ar">🇪🇬</option>
                            <option value="en">🇬🇧</option>
                        </select>
                        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-[10px]">
                            ▼
                        </span>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {theme === "dark" ? (
                            <SunIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                        ) : (
                            <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={handleBellClick}
                            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300" />
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 max-h-80 overflow-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {t("الإشعارات")}
                                    </h3>
                                </div>
                                <div className="p-2 space-y-1">
                                    {notifications.length === 0 ? (
                                        <p className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                            {t("لا يوجد إشعارات")}
                                        </p>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-3 rounded-lg transition-colors ${
                                                    n.read 
                                                        ? 'bg-gray-50 dark:bg-gray-800/50' 
                                                        : 'bg-primary/5 dark:bg-primary/10 border-r-4 border-primary'
                                                }`}
                                            >
                                                <h4 className={`text-sm ${n.read ? 'font-medium' : 'font-bold'} text-gray-800 dark:text-gray-200`}>
                                                    {n.title}
                                                </h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                    {new Date(n.created_at).toLocaleString('ar-EG')}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={readNotification}
                                            className="w-full text-center text-xs text-primary hover:text-primary-dark font-medium py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            {t("تحديد الكل كمقروء")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile Picture */}
                    <Link
                        href="/clubs/memberprofile"
                        className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-shadow"
                    >
                        {auth.user?.company?.logo ? (
                            <img
                                src={`${app_url}/storage/${auth.user.company.logo}`}
                                className="h-full w-full object-cover rounded-full"
                                alt={auth.user.company.company_name}
                            />
                        ) : (
                            auth.user?.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                    </Link>

                    {/* Logout Button */}
                    <Link
                        href={route("logout")}
                        method="post"
                        className="hidden sm:flex px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        {t("تسجيل الخروج")}
                    </Link>

                    {/* Mobile Logout */}
                    <Link
                        href={route("logout")}
                        method="post"
                        className="sm:hidden p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        aria-label="Logout"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </Link>
                </div>
            </header>

            {/* Spacer for fixed header */}
            <div className="h-14 sm:h-16" />
        </>
    );
}