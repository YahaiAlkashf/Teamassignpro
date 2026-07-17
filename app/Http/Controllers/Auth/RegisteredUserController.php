<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Member;
use App\Models\Cycle;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'company_name' => 'required|string|max:255',
            'logo' => 'nullable|image|max:2048',
            'country' => 'nullable|string|max:255',
        ], [
            'name.required' => 'حقل الاسم مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصاً',
            'name.max' => 'الاسم يجب ألا يتجاوز 255 حرفاً',
            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.string' => 'البريد الإلكتروني يجب أن يكون نصاً',
            'email.lowercase' => 'البريد الإلكتروني يجب أن يكون بأحرف صغيرة',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرفاً',
            'email.unique' => 'البريد الإلكتروني مسجل مسبقاً',
            'password.required' => 'حقل كلمة المرور مطلوب',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
            'company_name.required' => 'حقل اسم الشركة مطلوب',
            'company_name.string' => 'اسم الشركة يجب أن يكون نصاً',
            'company_name.max' => 'اسم الشركة يجب ألا يتجاوز 255 حرفاً',
            'logo.image' => 'الملف المرفوع يجب أن يكون صورة',
            'logo.max' => 'حجم الشعار يجب ألا يتجاوز 2 ميجابايت',
        ]);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $logo = null;
        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            $logo = $request->file('logo')->store('companies_logo', 'public');
        }

        $company = Company::create([
            'company_name' => $request->company_name,
            'logo' => $logo,
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'company_id' => $company->id,
            'role' => 'admin',
            'country' => $request->country ?? null
        ]);
       
        $member = Member::create([
            'name' => $request->name,
            'phone' => $request->phone ?? null, 
            'role' => 'admin',
            'rating' => 5,
            'user_id' => $user->id,
            'company_id' => $user->company_id
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('verification.notice');
    }
}