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
        // Tabla de usuarios
        Schema::create('usuarios', function (Blueprint $table) {
            $table->string('cedula_usuarios')->primary(); // Clave primaria personalizada
            $table->string('nombres_usuarios');
            $table->string('email_usuarios')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('contraseña_usuarios', 60); // Contraseña con longitud suficiente
            $table->string('telefonoMovil_usuarios');
            $table->string('direccion_usuarios');
            $table->string('telefonoLocal_usuarios');
            $table->date('fechaNacimiento_usuarios');
            $table->string('genero_usuarios');
            $table->rememberToken();
            $table->timestamps();
        });

        // Tabla de tokens para restablecer contraseñas
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email_usuarios')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Tabla de sesiones
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('cedula_usuarios')->nullable()->index(); // Clave foránea
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};