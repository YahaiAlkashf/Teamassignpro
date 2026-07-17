<?php

namespace App\Mail;

use App\Models\Note;
use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NoteNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $note;
    public $sender;
    public $action;

    public function __construct(Note $note, Member $sender, $action)
    {
        $this->note = $note;
        $this->sender = $sender;
        $this->action = $action;
    }

    public function envelope(): Envelope
    {
        $subjects = [
            'created' => '📝 ملاحظة جديدة: ' . $this->note->title,
            'updated' => '✏️ تحديث ملاحظة: ' . $this->note->title,
        ];

        return new Envelope(
            subject: $subjects[$this->action] ?? '📝 ملاحظة جديدة: ' . $this->note->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.note-notification',
            with: [
                'note' => $this->note,
                'sender' => $this->sender,
                'action' => $this->action,
                'app_url' => config('app.url'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}