<?php

use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CycleController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\MemberNoteController;
use App\Http\Controllers\LeaderboardController;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Index');
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', function () {
    return Inertia::render('Index');
})->middleware(['auth', 'verified'])->name('dashboard');

/*
|--------------------------------------------------------------------------
| Profile Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Protected Routes (plan, verified, access-system middleware)
|--------------------------------------------------------------------------
*/
Route::middleware(['plan', 'verified', 'access-system'])->group(function () {
    // Clubs Routes
    Route::get('/clubs', function () {
        return Inertia::render('clubs/index');
    });
    Route::get('/clubs/tasks', function () {
        return Inertia::render('clubs/Tasks');
    });
    Route::get('/clubs/members', function () {
        return Inertia::render('clubs/Members');
    });
    Route::get('/clubs/reports', function () {
        return Inertia::render('clubs/Reports');
    });
    Route::get('/clubs/resources', function () {
        return Inertia::render('clubs/Resources');
    });
    Route::get('/clubs/schedule', function () {
        return Inertia::render('clubs/Schedule');
    });
    Route::get('/clubs/memberprofile', function () {
        return Inertia::render('clubs/MemberProfile');
    });
    Route::get('/clubs/announcements', function () {
        return Inertia::render('clubs/Announcements');
    });
    Route::get('/clubs/api_access', function () {
        return Inertia::render('clubs/API_Access');
    });
    Route::get('/clubs/whatsapp', function () {
        return Inertia::render('clubs/Whatsapp');
    });
    Route::get('/clubs/notes', function () {
        return Inertia::render('clubs/Notes');
    });
    Route::get('/clubs/settings', function (Request $request) {
        return Inertia::render('clubs/Settings', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    });

    // Admin Routes
    Route::get('/admin', function () {
        return Inertia::render('admin/index');
    });
    Route::get('/admin/products', function () {
        return Inertia::render('admin/Products');
    });
    Route::get('/admin/customers', function () {
        return Inertia::render('admin/Customers');
    });
    Route::get('/admin/users', function () {
        return Inertia::render('admin/users');
    });
    Route::get('/admin/api_access', function () {
        return Inertia::render('admin/API_Access');
    });
    Route::get('/admin/settings', function (Request $request) {
        return Inertia::render('admin/Settings', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    });
    Route::get('/admin/whatsapp', function () {
        return Inertia::render('admin/Whatsapp');
    });
    Route::get('/admin/plans', function () {
        return Inertia::render('admin/Plans');
    });
    Route::get('/clubs/leaderboard', function () {
    return Inertia::render('clubs/Leaderboard');
    });
});

/*
|--------------------------------------------------------------------------
| API Tokens Route
|--------------------------------------------------------------------------
*/
Route::get('/api-tokens', function () {
    return Inertia::render('ApiTokens');
})->middleware('auth');

/*
|--------------------------------------------------------------------------
| Plans Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['verified'])->group(function () {
    Route::get('/allplans', function () {
        return Inertia::render('Plans');
    })->middleware('manageplanpage');
    Route::post('/subscription/basic', [AdminUserController::class, 'subscriptionBasic']);
    Route::post('/subscription/coupons', [AdminUserController::class, 'subscriptioncoupons']);
    Route::post('/subscription/free', [AdminUserController::class, 'activateFreeSubscription']);
});

/*
|--------------------------------------------------------------------------
| Clubs System API Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['plan'])->group(function () {
    Route::get('/members', [MemberController::class, 'index']);
    Route::post('/members', [MemberController::class, 'store']);
    Route::post('/members/{member}', [MemberController::class, 'update']);
    Route::delete('/members/{member}', [MemberController::class, 'destroy']);
    Route::get('/member/profile', [MemberController::class, 'memberProfile']);
    Route::get('/members-with-details', [MemberController::class, 'getMembersWithDetails']);
    Route::get('/members/{id}/events', [MemberController::class, 'getMemberEvents']);
    Route::get('/members/{id}/tasks', [MemberController::class, 'getMemberTasks']);
    Route::get('/members/{id}/all-events', [MemberController::class, 'getMemberAllEvents']);
    Route::get('/members/{id}/all-tasks', [MemberController::class, 'getMemberAllTasks']);
    Route::Post('/memberimage/{id}', [MemberController::class, 'EditProfile']);
    Route::Post('/memberId/{id}', [MemberController::class, 'EditProfileId']);
    Route::Post('/memberTitle/{id}', [MemberController::class, 'EditProfileTitle']);
    Route::get('/members/export-excel', [MemberController::class, 'exportExcel'])->name('members.export.excel');
    Route::get('/members/export-pdf', [MemberController::class, 'exportPdf'])->name('members.export.pdf');


    // Member Notes Routes
    Route::post('/member-notes', [MemberNoteController::class, 'store']);
    Route::put('/member-notes/{id}', [MemberNoteController::class, 'update']);
    Route::delete('/member-notes/{id}', [MemberNoteController::class, 'destroy']);
    Route::get('/member-notes/{memberId}', [MemberNoteController::class, 'getMemberNotes']);

    // Cycle Routes
    Route::get('/cycles', [CycleController::class, 'index']);
    Route::post('/cycles', [CycleController::class, 'store']);
    Route::PUT('/cycles/{id}', [CycleController::class, 'update']);
    Route::delete('/cycles/{id}', [CycleController::class, 'destroy']);

    // Task Routes
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    Route::post('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::post('/tasktext/{id}', [TaskController::class, 'taskText']);

    // Event Routes
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::post('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::post('/events/{id}/status', [EventController::class, 'attendEvent']);

    // Library Routes
    Route::get('/library/folders', [LibraryController::class, 'getFolders']);
    Route::post('/library/folders', [LibraryController::class, 'createFolder']);
    Route::put('/library/folders/{id}', [LibraryController::class, 'updateFolder']);
    Route::delete('/library/folders/{id}', [LibraryController::class, 'deleteFolder']);
    Route::get('/library/files', [LibraryController::class, 'getFolderFiles']);
    Route::get('/library/folders/{folderId}/files', [LibraryController::class, 'getFolderFiles']);
    Route::post('/library/files', [LibraryController::class, 'uploadFiles']);
    Route::get('/library/files/{id}/download', [LibraryController::class, 'downloadFile']);
    Route::get('/library/files/{id}/view', [LibraryController::class, 'viewFile']);
    Route::delete('/library/files/{id}', [LibraryController::class, 'deleteFile']);
    Route::get('/library/search', [LibraryController::class, 'searchFiles']);

    // Announcement Routes
    Route::get('/announcement', [AnnouncementController::class, 'index']);
    Route::post('/announcement', [AnnouncementController::class, 'store']);
    Route::delete('/announcement', [AnnouncementController::class, 'destroy']);

    // Message Routes
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);


    // Report Routes
    Route::get('/reports', [ReportController::class, 'index']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    Route::put('/reports/{id}', [ReportController::class, 'update']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);
    Route::delete('/reports/files/{id}', [ReportController::class, 'deleteFile']);

    // Reply Routes 
    Route::post('/reports/{id}/reply', [ReportController::class, 'reply']);
    Route::put('/replies/{id}', [ReportController::class, 'updateReply']);
    Route::delete('/replies/{id}', [ReportController::class, 'deleteReply']);
    Route::delete('/replies/files/{id}', [ReportController::class, 'deleteReplyFile']);

    // Notes Routes
    Route::get('/notes', [NoteController::class, 'index']);
    Route::post('/notes', [NoteController::class, 'store']);
    Route::get('/notes/{id}', [NoteController::class, 'show']);
    Route::put('/notes/{id}', [NoteController::class, 'update']);
    Route::delete('/notes/{id}', [NoteController::class, 'destroy']);
    Route::post('/notes/{id}/toggle-pin', [NoteController::class, 'togglePin']);

    // Leaderboard Routes
    Route::get('/leaderboard', [LeaderboardController::class, 'index']);
    Route::get('/leaderboard/settings', [LeaderboardController::class, 'getSettings']);
    Route::post('/leaderboard/settings', [LeaderboardController::class, 'updateSettings']);
    Route::post('/leaderboard/note', [LeaderboardController::class, 'updateNote']);
     Route::delete('/leaderboard/note', [LeaderboardController::class, 'deleteNote']);
});

/*
|--------------------------------------------------------------------------
| Manager Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['manager'])->group(function () {
    Route::get('/users', [AdminUserController::class, 'users']);
    Route::get('/customers', [AdminUserController::class, 'customers']);
    Route::post('/users', [AdminUserController::class, 'store'])->name("addUser");
    Route::post('/users/{id}', [AdminUserController::class, 'update'])->name("users.update");
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
    Route::post('/addSubscription/{id}', [AdminUserController::class, 'addSubscription'])->name('addSubscription');
    Route::get('/plans', [PlanController::class, 'index']);
    Route::post('/plans', [PlanController::class, 'store']);
    Route::put('/plans/{id}', [PlanController::class, 'update']);
    Route::delete('/plans/{id}', [PlanController::class, 'destroy']);

    Route::get('/export-users-pdf', [AdminUserController::class, 'exportUsersPDF'])->name('admin.exportUsersPDF');
    Route::get('/export-users-excel', [AdminUserController::class, 'exportUsersExcel'])->name('admin.exportUsersExcel');

    Route::get('/admin/export-users-pdf', [AdminUserController::class, 'exportUsersPDF'])->name('admin.exportUsersPDF');
    Route::get('/admin/export-users-excel', [AdminUserController::class, 'exportUsersExcel'])->name('admin.exportUsersExcel');

    // Coupon Routes
    Route::post('/coupons', [PlanController::class, 'storeCoupons']);
    Route::put('/coupons/{id}', [PlanController::class, 'updateCoupon']);
    Route::delete('/coupons/{id}', [PlanController::class, 'deleteCoupon']);
});

/*
|--------------------------------------------------------------------------
| Public Plan Routes
|--------------------------------------------------------------------------
*/
Route::get('/plans', [PlanController::class, 'index']);