<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\VendorProfileController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;

use Illuminate\Http\Request;

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
    // Shared Routes (Dashboard & Profile Toko)
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('vendor-profile', [VendorProfileController::class, 'index'])->name('vendor-profile.index');
    Route::post('vendor-profile', [VendorProfileController::class, 'update'])->name('vendor-profile.update');

    // KHUSUS ADMIN (Sistem Management)
    Route::middleware(['role:superadmin'])->group(function () {
        Route::resource('product-categories', ProductCategoryController::class);
        Route::resource('payment-methodes', PaymentMethodController::class);
        Route::resource('roles', RoleController::class);
        Route::resource('permissions', PermissionController::class)
            ->except(['create', 'show', 'edit'])
            ->parameters(['permissions' => 'permission:uuid']);
    });

    // KHUSUS MITRA / ADMIN (Operasional Toko)
    Route::middleware(['role:superadmin|mitra'])->group(function () {
        Route::resource('products', \App\Http\Controllers\ProductController::class)->names('product');
        Route::resource('vouchers', VoucherController::class);
        Route::resource('orders', OrderController::class);
        Route::patch('order/{order}/status', [OrderController::class, 'updateStatus'])->name('order.update-status');
        Route::get('reports', [ReportController::class, 'index'])->name('report.index');
        Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.pdf');
        Route::get('wallets', [WalletController::class, 'index'])->name('wallet.index');
    });

    // Setup Mitra (Hanya untuk yang belum setup)
    Route::get('/form-mitra', function () {
        return Inertia::render('auth/vendor-setup');
    })->name('vendor.setup');
    Route::post('/form-mitra', [VendorProfileController::class, 'store'])->name('vendor.store');
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
