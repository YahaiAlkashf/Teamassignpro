<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تفعيل حسابك في TeamAssign</title>
    <style>
        body {
            font-family: 'Tajawal', 'Segoe UI', sans-serif;
            background-color: #0a0a0a;
            margin: 0;
            padding: 0;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            background: linear-gradient(145deg, #111111, #1a1a1a);
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
            border: 1px solid #2a2a2a;
        }
        .header {
            text-align: center;
            padding-bottom: 30px;
            border-bottom: 1px solid #2a2a2a;
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-decoration: none;
        }
        .content {
            padding: 30px 0;
            color: #d1d5db;
        }
        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 15px;
        }
        .greeting span {
            color: #8b5cf6;
        }
        .message {
            font-size: 16px;
            line-height: 1.8;
            color: #9ca3af;
            margin-bottom: 25px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 40px;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px -5px rgba(139, 92, 246, 0.4);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px -5px rgba(139, 92, 246, 0.6);
        }
        .features {
            background: #1a1a1a;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #2a2a2a;
        }
        .features-title {
            color: #8b5cf6;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 10px;
            display: block;
        }
        .feature-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #9ca3af;
            font-size: 14px;
            padding: 6px 0;
        }
        .feature-item::before {
            content: "✓";
            color: #10b981;
            font-weight: 700;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #2a2a2a;
            color: #6b7280;
            font-size: 13px;
        }
        .footer a {
            color: #8b5cf6;
            text-decoration: none;
        }
        .expiry {
            font-size: 13px;
            color: #6b7280;
            text-align: center;
            margin-top: 15px;
        }
        .expiry span {
            color: #f59e0b;
        }
        .badge {
            display: inline-block;
            background: rgba(139, 92, 246, 0.15);
            color: #8b5cf6;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid rgba(139, 92, 246, 0.2);
        }
        @media (max-width: 600px) {
            .container {
                padding: 20px 15px;
            }
            .greeting {
                font-size: 20px;
            }
            .button {
                padding: 12px 30px;
                font-size: 14px;
                display: block;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 TeamAssign</div>
            <div style="margin-top: 10px;">
                <span class="badge">✓ نظام إدارة الفرق المتكامل</span>
            </div>
        </div>

        <div class="content">
            <div class="greeting">
                مرحباً <span>{{ $user->name }}</span> 👋
            </div>

            <p class="message">
                شكراً لتسجيلك في <strong style="color: #8b5cf6;">TeamAssign</strong>! 
                أنت على بعد خطوة واحدة من بدء إدارة فريقك بذكاء واحترافية.
            </p>

            <p class="message" style="font-size: 14px; color: #6b7280;">
                اضغط على الزر أدناه لتفعيل حسابك:
            </p>

            <div class="button-container">
                <a href="{{ $verificationUrl }}" class="button">
                    🔓 تفعيل الحساب الآن
                </a>
            </div>


            <div class="features">
                <span class="features-title">🎯 ماذا ستحصل بعد التفعيل؟</span>
                <div class="feature-item">إدارة متكاملة للفرق والمشاريع</div>
                <div class="feature-item">توزيع المهام ومتابعة الأداء بذكاء</div>
                <div class="feature-item">لوحات تحكم وتقارير متقدمة</div>
                <div class="feature-item">تخطيط الفعاليات والأنشطة بسهولة</div>
                <div class="feature-item">مكتبة مركزية للملفات والمستندات</div>
                <div class="feature-item">دعم فني 24/7 عبر واتساب</div>
            </div>


        </div>

        <div class="footer">
            <p>
                إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد.
            </p>
            <p>
                للإستفسار والدعم: <a href="mailto:support@teamassign.com">support@teamassign.com</a>
            </p>
            <div class="company">
                © {{ date('Y') }} TeamAssign Inc. جميع الحقوق محفوظة
            </div>
        </div>
    </div>
</body>
</html>