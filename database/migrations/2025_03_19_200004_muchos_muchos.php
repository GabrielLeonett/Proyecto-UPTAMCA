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
        Schema::create('r_horarios_unidad_curricular', function(Blueprint $table){
            $table->id();
            $table->foreignId('id_horario')->references('id')->on('horarios');
            $table->foreignId('id_unidad_curricular')->references('id')->on('unidad_curricular');
        });
        
        Schema::create('r_profesores_unidad_curricular', function(Blueprint $table){
            $table->id();
            $table->foreignId('id_profesores')->references('id')->on('profesores');
            $table->foreignId('id_unidad_curricular')->references('id')->on('unidad_curricular');
        });
        Schema::create('r_unidad_curricular_seccion',function(Blueprint $table){
            $table->id();
            $table->foreignId('id_unidad_curricular')->references('id')->on('unidad_curricular');
            $table->foreignId('id_seccion')->references('id')->on('secciones');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('r_horarios_materias');
        Schema::dropIfExists('r_profesores_materias');

    }
};
