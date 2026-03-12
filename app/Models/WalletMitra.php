<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WalletMitra extends Model
{
    use HasUuids;

    protected $fillable = [
        'vendor_profile_id',
        'balance',
        'status',
    ];

    public function vendorProfile()
    {
        return $this->belongsTo(VendorProfile::class);
    }
}
