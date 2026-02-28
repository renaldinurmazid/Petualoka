<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasUuids;
    protected $fillable = [
        'vendor_id',
        'category_id',
        'name',
        'description',
        'slug',
        'price',
        'stock',
    ];

    public function vendor()
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id', 'id');
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function galleries()
    {
        return $this->hasMany(ProductGallery::class);
    }

    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }
}
