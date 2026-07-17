<?php

namespace App\Http\Controllers;

use App\Models\LeaderboardSetting;
use App\Models\LeaderboardNote;
use App\Models\Member;
use App\Models\Task;
use App\Models\Event;
use App\Models\Report;
use App\Models\EventAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;
        $companyId = $user->company_id;

        $settings = LeaderboardSetting::where('company_id', $companyId)->first();
        $note = LeaderboardNote::where('company_id', $companyId)->first();

        $members = Member::where('company_id', $companyId)
            ->whereHas('user', function($query) {
                $query->where('role', '!=', 'admin');
            })
            ->get();

        $criteria = $settings ? $settings->criteria : ['tasks', 'rating', 'events', 'reports'];
        $timePeriod = $settings ? $settings->time_period : 'all';

        $leaderboardData = $this->calculateScores($members, $criteria, $timePeriod);

        $canManage = $user->role === 'admin' || ($member && $member->manage_leaderboard);

        return response()->json([
            'success' => true,
            'leaderboard' => $leaderboardData,
            'settings' => $settings,
            'note' => $note,
            'canManage' => $canManage,
        ]);
    }

    public function getSettings()
    {
        $user = Auth::user();
        $member = $user->member;
        $companyId = $user->company_id;

        $canManage = $user->role === 'admin' || ($member && $member->permission->manage_leaderboard);

        if (!$canManage) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإدارة لوحة الشرف'
            ], 403);
        }

        $settings = LeaderboardSetting::where('company_id', $companyId)->first();
        $note = LeaderboardNote::where('company_id', $companyId)->first();

        return response()->json([
            'success' => true,
            'settings' => $settings,
            'note' => $note,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;
        $companyId = $user->company_id;

        $canManage = $user->role === 'admin' || ($member && $member->permission->manage_leaderboard);

        if (!$canManage) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإدارة لوحة الشرف'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'criteria' => 'required|array',
            'criteria.*' => 'string|in:tasks,events,rating,daily_reports,weekly_reports,monthly_reports,custom_reports,all_reports',
            'time_period' => 'required|in:weekly,monthly,yearly,all',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $settings = LeaderboardSetting::updateOrCreate(
            ['company_id' => $companyId],
            [
                'criteria' => $request->criteria,
                'time_period' => $request->time_period,
                'updated_by' => $member ? $member->id : null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث إعدادات لوحة الشرف بنجاح',
            'settings' => $settings,
        ]);
    }

    public function updateNote(Request $request)
    {
        $user = Auth::user();
        $member = $user->member;
        $companyId = $user->company_id;

        $canManage = $user->role === 'admin' || ($member && $member->permission->manage_leaderboard);

        if (!$canManage) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتعديل الملاحظة'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if (empty($request->content)) {
            LeaderboardNote::where('company_id', $companyId)->delete();
            return response()->json([
                'success' => true,
                'message' => 'تم حذف الملاحظة',
                'note' => null,
            ]);
        }

        $note = LeaderboardNote::updateOrCreate(
            ['company_id' => $companyId],
            [
                'content' => $request->content,
                'member_id' => $member ? $member->id : null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الملاحظة بنجاح',
            'note' => $note,
        ]);
    }

    private function calculateScores($members, $criteria, $timePeriod)
    {
        $companyId = $members->first()->company_id ?? null;
        
        $dateRange = $this->getDateRange($timePeriod);

        $scores = [];

        foreach ($members as $member) {
            if (!$member->user || $member->user->role === 'admin') {
                continue;
            }

            $totalScore = 0;
            $memberData = [
                'id' => $member->id,
                'name' => $member->name,
                'image' => $member->image,
                'user' => $member->user,
                'rating' => $member->rating,
                'scores' => [],
            ];

            foreach ($criteria as $criterion) {
                $score = 0;
                switch ($criterion) {
                    case 'tasks':
                        $score = $this->getTasksScore($member->user_id, $companyId, $dateRange);
                        break;
                    case 'events':
                        $score = $this->getEventsScore($member->user_id, $companyId, $dateRange);
                        break;
                    case 'rating':
                        $score = $member->rating;
                        break;
                    case 'daily_reports':
                        $score = $this->getReportsScore($member->id, $companyId, 'daily', $dateRange);
                        break;
                    case 'weekly_reports':
                        $score = $this->getReportsScore($member->id, $companyId, 'weekly', $dateRange);
                        break;
                    case 'monthly_reports':
                        $score = $this->getReportsScore($member->id, $companyId, 'monthly', $dateRange);
                        break;
                    case 'custom_reports':
                        $score = $this->getReportsScore($member->id, $companyId, 'custom', $dateRange);
                        break;
                    case 'all_reports':
                        $score = $this->getReportsScore($member->id, $companyId, null, $dateRange);
                        break;
                }

                $memberData['scores'][$criterion] = $score;
                $totalScore += $score;
            }

            $memberData['total_score'] = round($totalScore, 1);
            $scores[] = $memberData;
        }

        usort($scores, function($a, $b) {
            return $b['total_score'] <=> $a['total_score'];
        });

  
        foreach ($scores as $index => &$score) {
            $score['rank'] = $index + 1;
            if ($index == 0) {
                $score['medal'] = '🥇';
                $score['medal_label'] = 'الموظف المثالي';
            } elseif ($index == 1) {
                $score['medal'] = '🥈';
                $score['medal_label'] = 'المركز الفضي';
            } elseif ($index == 2) {
                $score['medal'] = '🥉';
                $score['medal_label'] = 'المركز البرونزي';
            } else {
                $score['medal'] = null;
                $score['medal_label'] = null;
            }
        }

        return $scores;
    }

    private function getDateRange($timePeriod)
    {
        switch ($timePeriod) {
            case 'weekly':
                return [
                    'start' => now()->startOfWeek(),
                    'end' => now()->endOfWeek(),
                ];
            case 'monthly':
                return [
                    'start' => now()->startOfMonth(),
                    'end' => now()->endOfMonth(),
                ];
            case 'yearly':
                return [
                    'start' => now()->startOfYear(),
                    'end' => now()->endOfYear(),
                ];
            default:
                return null;
        }
    }

 
    private function getTasksScore($userId, $companyId, $dateRange)
    {
        $query = Task::where('assigned_to', $userId)
            ->where('company_id', $companyId)
            ->where('status', 'completed');

        if ($dateRange) {
            $query->whereBetween('updated_at', [$dateRange['start'], $dateRange['end']]);
        }

        return $query->count(); 
    }


    private function getEventsScore($userId, $companyId, $dateRange)
    {
        $query = EventAttendance::where('user_id', $userId)
            ->where('status', 'attending')
            ->whereHas('event', function($q) use ($companyId) {
                $q->where('company_id', $companyId);
            });

        if ($dateRange) {
            $query->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }

        return $query->count(); 
    }


    private function getReportsScore($memberId, $companyId, $type, $dateRange)
    {
        $query = Report::where('member_id', $memberId)
            ->where('company_id', $companyId)
            ->where('status', 'approved');

        if ($type) {
            $query->where('type', $type);
        }

        if ($dateRange) {
            $query->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }

        return $query->count(); 
    }


    public function deleteNote()
    {
        $user = Auth::user();
        $member = $user->member;
        $companyId = $user->company_id;

        $canManage = $user->role === 'admin' || ($member && $member->permission->manage_leaderboard);

        if (!$canManage) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بحذف الملاحظة'
            ], 403);
        }

        $note = LeaderboardNote::where('company_id', $companyId)->first();
        if ($note) {
            $note->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الملاحظة بنجاح',
        ]);
    }
}