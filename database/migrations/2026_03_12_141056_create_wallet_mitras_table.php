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
        Schema::create('wallet_mitras', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vendor_profile_id')->constrained('vendor_profiles')->cascadeOnDelete();
            $table->decimal('balance', 15, 2)->default(0);
            $table->enum('status', ['active', 'suspended'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_mitras');
    }
};
