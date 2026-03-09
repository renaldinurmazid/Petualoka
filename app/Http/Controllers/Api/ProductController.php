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
            $product = Product::select('id', 'name', 'price', 'description', 'stock', 'vendor_id', 'category_id', 'slug')
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
                    },
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

    public function productsByCategory(Request $request, $categorySlug)
    {
        try {
            $category = \App\Models\ProductCategory::where('slug', $categorySlug)->first();

            if (!$category) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kategori tidak ditemukan',
                ], 404);
            }

            $query = Product::select('id', 'name', 'price', 'stock', 'slug', 'category_id')
                ->where('category_id', $category->id)
                ->with([
                    'galleries' => function ($q) {
                        $q->select('id', 'product_id', 'image')->limit(1);
                    }
                ]);

            // Sort
            switch ($request->input('sort', 'popular')) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'rating':
                    $query->withAvg('reviews', 'rating')->orderByDesc('reviews_avg_rating');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                default: // popular
                    $query->withCount('orderItems')->orderByDesc('order_items_count');
                    break;
            }

            $products = $query->paginate($request->input('per_page', 12));

            $products->getCollection()->transform(function ($product) {
                $product->price = price_formatter($product->price);
                $product->thumbnail = $product->galleries->first()->image ?? null;
                $product->average_rating = round($product->reviews()->avg('rating') ?? 0, 1);
                $product->review_count = $product->reviews()->count();
                unset($product->galleries);
                return $product;
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil mengambil produk kategori',
                'category' => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ],
                'data' => $products,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil produk kategori',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function allProducts(Request $request)
    {
        try {
            $query = Product::select('id', 'name', 'price', 'stock', 'slug', 'category_id')
                ->with([
                    'galleries' => function ($q) {
                        $q->select('id', 'product_id', 'image')->limit(1);
                    }
                ]);

            // Sort
            switch ($request->input('sort', 'newest')) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'rating':
                    $query->withAvg('reviews', 'rating')->orderByDesc('reviews_avg_rating');
                    break;
                case 'popular':
                    $query->withCount('orderItems')->orderByDesc('order_items_count');
                    break;
                default: // newest
                    $query->orderBy('created_at', 'desc');
                    break;
            }

            $products = $query->paginate($request->input('per_page', 12));

            $products->getCollection()->transform(function ($product) {
                $product->price = price_formatter($product->price);
                $product->thumbnail = $product->galleries->first()->image ?? null;
                $product->average_rating = round($product->reviews()->avg('rating') ?? 0, 1);
                $product->review_count = $product->reviews()->count();
                unset($product->galleries);
                return $product;
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil mengambil semua produk',
                'data' => $products,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil semua produk',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function productReviews($slug)
    {
        try {
            $product = Product::where('slug', $slug)->first();

            if (!$product) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Produk tidak ditemukan',
                ], 404);
            }

            $totalReviews = $product->reviews()->count();
            $averageRating = $product->reviews()->avg('rating') ?? 0;

            // Rating distribution
            $distribution = [
                5 => $product->reviews()->where('rating', 5)->count(),
                4 => $product->reviews()->where('rating', 4)->count(),
                3 => $product->reviews()->where('rating', 3)->count(),
                2 => $product->reviews()->where('rating', 2)->count(),
                1 => $product->reviews()->where('rating', 1)->count(),
            ];

            // Satisfaction percentage (4 and 5 stars)
            $satisfiedCount = $distribution[5] + $distribution[4];
            $satisfactionPercentage = $totalReviews > 0 ? round(($satisfiedCount / $totalReviews) * 100) : 0;

            $reviews = $product->reviews()
                ->with(['user:id,name'])
                ->latest()
                ->paginate(10);

            // Transform reviews to include variant info from OrderItem
            $reviews->getCollection()->transform(function ($review) use ($product) {
                $orderItem = \App\Models\OrderItem::where('order_id', $review->order_id)
                    ->where('product_id', $product->id)
                    ->first();

                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->diffForHumans(),
                    'user_name' => $review->user->name,
                    'variant_name' => $orderItem->variant_name ?? null,
                ];
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil mengambil ulasan produk',
                'summary' => [
                    'average_rating' => round($averageRating, 1),
                    'total_reviews' => $totalReviews,
                    'satisfaction_percentage' => $satisfactionPercentage,
                    'rating_distribution' => $distribution,
                ],
                'data' => $reviews,
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