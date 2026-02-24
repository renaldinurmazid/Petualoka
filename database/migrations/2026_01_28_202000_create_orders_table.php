<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('payment_methode_id')->nullable();
            $table->string('order_number')->unique();
            $table->decimal('total_amount', 15, 2);
            $table->decimal('service_fee', 15, 2)->default(0);
            $table->uuid('voucher_id')->nullable();
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2);
            $table->enum('status', ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'expired'])->default('pending');
            $table->text('notes')->nullable();

            // Midtrans Core API specific fields
            $table->string('transaction_id')->nullable(); // Midtrans transaction ID
            $table->string('payment_status', 50)->nullable(); // settlement, pending, failure, etc.
            $table->json('payment_info')->nullable(); // To store VA numbers, bill keys, QR URLs, etc.

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('payment_methode_id')->references('id')->on('payment_methodes')->onDelete('set null');
            $table->foreign('voucher_id')->references('id')->on('vouchers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
