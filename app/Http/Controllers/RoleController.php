<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission; 
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('roles/index', [
            // Kita load roles beserta permission yang sudah nempel (pluck UUID nya saja)
            'roles' => Role::with('permissions:uuid')->get()->map(function($role) {
                return [
                    'uuid' => $role->uuid,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->pluck('uuid'),
                ];
            }),
            'permissions' => Permission::all(['uuid', 'name']) // Untuk daftar pilihan di checkbox
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'guard_name' => 'required|string',
        ]);

        Role::create([
            'uuid' => (string) Str::uuid(),
            'name' => $request->name,
            'guard_name' => $request->guard_name,
        ]);

        return redirect()->back()->with('success', 'Role berhasil dibuat');
    }

    // FUNGSI UTAMA: Update Role sekaligus Permissions-nya (sync)
  public function update(Request $request, Role $role)
{
    $request->validate([
        // Ganti $role->id menjadi $role->uuid
        // Tambahkan ',uuid' di akhir untuk memberitahu Laravel primary key-nya kolom 'uuid'
        'name' => 'required|string|unique:roles,name,' . $role->uuid . ',uuid',
        'permissions' => 'array', 
    ]);

    $role->update([
        'name' => $request->name,
    ]);

    // Spatie biasanya butuh ID/Name untuk sync. 
    // Jika array 'permissions' yang lu kirim dari React adalah UUID, 
    // pastikan model Permission juga sudah diatur untuk mengenali UUID.
    if ($request->has('permissions')) {
        $role->syncPermissions($request->permissions);
    }

    return redirect()->route('roles.index')->with('success', 'Role updated successfully');
}

    public function destroy(string $uuid)
    {
        Role::where('uuid', $uuid)->firstOrFail()->delete();
        return redirect()->back()->with('success', 'Role berhasil dihapus');
    }
}