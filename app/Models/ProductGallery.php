<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductGallery extends Model
{
    use HasUuids;
    protected $fillable = [
        'product_id',
        'image',
    ];

    public function getImageAttribute($value)
    {
        return asset('storage/' . $value);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
