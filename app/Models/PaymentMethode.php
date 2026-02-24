<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PaymentMethode extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'code',
        'logo',
        'type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function getLogoAttribute($value)
    {
        return asset('storage/' . $value);
    }
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
