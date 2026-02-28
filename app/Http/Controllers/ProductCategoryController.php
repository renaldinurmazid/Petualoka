<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = \App\Models\ProductCategory::all();
        return Inertia::render('product-categories/index', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'required|boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
        }

        \App\Models\ProductCategory::create([
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'image' => $imagePath,
            'is_active' => $request->is_active,
        ]);

        return redirect()->back()->with('success', 'Kategori berhasil ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $category = \App\Models\ProductCategory::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'required|boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        $data = [
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'is_active' => $request->is_active,
        ];

        if ($request->hasFile('image')) {
            if ($category->image) {
                $oldPath = str_replace('storage/', '', $category->image);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $imagePath = $request->file('image')->store('categories', 'public');
            $data['image'] = $imagePath;
        }

        $category->update($data);

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = \App\Models\ProductCategory::findOrFail($id);
        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus');
    }
}
