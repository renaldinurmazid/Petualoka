<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WalletCustomer extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'balance',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
