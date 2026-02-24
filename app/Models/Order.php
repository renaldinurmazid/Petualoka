<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'payment_methode_id',
        'order_number',
        'total_amount',
        'service_fee',
        'voucher_id',
        'discount_amount',
        'grand_total',
        'status',
        'notes',
        'transaction_id',
        'payment_status',
        'payment_info',
        'paid_at',
        'completed_at',
        'expired_at',
        'delivery_methode',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'payment_info' => 'array',
        'paid_at' => 'datetime',
        'completed_at' => 'datetime',
        'expired_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethode()
    {
        return $this->belongsTo(PaymentMethode::class);
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusLogs()
    {
        return $this->hasMany(OrderStatusLog::class);
    }
}
