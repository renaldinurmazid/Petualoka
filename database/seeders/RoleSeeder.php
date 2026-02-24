<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = [
            'superadmin',
            'customers',
            'mitra'
        ];

        foreach ($role as $value) {
            Role::create([
                'uuid' => Str::uuid(),
                'name' => $value,
                'guard_name' => 'web',
            ]);
        }
    }
}
