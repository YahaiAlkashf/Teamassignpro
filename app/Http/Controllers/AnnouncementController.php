<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Models\Announcement;
use App\Models\User;
use App\Mail\AnnouncementMail;

class AnnouncementController extends Controller
{

    public function index()
    {
        $companyId = Auth::user()->company_id;
        $announcement = Announcement::where('company_id', $companyId)
            ->latest()
            ->first();

        return response()->json([
            'announcement' => $announcement ? $announcement->content : ''
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string'
        ], [
            'content.required' => 'الحقل مطلوب'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $companyId = Auth::user()->company_id;
        $currentUser = Auth::user();

        $oldAnnouncement = Announcement::where('company_id', $companyId)->first();

        Announcement::where('company_id', $companyId)->delete();

        $announcement = Announcement::create([
            'company_id' => $companyId,
            'user_id' => Auth::id(),
            'content' => $request->content
        ]);

        $this->sendAnnouncementEmail($companyId, $currentUser->id, $request->content, $oldAnnouncement ? true : false);

        return response()->json([
            'message' => 'تم حفظ الإعلان بنجاح',
            'announcement' => $announcement
        ]);
    }

    public function destroy()
    {
        $companyId = Auth::user()->company_id;
        $currentUser = Auth::user();

        $oldAnnouncement = Announcement::where('company_id', $companyId)->first();

        Announcement::where('company_id', $companyId)->delete();



        return response()->json([
            'message' => 'تم حذف الإعلان بنجاح'
        ]);
    }

    private function sendAnnouncementEmail($companyId, $currentUserId, $content, $isUpdate = false, $isDelete = false)
    {
        try {
            $users = User::where('company_id', $companyId)
                ->where('id', '!=', $currentUserId)
                ->get();

            if ($users->isEmpty()) {
                return;
            }

            $actionText = $isDelete ? 'تم حذف' : ($isUpdate ? 'تم تحديث' : 'تم إضافة');

            foreach ($users as $user) {
                Mail::to($user->email)->queue(new AnnouncementMail(
                    $user,
                    $content,
                    $actionText,
                    $isDelete
                ));
            }
        } catch (\Exception $e) {
            \Log::error('Error sending announcement email: ' . $e->getMessage());
        }
    }
}