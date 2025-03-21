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
        Schema::create('r_horarios_materias', function(Blueprint $table){
            $table->id();
            $table->foreignId('id_horario')->references('id')->on('horarios');
            $table->foreignId('id_materias')->references('id')->on('materias');
        });
        
        Schema::create('r_profesores_materias', function(Blueprint $table){
            $table->id();
            $table->foreignId('id_profesores')->references('id')->on('profesores');
            $table->foreignId('id_materias')->references('id')->on('materias');
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
