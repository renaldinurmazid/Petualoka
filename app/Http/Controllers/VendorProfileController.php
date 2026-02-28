<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VendorProfileController extends Controller
{
    public function index()
    {
        return Inertia::render('vendor-profile/index', [
            'vendor' => auth()->user()->vendorProfile,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'logo'         => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:vendor_profiles,email',
            'phone'        => 'required|string|unique:vendor_profiles,phone',
            'address'      => 'required|string',
            'city'         => 'required|string',
            'state'        => 'required|string',
            'sub_district' => 'required|string',
            'country'      => 'required|string',
        ]);

        $request->user()->vendorProfile()->create([
            'name'         => $request->name,
            'email'        => $request->email,
            'phone'        => phone_number_formatter($request->phone),
            'address'      => $request->address,
            'city'         => $request->city,
            'state'        => $request->state,
            'sub_district' => $request->sub_district,
            'country'      => $request->country,
            'logo'         => $request->file('logo')->store('vendor_profiles/logo', 'public'),
        ]);

        return Redirect::back()->with('success', 'Profil mitra berhasil diajukan! Mohon tunggu verifikasi admin.');
    }

    public function update(Request $request)
    {
        $profile = auth()->user()->vendorProfile;

        $request->validate([
            'logo'         => 'nullable|image|mimes:jpeg,png,jpg,avif|max:2048',
            'banner'       => 'nullable|image|mimes:jpeg,png,jpg,avif|max:2048',
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:vendor_profiles,email,' . $profile->id,
            'phone'        => 'required|string',
            'address'      => 'required|string',
            'city'         => 'required|string',
            'state'        => 'required|string',
            'sub_district' => 'required|string',
            'country'      => 'required|string',
            'latitude'     => 'nullable|string',
            'longitude'    => 'nullable|string',
        ]);

        $data          = $request->except(['logo', 'banner']);
        $data['phone'] = phone_number_formatter($request->phone);

        if ($request->hasFile('logo')) {
            Storage::disk('public')->delete($profile->getRawOriginal('logo') ?? '');
            $data['logo'] = $request->file('logo')->store('vendor_profiles/logo', 'public');
        }

        if ($request->hasFile('banner')) {
            Storage::disk('public')->delete($profile->getRawOriginal('banner') ?? '');
            $data['banner'] = $request->file('banner')->store('vendor_profiles/banner', 'public');
        }

        $profile->update($data);

        return Redirect::back()->with('success', 'Profil berhasil diperbarui!');
    }
}