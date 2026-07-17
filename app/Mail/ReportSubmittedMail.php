<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReportSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $report;
    public $manager;

    public function __construct($report, $manager)
    {
        $this->report = $report;
        $this->manager = $manager;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📋 تقرير جديد: ' . $this->report->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.report-submitted',
            with: [
                'report' => $this->report,
                'manager' => $this->manager,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}