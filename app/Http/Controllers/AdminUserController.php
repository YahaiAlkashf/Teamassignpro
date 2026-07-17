<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Coupon;
use App\Models\User;
use App\Models\Cycle;
use App\Models\Member;
use App\Models\Plan;
use Elibyy\TCPDF\TCPDF;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AdminUserController extends Controller
{
   
    public function users()
    {
        $users = User::with('company')->get();
        return response()->json(['users' => $users]);
    }

    public function customers()
    {
        $customers = User::with('company')->get();

        return response()->json([
            'customers' => $customers
        ]);
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
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

      
        $logo = null;
        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            $logo = $request->file('logo')->store('companies_logo', 'public');
        }

      
        $company = Company::create([
            'company_name' => $request->company_name,
            'logo' => $logo,
            'subscription' => null, 
            'subscription_expires_at' => null,
            'plan' => null,
        ]);

      
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'company_id' => $company->id,
            'role' => 'admin',
            'country' => $request->country,
        ]);
        
        Member::create([
            'name' => $request->name,
            'phone' => $request->phone ?? '',
            'role' => 'admin',
            'rating' => 5,
            'user_id' => $user->id,
            'company_id' => $user->company_id
        ]);

        event(new Registered($user));

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المستخدم بنجاح',
            'user' => $user
        ]);
    }

   
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class . ',email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
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
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
            'company_name.required' => 'حقل اسم الشركة مطلوب',
            'company_name.string' => 'اسم الشركة يجب أن يكون نصاً',
            'company_name.max' => 'اسم الشركة يجب ألا يتجاوز 255 حرفاً',
            'logo.image' => 'الملف المرفوع يجب أن يكون صورة',
            'logo.max' => 'حجم الشعار يجب ألا يتجاوز 2 ميجابايت',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $company = Company::findOrFail($user->company_id);

  
        $companyData = [
            'company_name' => $request->company_name,
        ];

        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            if ($company->logo) {
                Storage::disk('public')->delete($company->logo);
            }
            $companyData['logo'] = $request->file('logo')->store('companies_logo', 'public');
        }

        $company->update($companyData);

      
        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'country' => $request->country,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات المستخدم بنجاح',
            'user' => $user
        ]);
    }

  
    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'المستخدم غير موجود'
            ], 404);
        }

       
        if ($user->company && $user->company->logo) {
            Storage::disk('public')->delete($user->company->logo);
        }

  
        if ($user->company && $user->role=='admin') {
            $user->company->delete();
        }

     
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المستخدم بنجاح'
        ]);
    }

     
    public function exportUsersExcel()
    {
        $users = User::with('company')
            ->where('role', 'superadmin')
            ->get();

        $fileName = 'المستخدمين_' . date('Y-m-d') . '.xlsx';

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('المستخدمين');
        $sheet->setRightToLeft(true);

        $headers = [
            '#',
            'الاسم',
            'الرتبة',
            'البريد الإلكتروني',
            'الدولة',
            'اسم الشركة',
            'العنوان',
            'الباقة',
            'الخطة',
            'تاريخ الانتهاء',
        ];

        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . '1', $header);
            $col++;
        }

        $headerStyle = [
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color' => ['rgb' => '9B59B6']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ]
            ]
        ];

        $lastHeaderColumn = chr(64 + count($headers));
        $sheet->getStyle('A1:' . $lastHeaderColumn . '1')->applyFromArray($headerStyle);

        $row = 2;
        foreach ($users as $index => $user) {
            $subscription = $user->company->subscription ?? 'غير مشترك';
            $subscriptionLabel = $subscription === 'advanced' ? 'متقدمة ⭐' : ($subscription ?? 'غير مشترك');
            
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $user->name ?? '');
            $sheet->setCellValue('C' . $row, $user->role ?? '');
            $sheet->setCellValue('D' . $row, $user->email ?? '');
            $sheet->setCellValue('E' . $row, $user->country ?? '');
            $sheet->setCellValue('F' . $row, $user->company->company_name ?? 'غير محدد');
            $sheet->setCellValue('G' . $row, $user->company->address ?? 'غير محدد');
            $sheet->setCellValue('H' . $row, $subscriptionLabel);
            $sheet->setCellValue('I' . $row, $user->company->plan ?? 'غير محدد');
            $sheet->setCellValue('J' . $row, $user->company->subscription_expires_at ?? '');

            $row++;
        }

        $dataStyle = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ]
            ]
        ];

        if ($users->count() > 0) {
            $sheet->getStyle('A2:' . $lastHeaderColumn . ($row - 1))->applyFromArray($dataStyle);
        }

        foreach (range('A', $lastHeaderColumn) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }
    
    public function addSubscription(Request $request, $id)
    {
        $company = Company::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'subscription' => 'nullable|string|in:advanced,none',
            'plan' => 'nullable|string|in:monthly,yearly',
        ], [
            'subscription.in' => 'نوع الباقة غير صحيح',
            'plan.in' => 'نوع الخطة غير صحيح',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

      
        if ($request->subscription === 'none' || empty($request->subscription)) {
            $company->update([
                'subscription' => null,
                'subscription_expires_at' => null,
                'plan' => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم إلغاء تفعيل الباقة بنجاح',
                'subscription' => null
            ]);
        }

 
        $expiryDate = $request->plan === 'yearly' 
            ? now()->addYear() 
            : now()->addMonth();

        $company->update([
            'subscription' => 'advanced',
            'subscription_expires_at' => $expiryDate,
            'plan' => $request->plan ?? 'monthly',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تفعيل الباقة المتقدمة بنجاح',
            'subscription' => 'advanced',
            'plan' => $request->plan ?? 'monthly',
            'expires_at' => $expiryDate
        ]);
    }

    public function validateCoupon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|exists:coupons,code',
            'plan_id' => 'required|exists:plans,id',
            'type' => 'required|in:monthly,yearly'
        ], [
            'code.required' => 'كود الخصم مطلوب',
            'code.exists' => 'كود الخصم غير موجود',
            'plan_id.required' => 'الباقة مطلوبة',
            'plan_id.exists' => 'الباقة غير موجودة',
            'type.required' => 'نوع الخطة مطلوب',
            'type.in' => 'نوع الخطة غير صحيح',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon = Coupon::where('code', $request->code)
            ->where('plan', $request->type)
            ->with('plan')
            ->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'errors' => ['code' => ['كود الخصم غير صالح لهذا النوع من الباقة']]
            ], 422);
        }

        if ($coupon->plan_id != $request->plan_id) {
            return response()->json([
                'success' => false,
                'errors' => ['code' => ['كود الخصم غير صالح لهذه الباقة']]
            ], 422);
        }

        return response()->json([
            'success' => true,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'price_in_egp' => $coupon->price_in_egp,
                'price_outside_egp' => $coupon->price_outside_egp,
                'plan' => $coupon->plan,
            ]
        ]);
    }
   
    public function subscriptionCoupons(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|exists:coupons,code',
            'planName' => 'required|exists:plans,name',
            'type' => 'required|in:monthly,yearly'
        ], [
            'code.required' => 'كود الخصم مطلوب',
            'code.exists' => 'كود الخصم غير موجود',
            'planName.required' => 'الباقة مطلوبة',
            'planName.exists' => 'الباقة غير موجودة',
            'type.required' => 'نوع الخطة مطلوب',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $coupon = Coupon::where('code', $request->code)
            ->where('plan', $request->type)
            ->with('plan')
            ->first();

        $requestedPlan = Plan::where('name', $request->planName)->first();

        if (!$coupon || $coupon->plan_id !== $requestedPlan->id) {
            return response()->json([
                'success' => false,
                'errors' => ['code' => ['كود الخصم غير صالح لهذه الباقة']]
            ], 422);
        }

        $company = Company::findOrFail($user->company_id);
        
      
        if ($coupon->price_in_egp == 0 || $coupon->price_outside_egp == 0) {
            $expiryDate = $request->type === 'yearly' 
                ? now()->addYear() 
                : now()->addMonth();

            $company->update([
                'subscription' => $request->planName,
                'subscription_expires_at' => $expiryDate,
                'plan' => $request->type
            ]);

            return response()->json([
                'success' => true,
                'free_subscription' => true,
                'message' => 'تم تفعيل الاشتراك المجاني بنجاح'
            ]);
        }

    
        return response()->json([
            'success' => true,
            'free_subscription' => false,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'price_in_egp' => $coupon->price_in_egp,
                'price_outside_egp' => $coupon->price_outside_egp,
                'original_price_in_egp' => $requestedPlan->price_in_egp,
                'original_price_outside_egp' => $requestedPlan->price_outside_egp,
                'plan_id' => $coupon->plan_id
            ]
        ]);
    }


    public function activateFreeSubscription(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan' => 'required|exists:plans,name',
            'coupon_code' => 'required|exists:coupons,code',
            'type' => 'required|in:monthly,yearly'
        ], [
            'plan.required' => 'الباقة مطلوبة',
            'plan.exists' => 'الباقة غير موجودة',
            'coupon_code.required' => 'كود الخصم مطلوب',
            'coupon_code.exists' => 'كود الخصم غير موجود',
            'type.required' => 'نوع الخطة مطلوب',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $plan = Plan::where('name', $request->plan)->first();
            $coupon = Coupon::where('code', $request->coupon_code)->first();

            if ($coupon->plan_id !== $plan->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'كود الخصم غير صالح لهذه الباقة'
                ], 422);
            }

            $company = Company::findOrFail($user->company_id);
            
            $expiryDate = $request->type === 'yearly' 
                ? now()->addYear() 
                : now()->addMonth();

            $company->update([
                'subscription' => $request->plan,
                'subscription_expires_at' => $expiryDate,
                'plan' => $request->type
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم تفعيل الاشتراك بنجاح',
                'subscription' => $request->plan,
                'expires_at' => $company->subscription_expires_at
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تفعيل الاشتراك: ' . $e->getMessage()
            ], 500);
        }
    }
}