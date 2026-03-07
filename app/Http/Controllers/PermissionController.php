<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil semua permission, urutkan berdasarkan yang terbaru
        $permissions = Permission::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('permissions/index', [
            'permissions' => $permissions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
            'guard_name' => 'required|string|max:255',
        ]);

        Permission::create([
            'uuid' => (string) Str::uuid(), // Generate UUID manual jika tidak otomatis
            'name' => $request->name,
            'guard_name' => $request->guard_name,
        ]);

        return redirect()->back()->with('success', 'Permission berhasil ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Permission $permission)
{
    // Karena di routes pakai ->parameters(['permissions' => 'permission:uuid'])
    // Laravel otomatis nyari record-nya, jadi langsung dapet object $permission
    
    $request->validate([
        // Kita kasih tahu: unique di tabel permissions, kolom name, 
        // abaikan yang punya uuid ini, dan cari id-nya di kolom 'uuid'
        'name' => 'required|string|max:255|unique:permissions,name,' . $permission->uuid . ',uuid',
        'guard_name' => 'required|string|max:255',
    ]);

    $permission->update([
        'name' => $request->name,
        'guard_name' => $request->guard_name,
    ]);

    return redirect()->back()->with('success', 'Permission berhasil diperbarui');
}

public function destroy(Permission $permission)
{
    // Sama seperti update, tinggal hapus karena sudah dapet object-nya
    $permission->delete();

    return redirect()->back()->with('success', 'Permission berhasil dihapus');
}
}