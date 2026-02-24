<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasUuids;

    protected $fillable = [
        'image',
        'is_active',
    ];

    public function getImageAttribute($value)
    {
        return asset('storage/' . $value);
    }
}
