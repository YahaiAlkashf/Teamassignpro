<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaderboardSetting extends Model
{
    protected $fillable = [
        'company_id',
        'criteria',
        'time_period',
        'updated_by',
    ];

    protected $casts = [
        'criteria' => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'updated_by');
    }
}