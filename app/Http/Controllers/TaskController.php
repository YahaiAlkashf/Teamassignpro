<?php

namespace App\Http\Controllers;

use App\Mail\TaskAssignedMail;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

use function Termwind\ask;

class TaskController extends Controller
{

    private function sendEmail($user, $task)
    {
        Mail::to($user->email)->queue(new TaskAssignedMail($task, $user));
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        $tasks = Task::with(['files', 'assigner', 'assignee'])
            ->where('company_id', $user->company_id)->orderBy('updated_at', 'desc')
            ->get();

        return response()->json(['tasks' => $tasks]);
    }

    public function store(Request $request)
    {
        $allowedMimes = [
            'jpg,jpeg,png,gif,webp,svg',
            'pdf,doc,docx,xls,xlsx,txt',
            'ppt,pptx',
            'zip,rar,7z'
        ];

        $allMimes = implode(',', [
            'jpg','jpeg','png','gif','webp','svg',
            'pdf','doc','docx','xls','xlsx','txt',
            'ppt','pptx',
            'zip','rar','7z'
        ]);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'description' => 'nullable|string',
            'assigned_to' => 'required|array',
            'assigned_to.*' => 'required|exists:users,id',
            'due_date' => 'required|date|after_or_equal:today',
            'files.*' => 'nullable|file|mimes:' . $allMimes . '|max:10240',
        ], [
            'title.required' => 'العنوان مطلوب',
            'title.string' => 'العنوان يجب أن يكون نصًا',
            'title.max' => 'العنوان يجب ألا يزيد عن 255 حرفًا',

            'description.string' => 'الوصف يجب أن يكون نصًا',

            'assigned_to.required' => 'يجب تحديد المسؤول',
            'assigned_to.exists' => 'المسؤول المحدد غير موجود',

            'due_date.required' => 'تاريخ الاستحقاق مطلوب',
            'due_date.date' => 'تاريخ الاستحقاق غير صالح',
            'due_date.after_or_equal' => 'تاريخ الاستحقاق يجب أن يكون اليوم أو بعده',

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

        $arr = count($request->assigned_to);
        $countTasks = Task::where('company_id', Auth::user()->company_id)
         ->max('task_id');

        $newTaskId = $countTasks ? $countTasks + 1 : 1;
        $countTasks = Task::where('company_id', Auth::user()->company_id)->count();

        foreach ($request->assigned_to as $user_id) {
            $user = User::findOrFail($user_id);
            $assignedUser = User::findOrFail($user_id);
            if ($assignedUser->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن تعيين المهمة لمستخدم من شركة أخرى'
                ], 403);
            }

                $task = Task::create([
                    'title' => $request->title,
                    'description' => $request->description,
                    'assigned_to' => $user_id,
                    'assigned_by' => Auth::id(),
                    'due_date' => $request->due_date,
                    'status' => 'in_progress',
                    'company_id' => Auth::user()->company_id,
                    'task_id' => $newTaskId,
                ]);

            $user = User::find($user_id);

            if ($user && $user->email) {
                // Mail::to($user->email)->send(new TaskAssignedMail($task, $user));
               $this->sendEmail($user , $task);
            }
         if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store("tasks/{$task->id}", 'public');

