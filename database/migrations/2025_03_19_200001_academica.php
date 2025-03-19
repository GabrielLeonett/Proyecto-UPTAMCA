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
        Schema::create('pnfs', function ( Blueprint $table){
            $table->id();
            $table->string('nombre_pnf')->nullable();
            $table->string('descripcion_pnf', length:400)->nullable();
        });

        Schema::create('materias', function ( Blueprint $table){
            $table->id();
            $table->string('nombre_materia')->nullable();
            $table->string('descripcion_materia', length:400)->nullable();
            $table->foreignId('id_pnf')->references('id')->on('pnfs');
            $table->integer('carga_horas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pnfs');
        Schema::dropIfExists('materias');
    }
};
