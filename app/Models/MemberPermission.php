<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberPermission extends Model
{
    protected $fillable = [
        'member_id',
        'manage_members',
        'add_tasks',
        'add_events',
        'add_library',
        'add_advertisement',
        'manage_reports',
        'manage_notes',
        'manage_leaderboard',
    ];

    protected $casts = [
        'manage_members' => 'boolean',
        'add_tasks' => 'boolean',
        'add_events' => 'boolean',
        'add_library' => 'boolean',
        'add_advertisement' => 'boolean',
        'manage_reports' => 'boolean',
        'manage_notes' => 'boolean',
        'manage_leaderboard' => 'boolean',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}