<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isDelete ? '📢 تم حذف الإعلان' : '📢 إعلان جديد' }}</title>
</head>
<body>
    <div style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e9ecef;">
            <h1 style="color: #4f46e5; font-size: 24px;">📢 TeamAssign</h1>
        </div>

        <div style="padding: 20px 0;">
            <h2 style="color: #1f2937;">مرحباً {{ $user->name }} 👋</h2>

            @if($isDelete)
                <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                    <strong style="color: #ef4444;">🗑️ تم حذف الإعلان</strong>
                </p>
                <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #ef4444;">
                    <p style="color: #991b1b; margin: 0; font-size: 15px;">
                        تم حذف الإعلان من قبل الإدارة. يمكنك متابعة أي إعلانات جديدة لاحقاً.
                    </p>
                </div>
            @else
                <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                    <strong style="color: #4f46e5;">{{ $actionText }} إعلان جديد من الإدارة</strong>
                </p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #4f46e5;">
                    <p style="color: #1f2937; margin: 0; font-size: 15px; white-space: pre-wrap;">{{ $content }}</p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    يمكنك الاطلاع على الإعلان من خلال <a href="{{ config('app.url') }}/clubs/announcements" style="color: #4f46e5; text-decoration: none; font-weight: 600;">لوحة الإعلانات</a>
                </p>
            @endif
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef; color: #9ca3af; font-size: 12px;">
            <p>© {{ date('Y') }} TeamAssign Inc. جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>