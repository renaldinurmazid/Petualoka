<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Voucher extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'vendor_id',
        'code',
        'name',
        'description',
        'type',
        'value',
        'max_discount_amount',
        'min_purchase_amount',
        'quota',
        'used_count',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'value' => 'float',
        'max_discount_amount' => 'float',
        'min_purchase_amount' => 'float',
        'quota' => 'integer',
        'used_count' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Relationship with VendorProfile.
     * If null, it's a platform-wide voucher.
     */
    public function vendor()
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id');
    }

    /**
     * Scope to check if voucher is currently valid.
     */
    public function scopeValid($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $now);
            })
            ->where(function ($q) {
                $q->whereNull('quota')->orWhereRaw('used_count < quota');
            });
    }
}
