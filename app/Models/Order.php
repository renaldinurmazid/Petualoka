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
        'user_address_id',
        'shipping_address',
        'paid_at',
        'completed_at',
        'expired_at',
        'delivery_methode',
        'shipping_price',
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
        'shipping_address' => 'array',
        'shipping_price' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethode()
    {
        return $this->belongsTo(PaymentMethode::class);
    }

    public function address()
    {
        return $this->belongsTo(UserAddress::class, 'user_address_id');
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
