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
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');

            $table->string('label')->nullable()->comment('Contoh: Rumah, Kantor');
            $table->string('recipient_name');
            $table->string('phone_number');

            $table->string('province_id')->nullable();
            $table->string('province_name');
            $table->string('city_id')->nullable();
            $table->string('city_name');
            $table->string('district_id')->nullable();
            $table->string('district_name');
            $table->string('subdistrict_id')->nullable();
            $table->string('subdistrict_name');
            $table->string('postal_code', 10);

            $table->text('full_address')->comment('Detail alamat seperti nama jalan, no rumah, blok, dsb');
            $table->text('notes')->nullable()->comment('Catatan untuk kurir');

            $table->boolean('is_default')->default(false);

            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
