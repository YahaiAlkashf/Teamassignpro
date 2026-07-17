<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>تقرير جديد</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: right;">📋 تقرير جديد تم رفعه</h2>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c5282; text-align: right;">{{ $report->title }}</h3>

            <div style="text-align: right; margin-top: 15px;">
                <p><strong>المرسل:</strong> {{ $report->member->name ?? 'غير معروف' }}</p>
                <p><strong>النوع:</strong>
                    @if($report->type == 'daily') يومي
                    @elseif($report->type == 'weekly') اسبوعي
                    @elseif($report->type == 'monthly') شهري
                    @elseif($report->type == 'custom') مخصص
                    @endif
                </p>
                <p><strong>تاريخ الإرسال:</strong> {{ $report->created_at->format('Y-m-d H:i') }}</p>
            </div>

            <div style="text-align: right; margin-top: 15px; padding: 10px; background: #fff; border-radius: 4px;">
                <p style="color: #555;">{{ Str::limit($report->content, 200) }}</p>
            </div>
        </div>

        <p style="text-align: right; color: #777;">
            يمكنك تسجيل الدخول إلى النظام لمراجعة التقرير والرد عليه.
        </p>
        <p style="text-align: right; color: #777;">
       © {{ date('Y') }} TeamAssign Inc. جميع الحقوق محفوظة
        </p>

    </div>
</body>
</html>