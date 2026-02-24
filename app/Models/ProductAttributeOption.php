<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductAttributeOption extends Model
{
    use HasUuids;
    protected $table = 'product_attribute_options';

    protected $fillable = [
        'product_attribute_id',
        'value',
    ];

    public function productAttribute()
    {
        return $this->belongsTo(ProductAttribute::class);
    }
}
