<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReportActionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $report;
    public $status;
    public $recipient;
    public $reply;
    public $statusChanged;

    public function __construct($report, $status, $recipient = null, $reply = null, $statusChanged = false)
    {
        $this->report = $report;
        $this->status = $status;
        $this->recipient = $recipient;
        $this->reply = $reply;
        $this->statusChanged = $statusChanged;
    }

    public function envelope(): Envelope
    {
        // لو في رد ومفيش تغيير حالة → رد فقط
        if ($this->reply && $this->reply->reply && !$this->statusChanged) {
            return new Envelope(
                subject: '💬 تم الرد على تقريرك: ' . $this->report->title,
            );
        }

        // لو في تغيير حالة مع رد
        if ($this->reply && $this->reply->reply && $this->statusChanged) {
            return new Envelope(
                subject: '📋 تحديث حالة التقرير مع رد: ' . $this->report->title,
            );
        }

        // لو تغيير حالة فقط (قبول/رفض/تحت المراجعة)
        $subjects = [
            'approved' => '✅ تم قبول تقريرك: ' . $this->report->title,
            'rejected' => '❌ تم رفض تقريرك: ' . $this->report->title,
            'under_review' => '🔄 تقريرك تحت المراجعة: ' . $this->report->title,
        ];

        return new Envelope(
            subject: $subjects[$this->status] ?? 'تحديث على تقريرك: ' . $this->report->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.report-action',
            with: [
                'report' => $this->report,
                'status' => $this->status,
                'recipient' => $this->recipient,
                'reply' => $this->reply,
                'statusChanged' => $this->statusChanged,
                'hasReply' => $this->reply && $this->reply->reply,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}