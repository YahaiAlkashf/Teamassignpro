<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تحديث على التقرير</title>
</head>
<body>
    <div style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e9ecef;">
            <h1 style="color: #4f46e5; font-size: 24px;">📋 TeamAssign</h1>
        </div>

        <div style="padding: 20px 0;">
            <h2 style="color: #1f2937;">مرحباً {{ $recipient->name }} 👋</h2>

            {{-- حالة 1: رد فقط (بدون تغيير حالة) --}}
            @if($hasReply && !$statusChanged)
                <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                    <strong style="color: #4f46e5;">📩 تم الرد على تقريرك "{{ $report->title }}" من قبل الإدارة</strong>
                </p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #4f46e5;">
                    <p style="color: #1f2937; margin: 0; font-size: 15px;">{{ $reply->reply }}</p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    يمكنك الاطلاع على الرد ومتابعة التقرير من خلال المنصة.
                </p>

            {{-- حالة 2: تغيير حالة مع رد --}}
            @elseif($hasReply && $statusChanged)
                <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                    <strong style="color: #4f46e5;">📋 تم تحديث حالة تقريرك "{{ $report->title }}" مع رد من الإدارة</strong>
                </p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #4f46e5;">
                    <p style="color: #1f2937; margin: 0; font-size: 15px;">{{ $reply->reply }}</p>
                </div>
                <div style="text-align: center; padding: 10px; margin: 15px 0;">
                    <span style="
                        display: inline-block;
                        padding: 6px 20px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 600;
                        background: {{ $status == 'approved' ? '#d1fae5' : ($status == 'rejected' ? '#fee2e2' : '#fef3c7') }};
                        color: {{ $status == 'approved' ? '#065f46' : ($status == 'rejected' ? '#991b1b' : '#92400e') }};
                    ">
                        {{ $status == 'approved' ? '✅ مقبول' : ($status == 'rejected' ? '❌ مرفوض' : '🔄 تحت المراجعة') }}
                    </span>
                </div>

            {{-- حالة 3: تغيير حالة فقط (بدون رد) --}}
            @elseif($status && !$hasReply)
                <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                    <strong style="color: #4f46e5;">📋 تم تحديث حالة تقريرك "{{ $report->title }}"</strong>
                </p>
                <div style="text-align: center; padding: 20px; margin: 15px 0;">
                    <span style="
                        display: inline-block;
                        padding: 8px 24px;
                        border-radius: 20px;
                        font-size: 16px;
                        font-weight: 600;
                        background: {{ $status == 'approved' ? '#d1fae5' : ($status == 'rejected' ? '#fee2e2' : '#fef3c7') }};
                        color: {{ $status == 'approved' ? '#065f46' : ($status == 'rejected' ? '#991b1b' : '#92400e') }};
                    ">
                        {{ $status == 'approved' ? '✅ مقبول' : ($status == 'rejected' ? '❌ مرفوض' : '🔄 تحت المراجعة') }}
                    </span>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    الحالة الجديدة: <strong>{{ $status == 'approved' ? 'مقبول' : ($status == 'rejected' ? 'مرفوض' : 'تحت المراجعة') }}</strong>
                </p>
            @endif

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                <p style="color: #6b7280; font-size: 14px;">
                    يمكنك عرض التقرير بالكامل من خلال <a href="{{ config('app.url') }}/clubs/reports" style="color: #4f46e5; text-decoration: none; font-weight: 600;">الضغط هنا</a>
                </p>
            </div>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef; color: #9ca3af; font-size: 12px;">
            <p>© {{ date('Y') }} TeamAssign Inc. جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>