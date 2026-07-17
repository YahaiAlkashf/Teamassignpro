<?php

namespace App\Mail;

use App\Models\MemberNote;
use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MemberNoteMail extends Mailable
{
    use Queueable, SerializesModels;

    public $note;
    public $creator;

    public function __construct(MemberNote $note, Member $creator)
    {
        $this->note = $note;
        $this->creator = $creator;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📝 ملاحظة جديدة من الإدارة',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.member-note',
            with: [
                'note' => $this->note,
                'creator' => $this->creator,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}