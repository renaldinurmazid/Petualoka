<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Withdrawal extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'withdraw_account_id',
        'amount',
        'status',
        'reference_number',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function withdrawAccount()
    {
        return $this->belongsTo(WithdrawAccount::class);
    }
}
