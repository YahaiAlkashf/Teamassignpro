// database/migrations/xxxx_xx_xx_remove_permission_columns_from_members_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn([
                'add_members',
                'add_tasks',
                'add_events',
                'add_library',
                'add_advertisement',
                'manage_reports',
                'manage_notes',
                'manage_leaderboard',
                'delete_messege',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->boolean('add_members')->default(false);
            $table->boolean('add_tasks')->default(false);
            $table->boolean('add_events')->default(false);
            $table->boolean('add_library')->default(false);
            $table->boolean('add_advertisement')->default(false);
            $table->boolean('manage_reports')->default(false);
            $table->boolean('manage_notes')->default(false);
            $table->boolean('manage_leaderboard')->default(false);
            $table->boolean('delete_messege')->default(false);
        });
    }
};