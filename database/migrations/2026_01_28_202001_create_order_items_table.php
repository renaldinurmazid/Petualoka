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
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->uuid('product_id');
            $table->uuid('product_variant_id')->nullable();
            $table->uuid('vendor_id'); // Snapshot of vendor for easier grouping/payouts

            $table->string('product_name'); // Snapshot to handle deleted products
            $table->string('variant_name')->nullable(); // Snapshot
            $table->decimal('price', 15, 2); // Snapshot
            $table->integer('quantity');

            $table->date('rental_start_date')->nullable();
            $table->date('rental_end_date')->nullable();

            $table->decimal('subtotal', 15, 2);
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('restrict');
            $table->foreign('vendor_id')->references('id')->on('vendor_profiles')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
