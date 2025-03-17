<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profesores', Blueprint $table) {
            $table->string('ID_profesor')->primary(); // Clave primaria personalizada
            $table->string('ID_Categoria')->nullable(); // Clave foránea
            $table->string('Cedula_ID')->nullable();
            $table->string('ID_Dedicacion')->nullable();
            $table->timestamp('ID_Ubicacion')->nullable();
            $table->string('Pre-grado', 300);
            $table->string('Pos-grado', 300)
            $table->string('disponibilidad', 300);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        //
    }
};
