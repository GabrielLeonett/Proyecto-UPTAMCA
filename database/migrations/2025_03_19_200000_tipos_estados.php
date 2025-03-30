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
        Schema::create('categoria',  function (Blueprint $table){
            $table->id();
            $table->string('nombre_categoria');
        });

        Schema::create('dedicacion',  function (Blueprint $table){
            $table->id();
            $table->string('nombre_dedicacion');
        });

        Schema::create('ubicacion',  function (Blueprint $table){
            $table->id();
            $table->string('nombre_ubicacion');
        });

        Schema::create('roles',  function (Blueprint $table){
            $table->id();
            $table->integer('tipo_rol');
            $table->string('nombre_rol');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categoria');
        Schema::dropIfExists('dedicacion');
        Schema::dropIfExists('ubicacion');
        Schema::dropIfExists('roles');
    }
};
