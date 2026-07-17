// database/migrations/xxxx_xx_xx_create_leaderboard_settings_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leaderboard_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->json('criteria');
            $table->enum('time_period', ['weekly', 'monthly', 'yearly', 'all'])->default('all');
            $table->foreignId('updated_by')->constrained('members')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leaderboard_settings');
    }
};