<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class VoucherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $vendor = $request->user()->vendorProfile;

        if (!$vendor) {
            return redirect()->route('dashboard')->with('error', 'Anda harus memiliki profil vendor untuk mengelola voucher.');
        }

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $query = Voucher::where('vendor_id', $vendor->id);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $vouchers = $query->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($voucher) {
                $data = $voucher->toArray();
                $data['start_date'] = $voucher->start_date ? $voucher->start_date->format('Y-m-d') : null;
                $data['end_date'] = $voucher->end_date ? $voucher->end_date->format('Y-m-d') : null;
                return $data;
            });

        return Inertia::render('voucher/index', [
            'vouchers' => $vouchers,
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $vendor = $request->user()->vendorProfile;

        $request->validate([
            'code' => 'required|string|unique:vouchers,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'min_purchase_amount' => 'required|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'quota' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        try {
            Voucher::create([
                'vendor_id' => $vendor->id,
                'code' => strtoupper($request->code),
                'name' => $request->name,
                'description' => $request->description,
                'type' => $request->type,
                'value' => $request->value,
                'min_purchase_amount' => $request->min_purchase_amount,
                'max_discount_amount' => $request->max_discount_amount ?: null,
                'quota' => $request->quota ?: null,
                'start_date' => $request->start_date ?: null,
                'end_date' => $request->end_date ?: null,
                'is_active' => true,
            ]);

            return redirect()->back()->with('success', 'Voucher berhasil dibuat.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['general' => 'Gagal menyimpan voucher: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Voucher $voucher)
    {
        $vendor = $request->user()->vendorProfile;

        if ($voucher->vendor_id !== $vendor->id) {
            abort(403);
        }

        $request->validate([
            'code' => 'required|string|unique:vouchers,code,' . $voucher->id . ',id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'min_purchase_amount' => 'required|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'quota' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'required|boolean',
        ]);

        $voucher->update([
            'code' => strtoupper($request->code),
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'value' => $request->value,
            'min_purchase_amount' => $request->min_purchase_amount,
            'max_discount_amount' => $request->max_discount_amount ?: null,
            'quota' => $request->quota ?: null,
            'start_date' => $request->start_date ?: null,
            'end_date' => $request->end_date ?: null,
            'is_active' => $request->is_active,
        ]);

        return redirect()->back()->with('success', 'Voucher berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Voucher $voucher)
    {
        $vendor = request()->user()->vendorProfile;

        if ($voucher->vendor_id !== $vendor->id) {
            abort(403);
        }

        $voucher->delete();

        return redirect()->back()->with('success', 'Voucher berhasil dihapus.');
    }
}
