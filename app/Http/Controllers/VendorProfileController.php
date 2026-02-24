<?php

namespace App\Http\Controllers;

use App\Models\VendorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class VendorProfileController extends Controller
{
    public function index()
    {
        return Inertia::render('vendor-profile/index', [
            'vendor' => auth()->user()->vendorProfile
        ]);
    }

    /**
     * Store a newly created vendor profile.
     */
    public function store(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:vendor_profiles,email',
            'phone' => 'required|string|unique:vendor_profiles,phone',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'sub_district' => 'required|string',
            'country' => 'required|string',
        ]);

        $logoPath = $request->file('logo')->store('vendor_profiles/logo', 'public');

        $request->user()->vendorProfile()->create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => phone_number_formatter($request->phone),
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'sub_district' => $request->sub_district,
            'country' => $request->country,
            'logo' => $logoPath,
        ]);

        return Redirect::back()->with('success', 'Profil mitra berhasil diajukan! Mohon tunggu verifikasi admin.');
    }

    /**
     * Update the vendor profile.
     */
    public function update(Request $request)
    {
        $profile = auth()->user()->vendorProfile;

        $request->validate([
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:vendor_profiles,email,' . $profile->id,
            'phone' => 'required|string|unique:vendor_profiles,phone,' . $profile->id,
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'sub_district' => 'required|string',
            'country' => 'required|string',
        ]);

        $data = $request->only(['name', 'email', 'phone', 'address', 'city', 'state', 'sub_district', 'country']);
        $data['phone'] = phone_number_formatter($request->phone);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('vendor_profiles/logo', 'public');
        }

        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('vendor_profiles/banner', 'public');
        }

        $profile->update($data);

        return Redirect::back()->with('success', 'Profil mitra berhasil diperbarui!');
    }


}
