// database/migrations/xxxx_xx_xx_create_member_permissions_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->boolean('manage_members')->default(false);
            $table->boolean('add_tasks')->default(false);
            $table->boolean('add_events')->default(false);
            $table->boolean('add_library')->default(false);
            $table->boolean('add_advertisement')->default(false);
            $table->boolean('manage_reports')->default(false);
            $table->boolean('manage_notes')->default(false);
            $table->boolean('manage_leaderboard')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_permissions');
    }
};