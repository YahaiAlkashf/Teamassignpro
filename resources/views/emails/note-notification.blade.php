// resources/views/emails/note-notification.blade.php
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ملاحظة جديدة</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: right;">
            @if($action == 'created')
                📝 ملاحظة جديدة
            @elseif($action == 'updated')
                ✏️ تم تحديث ملاحظة
            @endif
        </h2>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <div style="text-align: right;">
                <p><strong>المرسل:</strong> {{ $sender->name ?? 'غير معروف' }}</p>
                <p><strong>التاريخ:</strong> {{ $note->created_at->format('Y-m-d H:i') }}</p>
            </div>

            <div style="margin-top: 15px; padding: 15px; background: #fff; border-right: 4px solid #4F2BED; border-radius: 4px;">
                <h3 style="color: #4F2BED; margin-top: 0; text-align: right;">{{ $note->title }}</h3>
                <p style="color: #555; text-align: right; white-space: pre-wrap;">{{ $note->content }}</p>
            </div>

            @if($note->is_pinned)
                <div style="margin-top: 10px; text-align: right;">
                    <span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                        📌 مثبتة
                    </span>
                </div>
            @endif
        </div>

        <p style="text-align: right; color: #777;">
            يمكنك تسجيل الدخول إلى النظام لعرض جميع الملاحظات.
        </p>

        <div style="text-align: center; margin-top: 30px; padding: 15px; background: #f0f0f0;">
            <p style="margin: 0; color: #555;">    © {{ date('Y') }} TeamAssign Inc. جميع الحقوق محفوظة </p>
        </div>
    </div>
</body>
</html>