<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeOption;
use App\Models\ProductGallery;
use App\Models\ProductVariant;
use App\Models\ProductVariantOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->user()->vendorProfile;

        if (!$vendor) {
            return Redirect::route('vendor.setup')->with('error', 'Silakan lengkapi profil vendor Anda terlebih dahulu.');
        }

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $query = $vendor->products()->with(['galleries', 'attributes.options', 'variants']);

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $products = $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('product/product-index', [
            'products' => $products,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'images' => 'required|array|min:1',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'attributes' => 'nullable|array',
            'attributes.*.name' => 'required|string',
            'attributes.*.options' => 'required|array|min:1',
            'variants' => 'nullable|array',
            'variants.*.code' => 'required|string',
            'variants.*.price' => 'required|numeric',
            'variants.*.stock' => 'required|integer',
            'variants.*.attribute_options' => 'required|array',
        ]);

        $vendor = $request->user()->vendorProfile;

        if (!$vendor) {
            return Redirect::back()->with('error', 'Anda harus memiliki profil vendor untuk menambahkan produk.');
        }

        try {
            DB::beginTransaction();

            $stock = $request->stock;
            if ($request->input('variants')) {
                $stock = collect($request->input('variants'))->sum('stock');
            }

            $product = $vendor->products()->create([
                'name' => $request->name,
                'description' => $request->description,
                'slug' => Str::slug($request->name) . '-' . Str::random(5),
                'price' => $request->price,
                'stock' => $stock,
            ]);

            // Handle Images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('products/' . $vendor->id, 'public');
                    $product->galleries()->create(['image' => $path]);
                }
            }

            // Handle Attributes & Options
            $optionMap = [];
            if ($request->input('attributes')) {
                foreach ($request->input('attributes') as $attrData) {
                    $attribute = $product->attributes()->create(['name' => $attrData['name']]);
                    foreach ($attrData['options'] as $optValue) {
                        $option = $attribute->options()->create(['value' => $optValue]);
                        $optionMap[$attrData['name']][$optValue] = $option->id;
                    }
                }
            }

            // Handle Variants
            if ($request->input('variants')) {
                $attributes = $request->input('attributes');
                foreach ($request->input('variants') as $variantData) {
                    $variant = $product->variants()->create([
                        'code' => $variantData['code'],
                        'price' => $variantData['price'],
                        'stock' => $variantData['stock'],
                    ]);

                    foreach ($variantData['attribute_options'] as $index => $optValue) {
                        $attrName = $attributes[$index]['name'];
                        $optionId = $optionMap[$attrName][$optValue] ?? null;
                        if ($optionId) {
                            ProductVariantOption::create([
                                'product_variant_id' => $variant->id,
                                'product_attribute_option_id' => $optionId,
                            ]);
                        }
                    }
                }
            }

            DB::commit();
            return Redirect::route('product.index')->with('success', 'Produk berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error adding product: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function edit(Request $request, Product $product)
    {
        if ($product->vendor_id !== $request->user()->vendorProfile->id) {
            abort(403);
        }

        return Inertia::render('product/product-edit', [
            'product' => $product->load(['galleries', 'attributes.options', 'variants.attributeOptions']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        if ($product->vendor_id !== $request->user()->vendorProfile->id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'removed_images' => 'nullable|array',
            'removed_images.*' => 'string|exists:product_galleries,id',
            'attributes' => 'nullable|array',
            'attributes.*.name' => 'required|string',
            'attributes.*.options' => 'required|array|min:1',
            'variants' => 'nullable|array',
            'variants.*.code' => 'required|string',
            'variants.*.price' => 'required|numeric',
            'variants.*.stock' => 'required|integer',
            'variants.*.attribute_options' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            $stock = $request->stock;
            if ($request->input('variants')) {
                $stock = collect($request->input('variants'))->sum('stock');
            }

            $product->update([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'stock' => $stock,
            ]);

            // Handle image removal
            if ($request->removed_images) {
                $galleriesToRemove = ProductGallery::whereIn('id', $request->removed_images)->get();
                foreach ($galleriesToRemove as $gallery) {
                    Storage::disk('public')->delete($gallery->image);
                    $gallery->delete();
                }
            }

            // Handle new images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('products/' . $product->vendor_id, 'public');
                    $product->galleries()->create(['image' => $path]);
                }
            }

            // Handle Attributes & Variants Sync (Re-create logic for simplicity in MVP)
            if ($request->has('attributes')) {
                // Remove old variants and attributes first
                foreach ($product->variants as $variant) {
                    $variant->delete();
                }
                foreach ($product->attributes as $attribute) {
                    $attribute->delete();
                }

                // Create new ones
                $optionMap = [];
                foreach ($request->input('attributes') as $attrData) {
                    $attribute = $product->attributes()->create(['name' => $attrData['name']]);
                    foreach ($attrData['options'] as $optValue) {
                        $option = $attribute->options()->create(['value' => $optValue]);
                        $optionMap[$attrData['name']][$optValue] = $option->id;
                    }
                }

                if ($request->input('variants')) {
                    $attributes = $request->input('attributes');
                    foreach ($request->input('variants') as $variantData) {
                        $variant = $product->variants()->create([
                            'code' => $variantData['code'],
                            'price' => $variantData['price'],
                            'stock' => $variantData['stock'],
                        ]);

                        foreach ($variantData['attribute_options'] as $index => $optValue) {
                            $attrName = $attributes[$index]['name'];
                            $optionId = $optionMap[$attrName][$optValue] ?? null;
                            if ($optionId) {
                                ProductVariantOption::create([
                                    'product_variant_id' => $variant->id,
                                    'product_attribute_option_id' => $optionId,
                                ]);
                            }
                        }
                    }
                }
            }

            DB::commit();
            return Redirect::route('product.index')->with('success', 'Produk berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating product: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function destroy(Request $request, Product $product)
    {
        if ($product->vendor_id !== $request->user()->vendorProfile->id) {
            abort(403);
        }

        foreach ($product->galleries as $gallery) {
            Storage::disk('public')->delete($gallery->image);
            $gallery->delete();
        }

        $product->delete();

        return Redirect::back()->with('success', 'Produk berhasil dihapus.');
    }
}
