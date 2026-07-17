<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaderboardNote extends Model
{
    protected $fillable = [
        'company_id',
        'content',
        'member_id',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}