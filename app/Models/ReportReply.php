<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportReply extends Model
{
    protected $fillable = [
        'report_id',
        'member_id',
        'parent_id',
        'reply',
        'status',
        'is_edited',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
    ];

   
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

  
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ReportReply::class, 'parent_id');
    }


    public function children(): HasMany
    {
        return $this->hasMany(ReportReply::class, 'parent_id');
    }

  
    public function files(): HasMany
    {
        return $this->hasMany(ReportReplyFile::class);
    }
}