<?php

namespace App\Http\Controllers;

use App\Models\MemberNote;
use App\Models\Member;
use App\Mail\MemberNoteMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class MemberNoteController extends Controller
{
    public function store(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;

        if ($user->role !== 'admin' && !$member?->permission?->manage_members) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإضافة ملاحظات'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'member_id' => 'required|exists:members,id',
            'note' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $note = MemberNote::create([
            'member_id' => $request->member_id,
            'company_id' => $user->company_id,
            'created_by' => $member->id,
            'note' => $request->note,
        ]);

        $targetMember = Member::with('user')->find($request->member_id);
        if ($targetMember && $targetMember->user && $targetMember->user->email) {
            Mail::to($targetMember->user->email)->queue(new MemberNoteMail($note, $member));
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الملاحظة بنجاح',
            'note' => $note->load('createdBy'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $member = $user->member;

        $note = MemberNote::findOrFail($id);

        if ($user->role !== 'admin' && !$member?->permission?->manage_members) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتعديل هذه الملاحظة'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'note' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $note->update(['note' => $request->note]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الملاحظة بنجاح',
            'note' => $note->load('createdBy'),
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $member = $user->member;

        $note = MemberNote::findOrFail($id);

        if ($user->role !== 'admin' && !$member?->permission?->manage_members) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بحذف هذه الملاحظة'
            ], 403);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الملاحظة بنجاح',
        ]);
    }

    public function getMemberNotes($memberId)
    {
        $user = Auth::user();
        $member = $user->member;

        if ($member->id !== (int)$memberId && $user->role !== 'admin' && !$member?->permission?->manage_members) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بمشاهدة هذه الملاحظات'
            ], 403);
        }

        $notes = MemberNote::with('createdBy')
            ->where('member_id', $memberId)
            ->where('company_id', $user->company_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'notes' => $notes,
        ]);
    }
}