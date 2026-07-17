<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\Member; 
use App\Models\MemberPermission;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Inertia::share([
            'app_url' => config('app.url'),
        ]);
        Inertia::share([
            'auth' => function () {
                $user = Auth::user();

                return [
                    'user' => $user,
                ];
            },
            'permissions' => function () {
                $user = Auth::user();

                if (!$user) {
                    return [
                        'permissions' => null,
                    ];
                }

                $member = Member::where('user_id', $user->id)
                    ->with('permission')
                    ->first();

                return [
                    'permissions' => $member?->permission,
                ];
            },
        ]);

            if(env('APP_ENV') === 'production') {
                URL::forceScheme('https');
            }

    }
}
