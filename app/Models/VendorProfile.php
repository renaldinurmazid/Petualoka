<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class VendorProfile extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'sub_district',
        'country',
        'latitude',
        'longitude',
        'logo',
        'banner',
        'is_verified',
        'services',
        'message',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'services' => 'array',
            'is_verified' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function getLogoAttribute($value)
    {
        return asset('storage/' . $value);
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'vendor_id');
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'vendor_id');
    }
}
