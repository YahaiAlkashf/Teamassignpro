<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Cycle;
use App\Models\Company;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne; // ← أضف هذا السطر

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'cycle_id',
        'role',
        'rating',
        'permissions',
        'user_id',
        'member_id',
        'company_id',
        'jop_title',
        'image',
    ];

    protected $casts = [
        'permissions' => 'array',
        'rating' => 'integer'
    ];

    public function cycle()
    {
        return $this->belongsTo(Cycle::class, 'cycle_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function leaderboardNotes(): HasMany
    {
        return $this->hasMany(LeaderboardNote::class);
    }

    public function canManageLeaderboard(): bool
    {
        return $this->manage_leaderboard || false;
    }

    public function permission(): HasOne
    {
        return $this->hasOne(MemberPermission::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(MemberNote::class);
    }

    public function hasPermission($permission): bool
    {
        if (!$this->permission) {
            return false;
        }
        return $this->permission->{$permission} ?? false;
    }
}