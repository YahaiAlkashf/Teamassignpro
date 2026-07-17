<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnnouncementMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $content;
    public $actionText;
    public $isDelete;

    public function __construct($user, $content, $actionText, $isDelete = false)
    {
        $this->user = $user;
        $this->content = $content;
        $this->actionText = $actionText;
        $this->isDelete = $isDelete;
    }

    public function envelope(): Envelope
    {
        $subject = $this->isDelete 
            ? '📢 تم حذف الإعلان في الشركة'
            : '📢 ' . $this->actionText . ' إعلان جديد في الشركة';

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.announcement',
            with: [
                'user' => $this->user,
                'content' => $this->content,
                'actionText' => $this->actionText,
                'isDelete' => $this->isDelete,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}