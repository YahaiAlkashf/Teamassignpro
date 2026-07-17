<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\MemberPermission;
use App\Models\User;
use App\Models\Event;
use App\Models\Task;
use App\Models\EventAttendance;
use Elibyy\TCPDF\TCPDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class MemberController extends Controller
{
    public function index()
    {
        try {
            $members = Member::with(['cycle', 'user', 'permission','notes'])
                ->where('company_id', Auth::user()->company_id)
                ->get();

            return response()->json([
                'success' => true,
                'members' => $members
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed',
            'cycle_id' => 'nullable|exists:cycles,id',
            'role' => 'nullable',
            'rating' => 'required|integer|min:0|max:5',
            'member_id' => ['nullable', Rule::unique('members', 'member_id')->where('company_id', Auth::user()->company_id)],
            'jop_title' => 'nullable|string|max:255',
            // Permissions
            'manage_members' => 'nullable|boolean',
            'add_tasks' => 'nullable|boolean',
            'add_events' => 'nullable|boolean',
            'add_library' => 'nullable|boolean',
            'add_advertisement' => 'nullable|boolean',
            'manage_reports' => 'nullable|boolean',
            'manage_notes' => 'nullable|boolean',
            'manage_leaderboard' => 'nullable|boolean',
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',
            'phone.string' => 'رقم الهاتف يجب أن يكون نصًا',
            'phone.max' => 'رقم الهاتف يجب ألا يزيد عن 20 حرفًا',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صالح',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق',
            'cycle_id.exists' => 'القسم المحدد غير موجود',
            'rating.required' => 'التقييم مطلوب',
            'rating.integer' => 'التقييم يجب أن يكون رقمًا صحيحًا',
            'rating.min' => 'التقييم لا يمكن أن يكون أقل من 0',
            'rating.max' => 'التقييم لا يمكن أن يكون أكبر من 5',
            'member_id.unique' => 'رقم العضو مستخدم بالفعل',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Create User
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'user',
                'company_id' => Auth::user()->company_id,
                'country' => Auth::user()->country,
                'subscription' => Auth::user()->subscription,
                'subscription_expires_at' => Auth::user()->subscription_expires_at,
                'trial_used' => Auth::user()->trial_used,
            ]);

            // Create Member
            $member = Member::create([
                'name' => $request->name,
                'phone' => $request->phone,
                'cycle_id' => $request->cycle_id,
                'role' => $user->role,
                'rating' => $request->rating,
                'user_id' => $user->id,
                'member_id' => $request->member_id ?? null,
                'company_id' => Auth::user()->company_id,
                'jop_title' => $request->jop_title,
            ]);

            // Create Member Permissions
            MemberPermission::create([
                'member_id' => $member->id,
                'manage_members' => $request->manage_members ?? false,
                'add_tasks' => $request->add_tasks ?? false,
                'add_events' => $request->add_events ?? false,
                'add_library' => $request->add_library ?? false,
                'add_advertisement' => $request->add_advertisement ?? false,
                'manage_reports' => $request->manage_reports ?? false,
                'manage_notes' => $request->manage_notes ?? false,
                'manage_leaderboard' => $request->manage_leaderboard ?? false,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إضافة العضو بنجاح',
                'member' => $member->load(['user', 'permission'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إضافة العضو: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Member $member)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'required|email|unique:users,email,' . $member->user_id,
            'password' => 'nullable|confirmed',
            'cycle_id' => 'nullable|exists:cycles,id',
            'role' => 'nullable',
            'rating' => 'required|integer|min:0|max:5',
            'member_id' => ['nullable', Rule::unique('members', 'member_id')->where('company_id', Auth::user()->company_id)->ignore($member->id)],
            'jop_title' => 'nullable|string|max:255',
            // Permissions
            'manage_members' => 'nullable|boolean',
            'add_tasks' => 'nullable|boolean',
            'add_events' => 'nullable|boolean',
            'add_library' => 'nullable|boolean',
            'add_advertisement' => 'nullable|boolean',
            'manage_reports' => 'nullable|boolean',
            'manage_notes' => 'nullable|boolean',
            'manage_leaderboard' => 'nullable|boolean',
        ], [
            'name.required' => 'الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصًا',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفًا',
            'phone.string' => 'رقم الهاتف يجب أن يكون نصًا',
            'phone.max' => 'رقم الهاتف يجب ألا يزيد عن 20 حرفًا',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صالح',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل',
            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق',
            'cycle_id.exists' => 'القسم المحدد غير موجود',
            'rating.required' => 'التقييم مطلوب',
            'rating.integer' => 'التقييم يجب أن يكون رقمًا صحيحًا',
            'rating.min' => 'التقييم لا يمكن أن يكون أقل من 0',
            'rating.max' => 'التقييم لا يمكن أن يكون أكبر من 5',
            'member_id.unique' => 'رقم العضو مستخدم بالفعل',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Update User
            $user = User::findOrFail($member->user_id);
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            // Update Member
            $member->update([
                'name' => $request->name,
                'phone' => $request->phone,
                'cycle_id' => $request->cycle_id,
                'role' => $user->role,
                'rating' => $request->rating,
                'member_id' => $request->member_id ?? null,
                'jop_title' => $request->jop_title,
            ]);

            // Update or Create Permissions
            MemberPermission::updateOrCreate(
                ['member_id' => $member->id],
                [
                    'manage_members' => $request->manage_members ?? false,
                    'add_tasks' => $request->add_tasks ?? false,
                    'add_events' => $request->add_events ?? false,
                    'add_library' => $request->add_library ?? false,
                    'add_advertisement' => $request->add_advertisement ?? false,
                    'manage_reports' => $request->manage_reports ?? false,
                    'manage_notes' => $request->manage_notes ?? false,
                    'manage_leaderboard' => $request->manage_leaderboard ?? false,
                ]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث بيانات العضو بنجاح',
                'member' => $member->load(['user', 'permission'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تحديث العضو: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $member = Member::findOrFail($id);

        $user = User::findOrFail($member->user_id);
        
        if ($user->role == 'superadmin') {
            return response()->json(['error' => 'لا يمكن حذف هذا المستخدم'], 422);
        }

        DB::beginTransaction();

        try {
            // Delete permissions first
            MemberPermission::where('member_id', $member->id)->delete();
            
            // Delete member
            $member->delete();
            
            // Delete user
            $user->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف العضو بنجاح'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حذف العضو: ' . $e->getMessage()
            ], 500);
        }
    }

    public function memberProfile()
    {
        $member = Member::where('user_id', Auth::user()->id)
            ->with(['company', 'cycle', 'permission'])
            ->first();
        
        return response()->json([
            'member' => $member
        ]);
    }

    public function getMembersWithDetails()
    {
        try {
            $companyId = Auth::user()->company_id;

            $startOfMonth = now()->startOfMonth()->toDateString();
            $endOfMonth = now()->endOfMonth()->toDateString();

            $members = Member::with(['user', 'cycle', 'permission', 'notes'])
                ->where('company_id', $companyId)
                ->get();

            $attendanceCounts = EventAttendance::join('users', 'event_attendances.user_id', '=', 'users.id')
                ->join('members', 'users.id', '=', 'members.user_id')
                ->join('events', 'event_attendances.event_id', '=', 'events.id')
                ->where('members.company_id', $companyId)
                ->where('event_attendances.status', 'attending')
                ->whereBetween('events.date', [$startOfMonth, $endOfMonth])
                ->selectRaw('members.id as member_id, COUNT(*) as attending_count')
                ->groupBy('members.id')
                ->get()
                ->keyBy('member_id');

            $completedTasksCounts = Task::join('users', 'tasks.assigned_to', '=', 'users.id')
                ->join('members', 'users.id', '=', 'members.user_id')
                ->where('members.company_id', $companyId)
                ->where('tasks.status', 'completed')
                ->whereBetween('tasks.due_date', [$startOfMonth, $endOfMonth])
                ->selectRaw('members.id as member_id, COUNT(*) as completed_tasks_count')
                ->groupBy('members.id')
                ->get()
                ->keyBy('member_id');

            $members = $members->map(function ($member) use ($attendanceCounts, $completedTasksCounts) {
                $attendanceData = $attendanceCounts[$member->id] ?? null;
                $completedTasksData = $completedTasksCounts[$member->id] ?? null;

                $member->attended_events_count = $attendanceData->attending_count ?? 0;
                $member->completed_tasks_count = $completedTasksData->completed_tasks_count ?? 0;
                $member->total_score = $member->attended_events_count + $member->completed_tasks_count;

                return $member;
            });

            return response()->json([
                'success' => true,
                'members' => $members,
                'period' => 'شهر ' . now()->translatedFormat('F Y')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب بيانات الأعضاء',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMemberAllEvents($id)
    {
        try {
            $member = Member::findOrFail($id);

            if ($member->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح بالوصول إلى بيانات هذا العضو'
                ], 403);
            }

            $events = Event::join('event_attendances', 'events.id', '=', 'event_attendances.event_id')
                ->where('event_attendances.user_id', $member->user_id)
                ->select('events.*', 'event_attendances.status as attendance_status')
                ->orderBy('events.date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'events' => $events
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب أحداث العضو'
            ], 500);
        }
    }

    public function getMemberAllTasks($id)
    {
        try {
            $member = Member::findOrFail($id);

            if ($member->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح بالوصول إلى بيانات هذا العضو'
                ], 403);
            }

            $tasks = Task::with(['assigner', 'assignee', 'files'])
                ->where('assigned_to', $member->user_id)
                ->where('company_id', $member->company_id)
                ->orderBy('due_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'tasks' => $tasks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب مهام العضو'
            ], 500);
        }
    }

    public function getMemberEvents($id)
    {
        try {
            $member = Member::findOrFail($id);

            if ($member->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح بالوصول إلى بيانات هذا العضو'
                ], 403);
            }

            $events = Event::join('event_attendances', 'events.id', '=', 'event_attendances.event_id')
                ->where('event_attendances.user_id', $member->user_id)
                ->where('event_attendances.status', 'attending')
                ->select('events.*', 'event_attendances.status as attendance_status')
                ->orderBy('events.date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'events' => $events
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب أحداث العضو'
            ], 500);
        }
    }

    public function getMemberTasks($id)
    {
        try {
            $member = Member::findOrFail($id);

            if ($member->company_id !== Auth::user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح بالوصول إلى بيانات هذا العضو'
                ], 403);
            }

            $tasks = Task::with(['assigner', 'assignee'])
                ->where('assigned_to', $member->user_id)
                ->where('company_id', $member->company_id)
                ->orderBy('due_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'tasks' => $tasks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب مهام العضو'
            ], 500);
        }
    }

    // public function exportPDF(Request $request)
    // {
    //     $sortBy = $request->get('sort_by', 'default');
    //     $search = $request->get('search', '');

    //     $members = $this->getFilteredMembers($sortBy, $search);

    //     $user = Auth::user();
    //     $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);

    //     $pdf->SetCreator('System');
    //     $pdf->SetAuthor($user->name);
    //     $pdf->SetTitle('تقرير الأعضاء');
    //     $pdf->SetSubject('تقرير الأعضاء');

    //     $pdf->AddPage();
    //     $pdf->SetFont('dejavusans', '', 12);

    //     $html = '<h1 style="text-align:center; font-family:dejavusans;">تقرير الأعضاء</h1>';
    //     $html .= '<p style="text-align:center;">تاريخ التقرير: ' . date('Y-m-d') . '</p>';

    //     $html .= '<table dir="rtl" border="1" cellpadding="5" style="width:100%; border-collapse:collapse; direction:rtl; text-align:right; font-family:dejavusans;">';
    //     $html .= "<thead><tr>
    //             <th>#</th>
    //             <th>الاسم</th>
    //             <th>البريد الإلكتروني</th>
    //             <th>القسم</th>
    //             <th>رقم التليفون</th>
    //             <th>الرقم التعريفى (ID)</th>
    //             <th>المسمى الوظيفى</th>
    //             <th>التقييم</th>
    //             <th>الأحداث الحاضرة</th>
    //             <th>المهام المكتملة</th>
    //             <th>المجموع الكلي</th>
    //             </tr></thead>";

    //     $html .= '<tbody>';

    //     foreach ($members as $index => $member) {
    //         $stars = '';
    //         for ($i = 1; $i <= 5; $i++) {
    //             $stars .= $i <= $member->rating ? '★' : '☆';
    //         }

    //         $html .= '<tr>
    //                 <td>' . ($index + 1) . '</td>
    //                 <td>' . $member->name . '</td>
    //                 <td>' . ($member->user->email ?? 'لا يوجد') . '</td>
    //                 <td>' . ($member->cycle->name ?? 'لا يوجد') . '</td>
    //                 <td>' . ($member->phone ?? 'لا يوجد') . '</td>
    //                 <td>' . ($member->member_id ?? 'لا يوجد') . '</td>
    //                 <td>' . ($member->jop_title ?? 'لا يوجد') . '</td>
    //                 <td>' . $stars . '</td>
    //                 <td>' . ($member->attended_events_count ?? 0) . '</td>
    //                 <td>' . ($member->completed_tasks_count ?? 0) . '</td>
    //                 <td>' . ($member->total_score ?? 0) . '</td>
    //                 </tr>';
    //     }

    //     $html .= '</tbody></table>';

    //     $pdf->writeHTML($html, true, false, true, false, '');

    //     $fileName = 'أعضاء_' . date('Y-m-d') . '.pdf';
    //     $pdf->Output($fileName, 'D');

    //     exit;
    // }

    public function exportExcel(Request $request)
    {
        $sortBy = $request->get('sort_by', 'default');
        $search = $request->get('search', '');

        $members = $this->getFilteredMembers($sortBy, $search);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('الأعضاء');
        $sheet->setRightToLeft(true);

        $headers = [
            '#', 'الاسم', 'البريد الإلكتروني', 'القسم',
            'رقم التليفون', 'المسمى الوظيفى', 'الرقم التعريفي (ID)', 'التقييم',
            'الأحداث الحاضرة', 'المهام المكتملة', 'المجموع الكلي'
        ];

        $sheet->fromArray($headers, null, 'A1');

        $headerStyle = [
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => '000000']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color' => ['rgb' => 'FFFF00']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000']
                ]
            ]
        ];

        $sheet->getStyle('A1:K1')->applyFromArray($headerStyle);

        $row = 2;
        foreach ($members as $index => $member) {
            $stars = '';
            for ($i = 1; $i <= 5; $i++) {
                $stars .= $i <= $member->rating ? '★' : '☆';
            }

            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $member->name);
            $sheet->setCellValue('C' . $row, $member->user->email ?? 'لا يوجد');
            $sheet->setCellValue('D' . $row, $member->cycle->name ?? 'لا يوجد');
            $sheet->setCellValue('E' . $row, $member->phone ?? 'لا يوجد');
            $sheet->setCellValue('F' . $row, $member->jop_title ?? 'لا يوجد');
            $sheet->setCellValue('G' . $row, $member->member_id ?? 'لا يوجد');
            $sheet->setCellValue('H' . $row, $stars);
            $sheet->setCellValue('I' . $row, $member->attended_events_count ?? 0);
            $sheet->setCellValue('J' . $row, $member->completed_tasks_count ?? 0);
            $sheet->setCellValue('K' . $row, $member->total_score ?? 0);
            $row++;
        }

        foreach (range('A', 'K') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $fileName = 'أعضاء_' . date('Y-m-d') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $content = ob_get_clean();

        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    private function getFilteredMembers($sortBy, $search)
    {
        $companyId = Auth::user()->company_id;

        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $members = Member::with(['user', 'cycle', 'permission'])
            ->where('company_id', $companyId)
            ->where(function($query) use ($search) {
                $query->where('name', 'like', "%$search%")
                    ->orWhere('phone', 'like', "%$search%")
                    ->orWhere('member_id', 'like', "%$search%")
                    ->orWhere('jop_title', 'like', "%$search%")
                    ->orWhereHas('user', function($q) use ($search) {
                        $q->where('email', 'like', "%$search%");
                    });
            })
            ->get();

        $attendanceCounts = EventAttendance::join('users', 'event_attendances.user_id', '=', 'users.id')
            ->join('members', 'users.id', '=', 'members.user_id')
            ->join('events', 'event_attendances.event_id', '=', 'events.id')
            ->where('members.company_id', $companyId)
            ->where('event_attendances.status', 'attending')
            ->whereBetween('events.date', [$startOfMonth, $endOfMonth])
            ->selectRaw('members.id as member_id, COUNT(*) as attending_count')
            ->groupBy('members.id')
            ->get()
            ->keyBy('member_id');

        $completedTasksCounts = Task::join('users', 'tasks.assigned_to', '=', 'users.id')
            ->join('members', 'users.id', '=', 'members.user_id')
            ->where('members.company_id', $companyId)
            ->where('tasks.status', 'completed')
            ->whereBetween('tasks.due_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('members.id as member_id, COUNT(*) as completed_tasks_count')
            ->groupBy('members.id')
            ->get()
            ->keyBy('member_id');

        $members = $members->map(function ($member) use ($attendanceCounts, $completedTasksCounts) {
            $attendanceData = $attendanceCounts[$member->id] ?? null;
            $completedTasksData = $completedTasksCounts[$member->id] ?? null;

            $member->attended_events_count = $attendanceData->attending_count ?? 0;
            $member->completed_tasks_count = $completedTasksData->completed_tasks_count ?? 0;
            $member->total_score = $member->attended_events_count + $member->completed_tasks_count;

            return $member;
        });

        switch ($sortBy) {
            case "completed_tasks":
                $members = $members->sortByDesc('completed_tasks_count');
                break;
            case "attended_events":
                $members = $members->sortByDesc('attended_events_count');
                break;
            case "total_score":
                $members = $members->sortByDesc('total_score');
                break;
            default:
                break;
        }

        return $members;
    }

    public function EditProfile(Request $request, $id)
    {
    $validator = Validator::make($request->all(), [
            'image' => 'nullable|image|max:5120',
        ], [
            'image.image' => 'يجب أن يكون الملف صورة',
            'image.max' => 'حجم الصورة لا يجب أن يتجاوز 5 ميجابايت',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $member = Member::findOrFail($id);

        if ($request->file('image')) {
            if (!empty($member->image) && Storage::disk('public')->exists($member->image)) {
                Storage::disk('public')->delete($member->image);
            }
            $image = $request->file('image')->store('members_image', 'public');
            $member->update(['image' => $image]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الصورة بنجاح'
        ]);
    }

    public function EditProfileId(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'member_id' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $member = Member::findOrFail($id);
        $member->update(['member_id' => $request->member_id]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الرقم التعريفي بنجاح'
        ]);
    }

    public function EditProfileTitle(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $member = Member::findOrFail($id);
        $member->update(['jop_title' => $request->title]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المسمى الوظيفي بنجاح'
        ]);
    }
}