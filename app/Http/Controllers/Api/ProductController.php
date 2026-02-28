<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function recommendedProduct()
    {
        try {
            $products = Product::select('id', 'name', 'price', 'stock', 'slug')
                ->with([
                    'galleries' => function ($query) {
                        $query->select('id', 'product_id', 'image');
                    }
                ])
                ->latest()
                ->limit(10)
                ->get()
                ->map(function ($product) {
                    $product->price = price_formatter($product->price);
                    $product->image = $product->galleries->first()->image ?? null;
                    unset($product->galleries);
                    return $product;
                });
            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil mengambil data produk',
                'data' => $products,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data produk',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function productDetail($slug)
    {
        try {
            $product = Product::select('id', 'name', 'price', 'description', 'stock', 'vendor_id')
                ->with([
                    'galleries' => function ($query) {
                        $query->select('id', 'product_id', 'image');
                    },
                    'attributes' => function ($query) {
                        $query->select('id', 'product_id', 'name');
                    },
                    'attributes.options' => function ($query) {
                        $query->select('id', 'product_attribute_id', 'value');
                    },
                    'variants' => function ($query) {
                        $query->select('id', 'product_id', 'code', 'price', 'stock');
                    },
                    'variants.attributeOptions' => function ($query) {
                        $query->select('product_attribute_options.id', 'product_attribute_id', 'value');
                    },
                    'vendor' => function ($query) {
                        $query->select('id', 'name', 'city', 'state', 'logo');
                    },
                    'category' => function ($query) {
                        $query->select('id', 'name', 'slug');
                    }
                ])
                ->where('slug', $slug)
                ->first();

            if (!$product) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Produk tidak ditemukan',
                ], 404);
            }

            $product->vendor->totalProduct = $product->vendor->products()->count();
            $product->price = price_formatter($product->price);
            $product->variants->map(function ($variant) {
                $variant->price = price_formatter($variant->price);
                return $variant;
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil mengambil data produk',
                'data' => $product,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data produk',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
