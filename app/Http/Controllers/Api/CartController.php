<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Exception;

class CartController extends Controller
{
    /**
     * Get the total count of items in the user's cart.
     */
    public function count()
    {
        try {
            $user = Auth::user();
            $count = Cart::where('user_id', $user->id)->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'count' => (int) $count
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch cart count.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of the cart items for the authenticated user.
     */
    public function index()
    {
        try {
            $user = Auth::user();
            $cartItems = Cart::with([
                'product' => function ($query) {
                    $query->select('id', 'name', 'price', 'vendor_id');
                },
                'product.galleries',
                'product.vendor' => function ($query) {
                    $query->select('id', 'name', 'logo');
                },
                'variant' => function ($query) {
                    $query->select('id', 'price', 'stock')
                        ->with([
                            'attributeOptions' => function ($query) {
                                $query->select('product_attribute_options.id', 'product_attribute_options.value');
                            }
                        ]);
                }
            ])
                ->where('user_id', $user->id)
                ->get();

            $formattedItems = $cartItems->map(function ($cartItem) {
                return $this->formatCartItem($cartItem);
            });

            $groupedCart = $formattedItems->groupBy(function ($item) {
                return $item->product->vendor->id;
            })->map(function ($items) {
                $vendor = $items->first()->product->vendor;
                return [
                    'vendor' => $vendor,
                    'items' => $items->map(function ($item) {
                        unset($item->product->vendor);
                        return $item;
                    })->values()
                ];
            })->values();

            return response()->json([
                'status' => 'success',
                'data' => $groupedCart
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch cart items.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'rental_start_date' => 'required|date|after_or_equal:today',
            'rental_end_date' => 'required|date|after_or_equal:rental_start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $existingCart = Cart::where('user_id', $user->id)
                ->where('product_id', $request->product_id)
                ->where('product_variant_id', $request->product_variant_id)
                ->where('rental_start_date', $request->rental_start_date)
                ->where('rental_end_date', $request->rental_end_date)
                ->first();

            if ($existingCart) {
                $existingCart->increment('quantity', $request->quantity);
                $cart = $existingCart;
            } else {
                $cart = Cart::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'user_id' => $user->id,
                    'product_id' => $request->product_id,
                    'product_variant_id' => $request->product_variant_id,
                    'quantity' => $request->quantity,
                    'rental_start_date' => $request->rental_start_date,
                    'rental_end_date' => $request->rental_end_date,
                ]);
            }

            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => 'Product added to cart.',
                'data' => $this->formatCartItem($cart->load(['product.galleries', 'variant']))
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to add product to cart.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'quantity' => 'sometimes|integer|min:1',
            'rental_start_date' => 'sometimes|date|after_or_equal:today',
            'rental_end_date' => 'sometimes|date|after_or_equal:rental_start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $cart = Cart::where('user_id', $user->id)->findOrFail($id);
            $cart->update($request->only(['quantity', 'rental_start_date', 'rental_end_date']));

            DB::commit();
            return response()->json([
                'status' => 'success',
                'message' => 'Cart item updated.',
                'data' => $this->formatCartItem($cart->load(['product.galleries', 'variant']))
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update cart item.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order summary for selected cart items.
     */
    public function summary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_ids' => 'required|array',
            'cart_ids.*' => 'exists:carts,id',
            'voucher_id' => 'nullable|exists:vouchers,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = Auth::user();
            $cartItems = Cart::with(['product.vendor', 'variant'])
                ->where('user_id', $user->id)
                ->whereIn('id', $request->cart_ids)
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No items selected.'
                ], 400);
            }

            $subtotal = 0;
            $vendorSubtotals = [];

            foreach ($cartItems as $item) {
                $price = $item->variant ? $item->variant->price : ($item->product ? $item->product->price : 0);
                $days = Carbon::parse($item->rental_start_date)->diffInDays(Carbon::parse($item->rental_end_date)) + 1;
                $itemTotal = ($price * $item->quantity * $days);

                $subtotal += $itemTotal;

                $vendorId = $item->product->vendor_id;
                if (!isset($vendorSubtotals[$vendorId])) {
                    $vendorSubtotals[$vendorId] = 0;
                }
                $vendorSubtotals[$vendorId] += $itemTotal;
            }

            $discountAmount = 0;
            $appliedVoucher = null;
            $voucherError = null;

            if ($request->voucher_id) {
                $voucher = \App\Models\Voucher::valid()->find($request->voucher_id);

                if (!$voucher) {
                    $voucherError = 'Voucher tidak valid atau sudah kadaluarsa.';
                } else {
                    $eligibleAmount = 0;
                    $isEligible = false;

                    if ($voucher->vendor_id) {
                        // Vendor-specific voucher
                        $eligibleAmount = $vendorSubtotals[$voucher->vendor_id] ?? 0;
                        if ($eligibleAmount >= $voucher->min_purchase_amount) {
                            $isEligible = true;
                        } else {
                            $voucherError = 'Minimal pembelian untuk voucher ini adalah ' . price_formatter($voucher->min_purchase_amount);
                        }
                    } else {
                        // Platform-wide voucher
                        $eligibleAmount = $subtotal;
                        if ($eligibleAmount >= $voucher->min_purchase_amount) {
                            $isEligible = true;
                        } else {
                            $voucherError = 'Minimal pembelian untuk voucher ini adalah ' . price_formatter($voucher->min_purchase_amount);
                        }
                    }

                    if ($isEligible) {
                        if ($voucher->type === 'fixed') {
                            $discountAmount = $voucher->value;
                        } else {
                            $discountAmount = ($eligibleAmount * $voucher->value) / 100;
                        }

                        // Cap by max discount amount
                        if ($voucher->max_discount_amount && $discountAmount > $voucher->max_discount_amount) {
                            $discountAmount = $voucher->max_discount_amount;
                        }

                        $appliedVoucher = [
                            'id' => $voucher->id,
                            'code' => $voucher->code,
                            'name' => $voucher->name,
                            'discount_amount' => $discountAmount,
                            'discount_formatted' => price_formatter($discountAmount)
                        ];
                    }
                }
            }

            $serviceFee = 2000;
            $totalPayment = max(0, ($subtotal - $discountAmount)) + $serviceFee;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'subtotal' => $subtotal,
                    'subtotal_formatted' => price_formatter($subtotal),
                    'discount_amount' => $discountAmount,
                    'discount_formatted' => price_formatter($discountAmount),
                    'service_fee' => $serviceFee,
                    'service_fee_formatted' => price_formatter($serviceFee),
                    'total_payment' => $totalPayment,
                    'total_payment_formatted' => price_formatter($totalPayment),
                    'total_items_selected' => $cartItems->count(),
                    'applied_voucher' => $appliedVoucher,
                    'voucher_error' => $voucherError
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to calculate summary.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $cart = Cart::where('user_id', $user->id)->findOrFail($id);
            $cart->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Item removed from cart.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove item.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear all items from the user's cart.
     */
    public function clear()
    {
        try {
            $user = Auth::user();
            Cart::where('user_id', $user->id)->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Cart cleared successfully.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to clear cart.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format cart item with additional calculations and formatting.
     */
    private function formatCartItem($cartItem)
    {
        $price = $cartItem->variant ? $cartItem->variant->price : ($cartItem->product ? $cartItem->product->price : 0);
        $days = Carbon::parse($cartItem->rental_start_date)->diffInDays(Carbon::parse($cartItem->rental_end_date)) + 1;

        $cartItem->rental_duration = $days;
        $cartItem->item_total = $price * $cartItem->quantity * $days;
        $cartItem->item_total_formatted = price_formatter($cartItem->item_total);
        $cartItem->subtotal_per_day = $price * $cartItem->quantity;
        $cartItem->subtotal_per_day_formatted = price_formatter($cartItem->subtotal_per_day);

        if ($cartItem->product) {
            $cartItem->product->price_formatted = price_formatter($cartItem->product->price);
            $cartItem->product->thumbnail = $cartItem->product->galleries ? $cartItem->product->galleries->first() : null;
            unset($cartItem->product->galleries);
        }

        if ($cartItem->variant) {
            $cartItem->variant->price_formatted = price_formatter($cartItem->variant->price);
        }

        return $cartItem;
    }
}
