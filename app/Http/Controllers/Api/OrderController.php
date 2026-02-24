<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusLog;
use App\Models\PaymentMethode;
use App\Models\Voucher;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\CoreApi;

class OrderController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Handle the checkout process.
     */
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_ids' => 'required|array',
            'cart_ids.*' => 'exists:carts,id',
            'payment_methode_id' => 'required|exists:payment_methodes,id',
            'delivery_methode' => 'required|string',
            'voucher_id' => 'nullable|exists:vouchers,id',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $paymentMethode = PaymentMethode::findOrFail($request->payment_methode_id);

        DB::beginTransaction();

        try {
            $cartItems = Cart::with(['product.vendor', 'variant'])
                ->where('user_id', $user->id)
                ->whereIn('id', $request->cart_ids)
                ->get();

            if ($cartItems->isEmpty()) {
                throw new Exception('Keranjang belanja kosong atau item tidak ditemukan.');
            }

            // Calculation Logic (same as summary)
            $totalAmount = 0;
            $vendorSubtotals = [];

            foreach ($cartItems as $item) {
                $price = $item->variant ? $item->variant->price : ($item->product ? $item->product->price : 0);
                $days = Carbon::parse($item->rental_start_date)->diffInDays(Carbon::parse($item->rental_end_date)) + 1;
                $itemTotal = ($price * $item->quantity * $days);

                $totalAmount += $itemTotal;

                $vendorId = $item->product->vendor_id;
                if (!isset($vendorSubtotals[$vendorId])) {
                    $vendorSubtotals[$vendorId] = 0;
                }
                $vendorSubtotals[$vendorId] += $itemTotal;
            }

            $discountAmount = 0;
            $voucherId = null;

            if ($request->voucher_id) {
                $voucher = Voucher::valid()->find($request->voucher_id);
                if ($voucher) {
                    $eligibleAmount = $voucher->vendor_id ? ($vendorSubtotals[$voucher->vendor_id] ?? 0) : $totalAmount;

                    if ($eligibleAmount >= $voucher->min_purchase_amount) {
                        $discountAmount = $voucher->type === 'fixed'
                            ? $voucher->value
                            : ($eligibleAmount * $voucher->value) / 100;

                        if ($voucher->max_discount_amount && $discountAmount > $voucher->max_discount_amount) {
                            $discountAmount = $voucher->max_discount_amount;
                        }
                        $voucherId = $voucher->id;
                    }
                }
            }

            $serviceFee = 2000;
            $grandTotal = max(0, ($totalAmount - $discountAmount)) + $serviceFee;
            $orderNumber = 'ORD-' . strtoupper(Str::random(10));

            // 1. Create Order
            $order = Order::create([
                'user_id' => $user->id,
                'payment_methode_id' => $paymentMethode->id,
                'order_number' => $orderNumber,
                'total_amount' => $totalAmount,
                'service_fee' => $serviceFee,
                'voucher_id' => $voucherId,
                'discount_amount' => $discountAmount,
                'grand_total' => $grandTotal,
                'status' => 'pending',
                'notes' => $request->notes,
                'delivery_methode' => $request->delivery_methode,
            ]);

            // 2. Create Order Items
            foreach ($cartItems as $item) {
                $price = $item->variant ? $item->variant->price : ($item->product ? $item->product->price : 0);
                $days = Carbon::parse($item->rental_start_date)->diffInDays(Carbon::parse($item->rental_end_date)) + 1;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'vendor_id' => $item->product->vendor_id,
                    'product_name' => $item->product->name,
                    'variant_name' => $item->variant ? $item->variant->name : null,
                    'price' => $price,
                    'quantity' => $item->quantity,
                    'rental_start_date' => $item->rental_start_date,
                    'rental_end_date' => $item->rental_end_date,
                    'subtotal' => ($price * $item->quantity * $days),
                ]);
            }

            // 3. Conditional Midtrans Core API Integration or COD
            if ($paymentMethode->type === 'cash') {
                // For COD (Cash), we don't call Midtrans
                $order->update([
                    'payment_status' => 'pending',
                    'payment_info' => [
                        'method' => 'COD',
                        'instructions' => 'Bayar tunai saat barang diterima.'
                    ],
                ]);
            } else {
                $params = [
                    'transaction_details' => [
                        'order_id' => $order->order_number,
                        'gross_amount' => (int) $order->grand_total,
                    ],
                    'customer_details' => [
                        'first_name' => $user->name,
                        'email' => $user->email,
                    ],
                ];

                // Adjust payload based on Payment Methode Type
                switch ($paymentMethode->type) {
                    case 'bank_transfer':
                        $params['payment_type'] = 'bank_transfer';
                        $params['bank_transfer'] = ['bank' => $paymentMethode->code];
                        break;
                    case 'echannel':
                        $params['payment_type'] = 'echannel';
                        $params['echannel'] = [
                            'bill_info1' => 'Payment for order',
                            'bill_info2' => $order->order_number
                        ];
                        break;
                    case 'qris':
                        $params['payment_type'] = 'qris';
                        break;
                    case 'other':
                        // If it's cstore (indomaret/alfamart)
                        if (in_array($paymentMethode->code, ['indomaret', 'alfamart'])) {
                            $params['payment_type'] = 'cstore';
                            $params['cstore'] = [
                                'store' => $paymentMethode->code,
                                'message' => 'Payment for ' . $order->order_number
                            ];
                        }
                        break;
                }

                $response = CoreApi::charge($params);

                // 4. Update Order with Midtrans Info
                $paymentInfo = [];
                if (isset($response->va_numbers)) {
                    $paymentInfo['va_number'] = $response->va_numbers[0]->va_number;
                    $paymentInfo['bank'] = $response->va_numbers[0]->bank;
                } elseif (isset($response->bill_key)) {
                    $paymentInfo['bill_key'] = $response->bill_key;
                    $paymentInfo['biller_code'] = $response->biller_code;
                } elseif (isset($response->actions)) {
                    foreach ($response->actions as $action) {
                        if ($action->name == 'generate-qr-code') {
                            $paymentInfo['qr_url'] = $action->url;
                        }
                    }
                } elseif (isset($response->payment_code)) {
                    $paymentInfo['payment_code'] = $response->payment_code;
                }

                $order->update([
                    'transaction_id' => $response->transaction_id,
                    'payment_status' => $response->transaction_status,
                    'payment_info' => $paymentInfo,
                    'expired_at' => isset($response->expiry_time) ? Carbon::parse($response->expiry_time) : null,
                ]);
            }

            // 5. Create Status Log
            OrderStatusLog::create([
                'order_id' => $order->id,
                'status' => 'pending',
                'description' => 'Pesanan berhasil dibuat, menunggu pembayaran via ' . $paymentMethode->name,
            ]);

            // 6. Clear Cart
            Cart::where('user_id', $user->id)->whereIn('id', $request->cart_ids)->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Checkout berhasil.',
                'data' => $order->load('items', 'paymentMethode', 'voucher', 'statusLogs')
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Checkout gagal: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the status of a specific order.
     */
    public function getStatus($order_number)
    {
        try {
            $user = Auth::user();
            $order = Order::with('items')
                ->where('user_id', $user->id)
                ->where('order_number', $order_number)
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pesanan tidak ditemukan.'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $order
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil status pesanan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get order details by ID.
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            $order = Order::with(['items', 'paymentMethode', 'voucher', 'statusLogs'])
                ->where('user_id', $user->id)
                ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => $order
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pesanan tidak ditemukan atau terjadi kesalahan.',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function callback(Request $request)
    {
        $serverKey = config('midtrans.server_key');
        $hashed = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

        if ($hashed !== $request->signature_key) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid signature key'
            ], 403);
        }

        $order = Order::where('order_number', $request->order_id)->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        $status = $request->transaction_status;
        $description = "";

        switch ($status) {
            case 'settlement':
            case 'capture':
                $order->status = 'paid';
                $order->paid_at = now();
                $description = "Pembayaran berhasil diterima. Status pesanan berubah menjadi PAID.";

                // Increment voucher use count if applied
                if ($order->voucher_id) {
                    $order->voucher()->increment('used_count');
                }
                break;
            case 'pending':
                $order->status = 'pending';
                $description = "Menunggu pembayaran oleh pelanggan.";
                break;
            case 'deny':
            case 'expire':
            case 'cancel':
                $order->status = ($status == 'expire') ? 'expired' : 'cancelled';
                $description = "Transaksi gagal, dibatalkan, atau kadaluarsa. Status: " . strtoupper($status);
                break;
        }

        $order->payment_status = $status;
        $order->save();

        // Create Status Log
        OrderStatusLog::create([
            'order_id' => $order->id,
            'status' => $order->status,
            'description' => $description,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Callback processed successfully'
        ]);
    }
}
