<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportReplyFile extends Model
{
    protected $fillable = [
        'report_reply_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
    ];

    public function reply(): BelongsTo
    {
        return $this->belongsTo(ReportReply::class, 'report_reply_id');
    }
}