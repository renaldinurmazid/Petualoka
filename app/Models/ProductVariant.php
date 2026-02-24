<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasUuids;
    protected $table = 'product_variants';

    protected $fillable = [
        'product_id',
        'code',
        'price',
        'stock',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attributeOptions()
    {
        return $this->belongsToMany(ProductAttributeOption::class, 'product_variant_options');
    }

    public function carts()
    {
        return $this->hasMany(Cart::class, 'product_variant_id');
    }
}
