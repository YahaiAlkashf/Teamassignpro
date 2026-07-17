<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SystemAccessMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect('/login');
        }

        $user = Auth::user();
        $currentPath = $request->path();

        if ($user->role === 'superadmin') {
            return $next($request);
        }

        if (str_starts_with($currentPath, 'admin')) {
            abort(403, 'غير مصرح لك بالدخول إلى لوحة التحكم');
        }

       
        if (!$user->company || $user->company->subscription === null) {
            return redirect('/allplans');
        }

        return $next($request);
    }
}