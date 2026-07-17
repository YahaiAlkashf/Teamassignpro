<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Member;
use App\Models\User;
use App\Mail\NoteNotificationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;
        $companyId = $user->company_id;

        $query = Note::with(['member'])
            ->where('company_id', $companyId);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $notes = $query->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'notes' => $notes
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ], [
            'title.required' => 'عنوان الملاحظة مطلوب',
            'content.required' => 'محتوى الملاحظة مطلوب',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $note = Note::create([
            'member_id' => $member->id,
            'company_id' => $user->company_id,
            'title' => $request->title,
            'content' => $request->content,
            'is_pinned' => false,
        ]);

        // Send email notification to all members except the creator
        $this->sendNoteNotification($note, $member, 'created');

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الملاحظة بنجاح',
            'note' => $note->load('member')
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();
        $member = $user->member;

        $note = Note::with(['member'])->findOrFail($id);

        if ($note->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بمشاهدة هذه الملاحظة'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'note' => $note
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $member = $user->member;

        $note = Note::findOrFail($id);

        if ( $user->role !== 'admin' && !$member->permission->manage_notes) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتعديل هذه الملاحظة'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $note->update([
            'title' => $request->title,
            'content' => $request->content,
        ]);

        // Send email notification to all members except the editor
        $this->sendNoteNotification($note, $member, 'updated');

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الملاحظة بنجاح',
            'note' => $note->load('member')
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $member = $user->member;

        $note = Note::findOrFail($id);

        if ( $user->role !== 'admin' && !$member->permission->manage_notes) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بحذف هذه الملاحظة'
            ], 403);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الملاحظة بنجاح'
        ]);
    }

    public function togglePin($id)
    {
        $user = Auth::user();
        $member = $user->member;

        $note = Note::findOrFail($id);

        if ($user->role !== 'admin' &&  !$member->permission->manage_notes) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتثبيت الملاحظات'
            ], 403);
        }

        $note->update([
            'is_pinned' => !$note->is_pinned
        ]);

        return response()->json([
            'success' => true,
            'message' => $note->is_pinned ? 'تم تثبيت الملاحظة' : 'تم إلغاء تثبيت الملاحظة',
            'note' => $note
        ]);
    }

    /**
     * Send email notification to all members in the company except the sender
     */
    private function sendNoteNotification($note, $sender, $action)
    {
        try {
            $companyId = $note->company_id;

            // Get all members in the company with their users
            $members = Member::where('company_id', $companyId)
                ->where('id', '!=', $sender->id) // Exclude the sender
                ->with('user')
                ->get();

            $actionLabels = [
                'created' => '📝 ملاحظة جديدة',
                'updated' => '✏️ تحديث ملاحظة',
            ];

            $subject = $actionLabels[$action] ?? '📝 ملاحظة جديدة';

            foreach ($members as $member) {
                if ($member->user && $member->user->email) {
                    Mail::to($member->user->email)->queue(new NoteNotificationMail($note, $sender, $action));
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error sending note notification: ' . $e->getMessage());
        }
    }
}