<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\VendorProfileController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

Route::middleware(['guest'])->group(function () {
    Route::get('/authentication', function (Request $request) {
        return Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]);
    })->name('auth_view');

    Route::get('/', fn() => redirect()->route('auth_view'));
    Route::get('/login', fn() => redirect()->route('auth_view'));
    Route::get('/register', fn() => redirect()->route('auth_view'));
});

Route::middleware(['auth'])->get('/', fn() => redirect()->route('dashboard'));

Route::middleware(['auth', 'verified', 'check.vendor'])->group(function () {
    Route::get('/form-mitra', function () {
        return Inertia::render('auth/vendor-setup');
    })->name('vendor.setup');

    Route::get('vendor-profile', [VendorProfileController::class, 'index'])->name('vendor-profile.index');
    Route::post('vendor-profile', [VendorProfileController::class, 'update'])->name('vendor-profile.update');
    Route::post('/form-mitra', [VendorProfileController::class, 'store'])->name('vendor.store');


    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('products', [\App\Http\Controllers\ProductController::class, 'index'])->name('product.index');

    Route::get('products/create', [\App\Http\Controllers\ProductController::class, 'create'])->name('product.create');

    Route::post('products', [\App\Http\Controllers\ProductController::class, 'store'])->name('product.store');
    Route::delete('products/{product}', [\App\Http\Controllers\ProductController::class, 'destroy'])->name('product.destroy');
    Route::get('products/{product}/edit', [\App\Http\Controllers\ProductController::class, 'edit'])->name('product.edit');
    Route::put('products/{product}', [\App\Http\Controllers\ProductController::class, 'update'])->name('product.update');

    Route::resource('vouchers', VoucherController::class);
    Route::resource('orders', OrderController::class);
    Route::patch('order/{order}/status', [OrderController::class, 'updateStatus'])->name('order.update-status');
    Route::get('reports', [ReportController::class, 'index'])->name('report.index');
    Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.pdf');
    Route::get('wallets', [WalletController::class, 'index'])->name('wallet.index');
    
    Route::resource('product-categories', ProductCategoryController::class);
});

Route::get('test-connect', function () {
    try {
        Mail::raw('Halo, ini adalah pesan test koneksi dari Laravel!', function ($message) {
            $message->to('renaldinurmazid@gmail.com')
                    ->subject('Test Koneksi SMTP');
        });
        
        return "✅ Koneksi Berhasil! Email telah dikirim.";
    } catch (\Exception $e) {
        return "❌ Koneksi Gagal! Pesan Error: " . $e->getMessage();
    }
});

require __DIR__ . '/settings.php';
