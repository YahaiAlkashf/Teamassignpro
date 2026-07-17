<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>TeamAssign - نظام إدارة الفرق والمشاريع والمهام</title>
        <meta name="description" content="TeamAssign منصة SaaS متكاملة لإدارة الفرق والمشاريع والمهام. نظم فرق العمل، وزع المهام، وتابع الأداء بكل سهولة واحترافية. جرب مجاناً لمدة 7 أيام." />
        <meta name="keywords" content="TeamAssign, إدارة الفرق, إدارة المشاريع, إدارة المهام, نظام إدارة, SaaS, إدارة الموظفين, إدارة الفعاليات, لوحة الشرف, إدارة الإعلانات, مكتبة الملفات, تقارير وإحصائيات, إدارة الأعمال, نظام إدارة متكامل" />
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon-v2.ico') }}">
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
        <meta name="google-site-verification" content="Bl_5oW_zQJt_6VSXpwYK9ucchhP7gyxpgCZbKMOs4MM" />
        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
