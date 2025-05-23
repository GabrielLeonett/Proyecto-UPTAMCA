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
        Schema::create('profesores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_categoria')->references('id')->on('categoria');
            $table->foreignId('id_cedula')->references('id')->on('users');
            $table->foreignId('id_dedicacion')->references('id')->on('dedicacion');
            $table->foreignId('id_ubicacion')->references('id')->on('ubicacion');
            $table->string('pre_grado', length:300)->nullable();
            $table->string('pos_grado', length:300)->nullable();
            $table->date('fecha_ingreso')->nullable();
            $table->integer('disponibilidad')->nullable();
        });

        Schema::create('administradores', function (Blueprint $table) {
            $table->id()->index();
            $table->foreignId('id_cedula')->references('id')->on('users');
        });

        Schema::create('coordinadores', function (Blueprint $table) {
            $table->id()->index();
            $table->foreignId('id_cedula')->references('id')->on('users');
            $table->foreignId('id_ubicacion')->references('id')->on('ubicacion');
            $table->foreignId('id_pnf')->references('id')->on('pnfs');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profesores');
        Schema::dropIfExists('administradores');
        Schema::dropIfExists('coordinadores');
    }
};
