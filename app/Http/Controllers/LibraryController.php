<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Folder;
use App\Models\File;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class LibraryController extends Controller
{
    // تعريف الامتدادات المسموحة
    private $allowedMimes = 'jpg,jpeg,png,gif,webp,svg,pdf,doc,docx,xls,xlsx,txt,ppt,pptx,zip,rar,7z';
    
    // تعريف الأحجام القصوى حسب النوع (بالكيلوبايت)
    private $maxSizes = [
        'image' => 5120,        // 5 MB
        'document' => 10240,    // 10 MB
        'presentation' => 20480, // 20 MB
        'archive' => 25600,     // 25 MB
        'default' => 10240,     // 10 MB
    ];

    private $fileTypes = [
        'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        'document' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'],
        'presentation' => ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        'archive' => ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
    ];

    /**
     * التحقق من صحة الملف حسب نوعه
     */
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

    public function getFolders()
    {
        $folders = Folder::where('company_id', Auth::user()->company_id)->withCount('files')->get();
        return response()->json([
            'folders' => $folders
        ], 200);
    }

    public function createFolder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id'
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',
            'parent_id.exists' => 'المجلد الأب غير موجود'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $folder = Folder::create([
            'name' => $request->name,
            'company_id' => Auth::user()->company_id,
            'parent_id' => $request->parent_id
        ]);

        return response()->json([
            'message' => 'تم إنشاء المجلد بنجاح',
            'folder' => $folder
        ], 201);
    }

    public function updateFolder(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255'
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $folder = Folder::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        $folder->update([
            'name' => $request->name
        ]);

        return response()->json([
            'message' => 'تم تحديث المجلد بنجاح',
            'folder' => $folder
        ], 200);
    }

    public function deleteFolder($id)
    {
        $folder = Folder::where('company_id', Auth::user()->company_id)
            ->with('files')
            ->findOrFail($id);

        foreach ($folder->files as $file) {
            Storage::delete('public/' . $file->path);
            $file->delete();
        }

        $folder->delete();

        return response()->json([
            'message' => 'تم حذف المجلد وجميع محتوياته بنجاح'
        ], 200);
    }

    public function getFolderFiles($folderId = null)
    {
        $query = File::where('company_id', Auth::user()->company_id)
            ->with('uploadedBy');

        if ($folderId) {
            $query->where('folder_id', $folderId);
        } else {
            $query->whereNull('folder_id');
        }

        $files = $query->get();

        return response()->json([
            'files' => $files
        ], 200);
    }

    public function uploadFiles(Request $request)
    {
        // قواعد التحقق المحسنة للملفات
        $validator = Validator::make($request->all(), [
            'files' => 'required|array',
            'files.*' => 'file|mimes:' . $this->allowedMimes . '|max:10240',
            'folder_id' => 'nullable|exists:folders,id'
        ], [
            'files.required' => 'الملفات مطلوبة',
            'files.array' => 'الملفات يجب أن تكون على شكل مصفوفة',
            'files.*.file' => 'يجب أن يكون العنصر ملفًا صالحًا',
            'files.*.mimes' => 'الملف يجب أن يكون من الأنواع المسموحة: صور (jpg, png, gif), مستندات (pdf, doc, docx), عروض تقديمية (ppt, pptx), ملفات مضغوطة (zip, rar, 7z)',
            'files.*.max' => 'حجم الملف لا يجب أن يتجاوز 10 ميجابايت',
            'folder_id.exists' => 'المجلد المحدد غير موجود',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // التحقق الإضافي من صحة الملفات حسب نوعها
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

        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();

            $cleanName = preg_replace('/[^a-zA-Z0-9_\-\s\.]/', '_', $originalName);
            $fileName = time() . '_' . $cleanName;

            $folderPath = $request->folder_id ? "library/{$request->folder_id}" : "library";

            if (!Storage::exists('public/' . $folderPath)) {
                Storage::makeDirectory('public/' . $folderPath);
            }

            $path = $file->storeAs($folderPath, $fileName, 'public');

            $uploadedFile = File::create([
                'name' => $originalName,
                'path' => $path,
                'size' => $file->getSize(),
                'extension' => $extension,
                'folder_id' => $request->folder_id,
                'company_id' => Auth::user()->company_id,
                'uploaded_by' => Auth::id(),
            ]);

            $uploadedFiles[] = $uploadedFile;
        }

        return response()->json([
            'message' => 'تم رفع الملفات بنجاح',
            'files' => $uploadedFiles
        ], 201);
    }

    public function downloadFile($id)
    {
        $file = File::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        $storedFileName = basename($file->path);
        $directory = dirname($file->path);

        $filePath = storage_path('app/public/' . $file->path);

        if (!file_exists($filePath)) {
            $filesInDirectory = Storage::files('public/' . $directory);

            foreach ($filesInDirectory as $storedFile) {
                if (strpos($storedFile, $storedFileName) !== false) {
                    $filePath = storage_path('app/' . $storedFile);
                    break;
                }
            }

            if (!file_exists($filePath)) {
                return response()->json([
                    'message' => 'الملف غير موجود'
                ], 404);
            }
        }

        $headers = [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="' . $file->name . '"',
        ];

        return response()->download($filePath, $file->name, $headers);
    }

    /**
     * عرض الملف مباشرة في المتصفح
     */
    public function viewFile($id)
    {
        $file = File::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        $filePath = storage_path('app/public/' . $file->path);

        if (!file_exists($filePath)) {
            return response()->json([
                'message' => 'الملف غير موجود'
            ], 404);
        }

        // تحديد نوع المحتوى حسب امتداد الملف
        $extension = strtolower($file->extension);
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt' => 'text/plain',
            'zip' => 'application/zip',
            'rar' => 'application/x-rar-compressed',
            '7z' => 'application/x-7z-compressed',
        ];

        $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $file->name . '"',
        ]);
    }

    public function deleteFile($id)
    {
        $file = File::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        Storage::delete('public/' . $file->path);

        $file->delete();

        return response()->json([
            'message' => 'تم حذف الملف بنجاح'
        ], 200);
    }

    public function searchFiles(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2'
        ], [
            'query.required' => 'حقل البحث مطلوب',
            'query.string' => 'حقل البحث يجب أن يكون نصًا',
            'query.min' => 'حقل البحث يجب أن يكون على الأقل حرفين',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $files = File::where('company_id', Auth::user()->company_id)
            ->where('name', 'like', '%' . $request->query . '%')
            ->get();

        return response()->json([
            'files' => $files
        ], 200);
    }
}