<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;

class ProductCategoryController extends Controller
{
    public function index()
    {
        $categories = ProductCategory::select('id', 'name', 'slug', 'image')
        ->where('is_active', true)->get();

        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }
}
