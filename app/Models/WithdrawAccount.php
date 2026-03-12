<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WithdrawAccount extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'bank_name',
        'account_number',
        'account_name',
        'is_primary',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