                $task->files()->create([
                    'file_name'   => $file->getClientOriginalName(),
                    'file_path'   => $path,
                    'file_type'   => $file->getClientMimeType(),
                    'uploaded_by' => Auth::id(),
                ]);
            }
        }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المهمة بنجاح',
            'task'    => $task->load(['assignee', 'files'])
        ], 201);
    }


    private function validateFileByType($file)
    {

        $maxSizes = [
            'image' => 5120,      
            'document' => 10240,   
            'presentation' => 20480, 
            'archive' => 25600,    
            'default' => 10240,     
        ];

     
        $types = [
            'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            'document' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'],
            'presentation' => ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            'archive' => ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
        ];

        // تحديد نوع الملف
        $fileType = 'default';
        $mimeType = $file->getMimeType();
        foreach ($types as $type => $mimes) {
            if (in_array($mimeType, $mimes)) {
                $fileType = $type;
                break;
            }
        }

        // الحجم الأقصى المسموح
        $maxSize = $maxSizes[$fileType] ?? $maxSizes['default'];

        // التحقق من الحجم
        $isValid = $file->isValid() && $file->getSize() <= ($maxSize * 1024);

        // تنسيق الحجم للعرض
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

    public function update(Request $request, $id)
    {
        $originalTask = Task::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->firstOrFail();
        $allMimes = implode(',', [
            'jpg','jpeg','png','gif','webp','svg',
            'pdf','doc','docx','xls','xlsx','txt',
            'ppt','pptx',
            'zip','rar','7z'
        ]);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'required|array',
            'assigned_to.*' => 'required|exists:users,id',
            'due_date' => 'required|date|after_or_equal:today',
            'files.*' => 'nullable|file|mimes:' . $allMimes . '|max:10240',
        ], [
            'title.required' => 'العنوان مطلوب',
            'title.string' => 'العنوان يجب أن يكون نصًا',
            'title.max' => 'العنوان يجب ألا يزيد عن 255 حرفًا',

            'description.string' => 'الوصف يجب أن يكون نصًا',

            'assigned_to.required' => 'يجب تحديد المسؤول',
            'assigned_to.exists' => 'المسؤول المحدد غير موجود',

            'due_date.required' => 'تاريخ الاستحقاق مطلوب',
            'due_date.date' => 'تاريخ الاستحقاق غير صالح',
            'due_date.after_or_equal' => 'تاريخ الاستحقاق يجب أن يكون اليوم أو بعده',

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

        try {
            $arr = count($request->assigned_to);
            $taskIdToUse = $originalTask->task_id;

            if ($arr > 1 && !$originalTask->task_id) {
                $maxTaskId = Task::where('company_id', Auth::user()->company_id)->max('task_id');
                $taskIdToUse = $maxTaskId ? $maxTaskId + 1 : 1;
            }

            $uploadedFiles = [];
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $uploadedFiles[] = $file;
                }
            }

            $originalTasksData = [];
            if ($originalTask->task_id) {
                $groupTasks = Task::where('task_id', $originalTask->task_id)
                    ->where('company_id', Auth::user()->company_id)
                    ->with('files')
                    ->get();

                foreach ($groupTasks as $groupTask) {
                    $originalTasksData[] = [
                        'task' => $groupTask,
                        'files' => $groupTask->files->toArray()
                    ];
                }
            } else {
                $originalTasksData[] = [
                    'task' => $originalTask,
                    'files' => $originalTask->files->toArray()
                ];
            }

            if ($originalTask->task_id) {
                $groupTasks = Task::where('task_id', $originalTask->task_id)
                    ->where('company_id', Auth::user()->company_id)
                    ->get();

                foreach ($groupTasks as $groupTask) {
                    $groupTask->delete();
                }
            } else {
                $originalTask->delete();
            }

            $createdTasks = [];

            foreach ($request->assigned_to as $user_id) {
                $assignedUser = User::findOrFail($user_id);
                if ($assignedUser->company_id !== Auth::user()->company_id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'لا يمكن تعيين المهمة لمستخدم من شركة أخرى'
                    ], 403);
                }

                $taskData = [
                    'title' => $request->title,
                    'description' => $request->description,
                    'assigned_to' => $user_id,
                    'assigned_by' => Auth::id(),
                    'due_date' => $request->due_date,
                    'status' => 'in_progress',
                    'company_id' => Auth::user()->company_id,
                    'task_id' => $taskIdToUse,
                ];

                $task = Task::create($taskData);
                $createdTasks[] = $task;

                if (!empty($uploadedFiles)) {
                    foreach ($uploadedFiles as $file) {
                        $path = $file->store("tasks/{$task->id}", 'public');
                        $task->files()->create([
                            'file_name' => $file->getClientOriginalName(),
                            'file_path' => $path,
                            'file_type' => $file->getMimeType(),
                            'uploaded_by' => Auth::id(),
                        ]);
                    }
                }

                $user = User::find($user_id);
                if ($user && $user->email) {
                    $this->sendEmail($user, $task);
                }
            }

            foreach ($originalTasksData as $originalData) {
                foreach ($originalData['files'] as $file) {
                    if (Storage::disk('public')->exists($file['file_path'])) {
                        Storage::disk('public')->delete($file['file_path']);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث المهمة بنجاح',
                'tasks' => $createdTasks,
                'files_uploaded' => count($uploadedFiles)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تحديث المهمة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $task = Task::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->firstOrFail();

            $tasks=Task::where('company_id', Auth::user()->company_id)->where('task_id', $task->task_id)->get();
            foreach ($tasks as $task) {
                foreach ($task->files as $file) {
                 Storage::disk('public')->delete($file->file_path);
                $file->delete();
            }
            $task->delete();
        }
        return response()->json([
            'success' => true,
            'message' => 'تم حذف المهمة بنجاح'
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $task = Task::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,pending,in_progress,completed,overdue'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $task->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة المهمة بنجاح',
            'task' => $task
        ]);
    }

    public function taskText(Request $request ,$id)
    {
        // تعريف الامتدادات المسموحة
        $allMimes = implode(',', [
            'jpg','jpeg','png','gif','webp','svg',
            'pdf','doc','docx','xls','xlsx','txt',
            'ppt','pptx',
            'zip','rar','7z'
        ]);

        $validator = Validator::make($request->all(), [
            'task_text' => 'nullable|string',
            'task_file' => 'nullable|file|mimes:' . $allMimes . '|max:10240',
        ], [
            'task_text.string' => 'النص يجب أن يكون نصًا',
            'task_file.file' => 'يجب أن يكون العنصر ملفًا صالحًا',
            'task_file.mimes' => 'الملف يجب أن يكون من الأنواع المسموحة: صور (jpg, png, gif), مستندات (pdf, doc, docx), عروض تقديمية (ppt, pptx), ملفات مضغوطة (zip, rar)',
            'task_file.max' => 'حجم الملف لا يجب أن يتجاوز 10 ميجابايت',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        // التحقق الإضافي من الملف حسب نوعه
        if ($request->hasFile('task_file')) {
            $file = $request->file('task_file');
            $validation = $this->validateFileByType($file);
            if (!$validation['valid']) {
                return response()->json([
                    'success' => false,
                    'errors' => [
                        'task_file' => [
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

        $task = Task::where('id', $id)
            ->where('company_id', Auth::user()->company_id)
            ->firstOrFail();

        if ($request->filled('task_text')) {
            $task->update(['task_text' => $request->task_text]);
        }

        if ($request->hasFile('task_file')) {
            // حذف الملف القديم إذا وجد
            if ($task->task_file && Storage::disk('public')->exists($task->task_file)) {
                Storage::disk('public')->delete($task->task_file);
            }

            $file = $request->file('task_file');
            $path = $file->store("tasks/{$task->id}", 'public');

            $task->update([
                'task_file' => $path,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المهمة بنجاح',
            'task'    => $task
        ]);
    }
}