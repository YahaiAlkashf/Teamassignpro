<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Report extends Model
{
    //use SoftDeletes;

    protected $fillable = [
        'member_id',
        'company_id',
        'title',
        'type',
        'content',
        'status',
        'manager_reply',
        'replied_at',
        'period_start',
        'period_end',
        'report_reply_id '
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'replied_at' => 'datetime',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(ReportFile::class);
    }

    public function scopeDaily($query)
    {
        return $query->where('type', 'daily');
    }

    public function scopeWeekly($query)
    {
        return $query->where('type', 'weekly');
    }

    public function scopeMonthly($query)
    {
        return $query->where('type', 'monthly');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeUnderReview($query)
    {
        return $query->where('status', 'under_review');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
    public function replies(): HasMany
    {
        return $this->hasMany(ReportReply::class);
    }

    public function rootReplies(): HasMany
    {
        return $this->hasMany(ReportReply::class)->whereNull('parent_id');
    }
}