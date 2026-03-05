<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductCategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'image',
        'is_active',
    ];

    public function getImageAttribute($value)
    {
        return asset('storage/' . $value);
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}
