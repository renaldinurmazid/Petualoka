<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index()
    {
        try {
            $banners = Banner::where('is_active', true)->select('id', 'image')->get();
            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil mengambil data banner',
                'data' => $banners,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data banner',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
