<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethode;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $paymentMethods = PaymentMethode::latest()->get();
        return Inertia::render('payment-methodes/index', [
            'paymentMethods' => $paymentMethods
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:payment_methodes,code',
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'type' => 'required|in:bank_transfer,echannel,qris,cash,other',
            'is_active' => 'required|boolean',
        ]);

        $logoPath = $request->file('logo')->store('payment-methods', 'public');

        PaymentMethode::create([
            'name' => $request->name,
            'code' => $request->code,
            'logo' => $logoPath,
            'type' => $request->type,
            'is_active' => $request->is_active,
        ]);

        return redirect()->back()->with('success', 'Payment method created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $paymentMethod = PaymentMethode::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:payment_methodes,code,' . $id,
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'type' => 'required|in:bank_transfer,echannel,qris,cash,other',
            'is_active' => 'required|boolean',
        ]);

        $data = [
            'name' => $request->name,
            'code' => $request->code,
            'type' => $request->type,
            'is_active' => $request->is_active,
        ];

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            // Storage::disk('public')->delete($paymentMethod->getRawOriginal('logo'));
            $data['logo'] = $request->file('logo')->store('payment-methods', 'public');
        }

        $paymentMethod->update($data);

        return redirect()->back()->with('success', 'Payment method updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $paymentMethod = PaymentMethode::findOrFail($id);
        $paymentMethod->delete();

        return redirect()->back()->with('success', 'Payment method deleted successfully.');
    }
}
