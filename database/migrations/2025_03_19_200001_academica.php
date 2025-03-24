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

        Schema::create('unidad_curricular', function ( Blueprint $table){
            $table->id();
            $table->string('nombre_unidad_curricular')->nullable();
            $table->string('descripcion_unidad_curricular', length:400)->nullable();
            $table->integer('carga_horas');
        });

        Schema::create('trayectos', function ( Blueprint $table){
            $table->id();
            $table->integer('valor_trayecto')->nullable();
            $table->foreignId('id_pnf')->references('id')->on('pnfs');
        });

        Schema::create('secciones', function ( Blueprint $table){
            $table->id();
            $table->integer('valor_seccion')->nullable();
            $table->foreignId('id_trayecto')->references('id')->on('trayectos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pnfs');
        Schema::dropIfExists('unidad_curricular');
        Schema::dropIfExists('trayectos');
        Schema::dropIfExists('secciones');
    }
};
