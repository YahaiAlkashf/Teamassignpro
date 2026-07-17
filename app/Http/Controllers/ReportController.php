<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportFile;
use App\Models\ReportReply;
use App\Models\ReportReplyFile;
use App\Models\Member;
use App\Models\User;
use App\Mail\ReportSubmittedMail;
use App\Mail\ReportActionMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class ReportController extends Controller
{
    private $allowedMimes = 'jpg,jpeg,png,gif,webp,svg,pdf,doc,docx,xls,xlsx,txt,ppt,pptx,zip,rar,7z';
    
    private $maxSizes = [
        'image' => 5120,
        'document' => 10240,
        'presentation' => 20480,
        'archive' => 25600,
        'default' => 10240,
    ];

    private $fileTypes = [
        'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        'document' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'],
        'presentation' => ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        'archive' => ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
    ];

    public function index(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;
        $companyId = $user->company_id;

        $query = Report::with([
            'member', 
            'files', 
            'replies' => function($query) {
                $query->with(['member.user', 'files', 'children.member.user', 'children.files']);
            }
        ])->where('company_id', $companyId);

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('member_id') && $request->member_id) {
            $query->where('member_id', $request->member_id);
        }

        if ($user->role !== 'admin' && !$member->manage_reports) {
            $query->where('member_id', $member->id);
        } else {
            $query->where(function ($q) use ($member) {
                $q->where('status', '!=', 'draft')
                  ->orWhere('member_id', $member->id);
            });
        }

        $reports = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'reports' => $reports
        ]);
    }

    private function validateFileByType($file)
    {
        $fileType = 'default';
        $mimeType = $file->getMimeType();
        
        foreach ($this->fileTypes as $type => $mimes) {
            if (in_array($mimeType, $mimes)) {
                $fileType = $type;
                break;
            }
        }

        $maxSize = $this->maxSizes[$fileType] ?? $this->maxSizes['default'];
        $isValid = $file->isValid() && $file->getSize() <= ($maxSize * 1024);

        $formattedSize = function($bytes) {
            if ($bytes >= 1048576) {
                return number_format($bytes / 1048576, 2) . ' MB';
            } elseif ($bytes >= 1024) {
                return number_format($bytes / 1024, 2) . ' KB';
            }
            return $bytes . ' B';
        };

        return [
            'valid' => $isValid,
            'type' => $fileType,
            'maxSize' => $maxSize,
            'maxSizeFormatted' => $formattedSize($maxSize * 1024),
            'currentSizeFormatted' => $formattedSize($file->getSize()),
            'fileName' => $file->getClientOriginalName(),
            'mimeType' => $mimeType,
        ];
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|in:daily,weekly,monthly,custom',
            'content' => 'required|string',
            'status' => 'in:draft,sent',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date|after_or_equal:period_start',
            'files.*' => 'nullable|file|mimes:' . $this->allowedMimes . '|max:10240',
        ], [
            'title.required' => 'عنوان التقرير مطلوب',
            'type.required' => 'نوع التقرير مطلوب',
            'type.in' => 'نوع التقرير غير صحيح',
            'content.required' => 'محتوى التقرير مطلوب',
            'period_end.after_or_equal' => 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو مساوياً له',
            'files.*.file' => 'يجب أن يكون العنصر ملفًا صالحًا',
            'files.*.mimes' => 'الملف يجب أن يكون من الأنواع المسموحة: صور (jpg, png, gif), مستندات (pdf, doc, docx), عروض تقديمية (ppt, pptx), ملفات مضغوطة (zip, rar)',
            'files.*.max' => 'حجم الملف لا يجب أن يتجاوز 10 ميجابايت',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $validation = $this->validateFileByType($file);
                if (!$validation['valid']) {
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'files' => [
                                sprintf(
                                    'الملف "%s" غير صالح. النوع: %s، الحجم الحالي: %s، الحد الأقصى المسموح: %s',
                                    $validation['fileName'],
                                    $validation['type'] ?? 'غير معروف',
                                    $validation['currentSizeFormatted'],
                                    $validation['maxSizeFormatted']
                                )
                            ]
                        ]
                    ], 422);
                }
            }
        }

        $status = $request->status ?? 'draft';
        
        if ($status === 'sent') {
            $status = 'under_review';
        }

        $report = Report::create([
            'member_id' => $member->id,
            'company_id' => $user->company_id,
            'title' => $request->title,
            'type' => $request->type,
            'content' => $request->content,
            'status' => $status,
            'period_start' => $request->period_start,
            'period_end' => $request->period_end,
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('reports/' . $report->id, 'public');
                ReportFile::create([
                    'report_id' => $report->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء التقرير بنجاح',
            'report' => $report->load('files')
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();
        $member = $user->member;

        $report = Report::with([
            'member', 
            'files', 
            'replies' => function($query) {
                $query->with(['member.user', 'files', 'children.member.user', 'children.files']);
            }
        ])->findOrFail($id);

        if ($user->role !== 'admin' && !$member->manage_reports && $report->member_id !== $member->id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بمشاهدة هذا التقرير'
            ], 403);
        }

        if ($report->status === 'draft' && $report->member_id !== $member->id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بمشاهدة هذا التقرير'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'report' => $report
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $member = $user->member;

        $report = Report::findOrFail($id);

        if ($report->member_id !== $member->id) {
            return response()->json([
                'success' => false,
                'message' => 'فقط صاحب التقرير يمكنه التعديل'
            ], 403);
        }

        if (!in_array($report->status, ['draft', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تعديل التقرير في هذه الحالة. يمكن التعديل فقط عندما يكون في المسودة أو مرفوض'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|in:daily,weekly,monthly,custom',
            'content' => 'required|string',
            'status' => 'in:draft,sent',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date|after_or_equal:period_start',
            'files.*' => 'nullable|file|mimes:' . $this->allowedMimes . '|max:10240',
        ], [
            'title.required' => 'عنوان التقرير مطلوب',
            'type.required' => 'نوع التقرير مطلوب',
            'type.in' => 'نوع التقرير غير صحيح',
            'content.required' => 'محتوى التقرير مطلوب',
            'period_end.after_or_equal' => 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو مساوياً له',
            'files.*.file' => 'يجب أن يكون العنصر ملفًا صالحًا',
            'files.*.mimes' => 'الملف يجب أن يكون من الأنواع المسموحة: صور (jpg, png, gif), مستندات (pdf, doc, docx), عروض تقديمية (ppt, pptx), ملفات مضغوطة (zip, rar)',
            'files.*.max' => 'حجم الملف لا يجب أن يتجاوز 10 ميجابايت',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $validation = $this->validateFileByType($file);
                if (!$validation['valid']) {
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'files' => [
                                sprintf(
                                    'الملف "%s" غير صالح. النوع: %s، الحجم الحالي: %s، الحد الأقصى المسموح: %s',
                                    $validation['fileName'],
                                    $validation['type'] ?? 'غير معروف',
                                    $validation['currentSizeFormatted'],
                                    $validation['maxSizeFormatted']
                                )
                            ]
                        ]
                    ], 422);
                }
            }
        }

        $newStatus = $request->status ?? $report->status;

        if ($newStatus === 'sent') {
            $newStatus = 'under_review';
        }

        $report->update([
            'title' => $request->title,
            'type' => $request->type,
            'content' => $request->content,
            'status' => $newStatus,
            'period_start' => $request->period_start,
            'period_end' => $request->period_end,
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('reports/' . $report->id, 'public');
                ReportFile::create([
                    'report_id' => $report->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث التقرير بنجاح',
            'report' => $report->load('files')
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $member = $user->member;

        $report = Report::findOrFail($id);

        if ($user->role !== 'admin' && !$member->manage_reports && $report->member_id !== $member->id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بحذف هذا التقرير'
            ], 403);
        }

        foreach ($report->files as $file) {
            Storage::disk('public')->delete($file->file_path);
        }

        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف التقرير بنجاح'
        ]);
    }

    public function reply(Request $request, $id)
    {
        $user = Auth::user();
        $member = $user->member;

        $report = Report::findOrFail($id);

        $isAdmin = $user->role === 'admin';
        $canManage = $member->manage_reports;
        $isOwner = $report->member_id === $member->id;

        if (!$isAdmin && !$canManage && !$isOwner) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالرد على هذا التقرير'
            ], 403);
        }

        if ($report->status === 'draft' && !$isAdmin && !$canManage) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن الرد على تقرير في حالة المسودة'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'reply' => 'nullable|string',
            'parent_id' => 'nullable|exists:report_replies,id',
            'status' => 'nullable|in:approved,rejected,under_review',
            'files.*' => 'nullable|file|mimes:' . $this->allowedMimes . '|max:10240',
        ], [
            'reply.string' => 'الرد يجب أن يكون نصًا',
            'parent_id.exists' => 'الرد الأصلي غير موجود',
            'status.in' => 'الحالة غير صالحة',
            'files.*.file' => 'يجب أن يكون العنصر ملفًا صالحًا',
            'files.*.mimes' => 'الملف يجب أن يكون من الأنواع المسموحة: صور (jpg, png, gif), مستندات (pdf, doc, docx), عروض تقديمية (ppt, pptx), ملفات مضغوطة (zip, rar)',
            'files.*.max' => 'حجم الملف لا يجب أن يتجاوز 10 ميجابايت',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $validation = $this->validateFileByType($file);
                if (!$validation['valid']) {
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'files' => [
                                sprintf(
                                    'الملف "%s" غير صالح. النوع: %s، الحجم الحالي: %s، الحد الأقصى المسموح: %s',
                                    $validation['fileName'],
                                    $validation['type'] ?? 'غير معروف',
                                    $validation['currentSizeFormatted'],
                                    $validation['maxSizeFormatted']
                                )
                            ]
                        ]
                    ], 422);
                }
            }
        }

        if ($request->parent_id) {
            $parentReply = ReportReply::find($request->parent_id);
            if (!$parentReply || $parentReply->report_id !== $report->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'الرد الأصلي غير صالح'
                ], 422);
            }
        }

        $replyData = [
            'report_id' => $report->id,
            'member_id' => $member->id,
            'parent_id' => $request->parent_id,
            'reply' => $request->reply ?? '',
            'is_edited' => false,
        ];

        $statusChanged = false;
        if (($isAdmin || $canManage) && $request->has('status') && $request->status) {
            $replyData['status'] = $request->status;
            $report->update(['status' => $request->status, 'replied_at' => now()]);
            $statusChanged = true;
        } else {
            $report->update(['replied_at' => now()]);
        }

        $reply = ReportReply::create($replyData);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('replies/' . $reply->id, 'public');
                ReportReplyFile::create([
                    'report_reply_id' => $reply->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        $this->sendReplyNotificationToOwner($report, $reply, $statusChanged);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال الرد بنجاح',
            'reply' => $reply->load('files', 'member.user'),
            'report' => $report->load(['member', 'files', 'replies.files'])
        ]);
    }

    public function updateReply(Request $request, $replyId)
    {
        $user = Auth::user();
        $member = $user->member;

        $reply = ReportReply::findOrFail($replyId);
        $report = $reply->report;

        $isOwner = $reply->member_id === $member->id;
        $isAdmin = $user->role === 'admin';
        $canManage = $member->manage_reports;

        if (!$isOwner && !$isAdmin && !$canManage) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتعديل هذا الرد'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'reply' => 'required|string',
            'status' => 'nullable|in:approved,rejected,under_review',
            'files.*' => 'nullable|file|mimes:' . $this->allowedMimes . '|max:10240',
        ], [
            'reply.required' => 'الرد مطلوب',
            'reply.string' => 'الرد يجب أن يكون نصًا',
            'status.in' => 'الحالة غير صالحة',
            'files.*.file' => 'يجب أن يكون العنصر ملفًا صالحًا',
            'files.*.mimes' => 'الملف يجب أن يكون من الأنواع المسموحة: صور (jpg, png, gif), مستندات (pdf, doc, docx), عروض تقديمية (ppt, pptx), ملفات مضغوطة (zip, rar)',
            'files.*.max' => 'حجم الملف لا يجب أن يتجاوز 10 ميجابايت',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $validation = $this->validateFileByType($file);
                if (!$validation['valid']) {
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'files' => [
                                sprintf(
                                    'الملف "%s" غير صالح. النوع: %s، الحجم الحالي: %s، الحد الأقصى المسموح: %s',
                                    $validation['fileName'],
                                    $validation['type'] ?? 'غير معروف',
                                    $validation['currentSizeFormatted'],
                                    $validation['maxSizeFormatted']
                                )
                            ]
                        ]
                    ], 422);
                }
            }
        }

        $reply->update([
            'reply' => $request->reply,
            'is_edited' => true,
        ]);

        $statusChanged = false;
        if (($isAdmin || $canManage) && $request->has('status') && $request->status) {
            $reply->update(['status' => $request->status]);
            $report->update(['status' => $request->status]);
            $statusChanged = true;
        }

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('replies/' . $reply->id, 'public');
                ReportReplyFile::create([
                    'report_reply_id' => $reply->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        if ($statusChanged) {
            $this->sendReplyNotificationToOwner($report, $reply, true);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الرد بنجاح',
            'reply' => $reply->load('files', 'member.user'),
            'report' => $report->load(['member', 'files', 'replies.files'])
        ]);
    }

    public function deleteReplyFile($id)
    {
        $user = Auth::user();
        $member = $user->member;

        $file = ReportReplyFile::findOrFail($id);
        $reply = $file->reply;
        $report = $reply->report;

        $isOwner = $reply->member_id === $member->id;
        $isAdmin = $user->role === 'admin';
        $canManage = $member->manage_reports;

        if (!$isOwner && !$isAdmin && !$canManage) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بحذف هذا الملف'
            ], 403);
        }

        Storage::disk('public')->delete($file->file_path);
        $file->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الملف بنجاح'
        ]);
    }

    public function deleteReply($replyId)
    {
        $user = Auth::user();
        $member = $user->member;

        $reply = ReportReply::findOrFail($replyId);

        if ($user->role !== 'admin' && !$member->manage_reports) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بحذف هذا الرد'
            ], 403);
        }

        foreach ($reply->files as $file) {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
        }

        $reply->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الرد بنجاح'
        ]);
    }

    public function deleteFile($id)
    {
        $user = Auth::user();
        $member = $user->member;

        $file = ReportFile::findOrFail($id);
        $report = $file->report;

        if ($user->role !== 'admin' && !$member->manage_reports && $report->member_id !== $member->id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بحذف هذا الملف'
            ], 403);
        }

        Storage::disk('public')->delete($file->file_path);
        $file->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الملف بنجاح'
        ]);
    }

    private function sendReplyNotificationToOwner($report, $reply, $statusChanged = false)
    {
        try {
            $reportOwner = $report->member?->user;
            $replyAuthor = $reply->member?->user;

            if (!$reportOwner || ($replyAuthor && $reportOwner->id === $replyAuthor->id)) {
                return;
            }

            if ($reportOwner && $reportOwner->email) {
                Mail::to($reportOwner->email)->queue(new ReportActionMail(
                    $report,
                    $reply->status ?? $report->status,
                    $reportOwner,
                    $reply,
                    $statusChanged
                ));
            }
        } catch (\Exception $e) {
            \Log::error('Error sending reply notification: ' . $e->getMessage());
        }
    }
    
}