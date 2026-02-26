<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\PaymentMethodeController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\VoucherController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/carts/count', [\App\Http\Controllers\Api\CartController::class, 'count']);
    Route::get('/carts', [\App\Http\Controllers\Api\CartController::class, 'index']);
    Route::post('/carts', [\App\Http\Controllers\Api\CartController::class, 'store']);
    Route::put('/carts/{id}', [\App\Http\Controllers\Api\CartController::class, 'update']);
    Route::post('/carts/summary', [\App\Http\Controllers\Api\CartController::class, 'summary']);
    Route::delete('/carts/clear', [\App\Http\Controllers\Api\CartController::class, 'clear']);
    Route::delete('/carts/{id}', [\App\Http\Controllers\Api\CartController::class, 'destroy']);

    Route::post('/checkout', [\App\Http\Controllers\Api\OrderController::class, 'checkout']);
    Route::get('/orders/{order_number}/status', [\App\Http\Controllers\Api\OrderController::class, 'getStatus']);
    Route::get('/orders/{id}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
    
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::get('/banners', [BannerController::class, 'index']);
Route::get('/products/recommended', [ProductController::class, 'recommendedProduct']);
Route::get('/products/{id}', [ProductController::class, 'productDetail']);
Route::get('/vouchers', [VoucherController::class, 'index']);
Route::get('/vouchers/check', [VoucherController::class, 'checkVoucher']);
Route::get('/payment-methods', [PaymentMethodeController::class, 'index']);
Route::post('/midtrans-callback', [\App\Http\Controllers\Api\OrderController::class, 'callback']);
