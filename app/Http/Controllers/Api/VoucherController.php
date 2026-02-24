<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoucherController extends Controller
{
    public function index()
    {
        $vouchers = Voucher::valid()
            ->select('id', 'vendor_id', 'code', 'name', 'description', 'type', 'value', 'min_purchase_amount', 'max_discount_amount', 'end_date')
            ->with('vendor')
            ->get()
            ->map(function ($voucher) {
                return [
                    'id' => $voucher->id,
                    'code' => $voucher->code,
                    'name' => $voucher->name,
                    'description' => $voucher->description,
                    'type' => $voucher->type,
                    'value' => $voucher->value,
                    'min_purchase_amount' => $voucher->min_purchase_amount,
                    'max_discount_amount' => $voucher->max_discount_amount,
                    'end_date' => $voucher->end_date ? $voucher->end_date->format('Y-m-d') : null,
                    'category' => $voucher->vendor_id ? 'vendor' : 'platform',
                    'vendor' => $voucher->vendor ? $voucher->vendor->name : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $vouchers,
        ]);
    }

    public function checkVoucher(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $voucher = Voucher::valid()->where('code', $request->code)->first();

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher tidak valid atau sudah kadaluarsa.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $voucher,
        ]);
    }
}
