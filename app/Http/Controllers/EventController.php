<?php

namespace App\Http\Controllers;

use App\Mail\EventCreatedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class EventController extends Controller
{
public function index()
{
    $events = Event::where('company_id', Auth::user()->company_id)
        ->with(['attendances', 'attendances.user', 'attendances.user.member.cycle'])
        ->orderBy('date', 'asc')
        ->get();

    return response()->json([
        'events' => $events
    ], 200);
}

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'description' => 'required|string',
            'date' => 'required|date|after_or_equal:today',
            'option' => 'required|in:select,not_select'
        ], [
            'title.required' => 'العنوان مطلوب',
            'title.string' => 'العنوان يجب أن يكون نصًا',

            'description.required' => 'الوصف مطلوب',
            'description.string' => 'الوصف يجب أن يكون نصًا',

            'date.required' => 'التاريخ مطلوب',
            'date.date' => 'التاريخ غير صالح',
            'date.after_or_equal' => 'التاريخ يجب أن يكون اليوم أو بعده',

            'option.required' => 'الاختيار مطلوب',
            'option.in' => 'القيمة المختارة غير صحيحة'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $event = Event::create([
            'title' => $request->title,
            'description' => $request->description,
            'date' => $request->date,
            'option' => $request->option,
            'company_id' => Auth::user()->company_id,
        ]);

        $users = User::where('company_id', Auth::user()->company_id)->get();
        foreach ($users as $user) {
            if ($user->email) {
                $this->sendMails($user ,$event);
            }
        }



        return response()->json([
            'message' => 'تم اضافة الحدث بنجاح',
            'event' => $event
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'description' => 'required|string',
            'date' => 'required|date|after_or_equal:today',
            'option' => 'required|in:select,not_select',
        ], [
            'title.required' => 'العنوان مطلوب',
            'title.string' => 'العنوان يجب أن يكون نصًا',

            'description.required' => 'الوصف مطلوب',
            'description.string' => 'الوصف يجب أن يكون نصًا',

            'date.required' => 'التاريخ مطلوب',
            'date.date' => 'التاريخ غير صالح',
            'date.after_or_equal' => 'التاريخ يجب أن يكون اليوم أو بعده',

            'option.required' => 'الاختيار مطلوب',
            'option.in' => 'القيمة المختارة غير صحيحة',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $event = Event::findOrFail($id);

        if ($event->company_id !== Auth::user()->company_id) {
            return response()->json([
                'message' => 'ليس لديك صلاحية تعديل هذا الحدث'
            ], 403);
        }

        $event->update([
            'title' => $request->title,
            'description' => $request->description,
            'date' => $request->date,
            'option' => $request->option
        ]);
        $users = User::where('company_id', Auth::user()->company_id)->get();
        foreach ($users as $user) {
            if ($user->email) {
                $this->sendMails($user ,$event);
            }
        }
        return response()->json([
            'message' => 'تم تعديل الحدث بنجاح',
            'event' => $event
        ], 200);
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);

        if ($event->company_id !== Auth::user()->company_id) {
            return response()->json([
                'message' => 'ليس لديك صلاحية حذف هذا الحدث'
            ], 403);
        }

        $event->delete();

        return response()->json([
            'message' => 'تم حذف الحدث بنجاح'
        ], 200);
    }

    public function attendEvent(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:attending,apologizing'
        ], [
            'status.required' => 'حالة الحضور مطلوبة',
            'status.in' => 'القيمة المختارة غير صحيحة'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $event = Event::findOrFail($id);

        if ($event->company_id !== Auth::user()->company_id) {
            return response()->json([
                'message' => 'ليس لديك صلاحية الحضور لهذا الحدث'
            ], 403);
        }

        $existingAttendance = EventAttendance::where('user_id', Auth::user()->id)
                                           ->where('event_id', $event->id)
                                           ->first();

        if ($existingAttendance) {
            return response()->json([
                'message' => 'لقد سجلت حضورك لهذا الحدث مسبقاً'
            ], 409);
        }

        $eventAttendance = EventAttendance::create([
            'user_id' => Auth::user()->id,
            'event_id' => $event->id,
            'status' => $request->status
        ]);

        return response()->json([
            'message' => 'تم تسجيل حضورك للحدث بنجاح',
            'attendance' => $eventAttendance
        ], 201);
    }

    private function sendMails($user ,$event ){
        Mail::to($user->email)->queue(new EventCreatedMail($event, $user));
    }



    protected function formatEventMessage($event)
    {
        $eventDate = Carbon::parse($event->date);
        $formattedDate = $eventDate->format('Y-m-d H:i');

        $message = "🎉 فعالية جديدة\n\n";
        $message .= "العنوان: {$event->title}\n";
        $message .= "الموعد: {$formattedDate}\n";

        if (!empty($event->description)) {
            $description = strlen($event->description) > 50 ?
                substr($event->description, 0, 50) . '...' : $event->description;
            $message .= "الوصف: {$description}\n\n";
        }

        if ($event->option === 'select') {
            $message .= "يرجى التسجيل للحضور أو الاعتذار من خلال النظام 📋";
        } else {
            $message .= "نتمنى مشاركتكم في الفعالية 🤗";
        }

        return $message;
    }
}
