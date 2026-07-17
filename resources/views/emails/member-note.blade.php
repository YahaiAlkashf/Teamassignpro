<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ملاحظة جديدة من الإدارة</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: right;">📝 ملاحظة جديدة من الإدارة</h2>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <div style="text-align: right;">
                <p><strong>المرسل:</strong> {{ $creator->name }}</p>
                <p><strong>التاريخ:</strong> {{ $note->created_at->format('Y-m-d H:i') }}</p>
            </div>

            <div style="margin-top: 15px; padding: 15px; background: #fff; border-right: 4px solid #4F2BED; border-radius: 4px;">
                <p style="color: #555; text-align: right; white-space: pre-wrap;">{{ $note->note }}</p>
            </div>
        </div>

        <p style="text-align: right; color: #777;">
            يمكنك تسجيل الدخول إلى النظام لعرض جميع الملاحظات.
        </p>

        <div style="text-align: center; margin-top: 30px; padding: 15px; background: #f0f0f0;">
            <p style="margin: 0; color: #555;">    © {{ date('Y') }} TeamAssign Inc. جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>