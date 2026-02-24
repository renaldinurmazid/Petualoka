<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethode;
use Exception;
use Illuminate\Http\Request;

class PaymentMethodeController extends Controller
{
    public function index()
    {
        try {
            $data = PaymentMethode::select('id', 'name', 'logo')
                ->active()
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
