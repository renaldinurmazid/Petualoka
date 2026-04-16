<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->uuid('user_address_id')->nullable()->after('payment_methode_id');
            $table->json('shipping_address')->nullable()->after('user_address_id');

            $table->foreign('user_address_id')->references('id')->on('user_addresses')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_address_id']);
            $table->dropColumn(['user_address_id', 'shipping_address']);
        });
    }
};
