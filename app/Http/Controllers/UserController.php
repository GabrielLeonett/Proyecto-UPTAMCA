<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;

class UserController extends Controller
{
    public function index()
    {
        $users = DB::table('users')->get();
        return '<h1>Users:' . $users . '</h1>';
    }
    public function create(Request $request)
    {
        // Validar los datos del formulario
        $validatedData = $request->validate([
            'id' => 'required|string|unique:users,id', // Asegura que el ID sea único en la tabla 'users'
            'nombres' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email', // Asegura que el email sea único
            'direccion' => 'required|string|max:255',
            'telefonoMovil' => 'required|string|max:15',
            'telefonoLocal' => 'nullable|string|max:15',
            'fecha_nacimiento' => 'required|date',
            'genero' => 'required|string|in:masculino,femenino,otro', // Asegura que el género sea uno de los valores permitidos
            'password' => 'required|string|min:8', // Asegura que la contraseña tenga al menos 8 caracteres
        ]);

        // Insertar los datos en la base de datos
        DB::table('users')->insert([
            'id' => $validatedData['id'],
            'nombres' => $validatedData['nombres'],
            'email' => $validatedData['email'],
            'direccion' => $validatedData['direccion'],
            'telefonoMovil' => $validatedData['telefonoMovil'],
            'telefonoLocal' => $validatedData['telefonoLocal'],
            'fecha_nacimiento' => $validatedData['fecha_nacimiento'],
            'genero' => $validatedData['genero'],
            'password' => Crypt::encryptString($validatedData['password']), // Encriptar la contraseña
            'created_at' => now(), // Agregar marca de tiempo
            'updated_at' => now(), // Agregar marca de tiempo
        ]);

        // Redirigir con un mensaje de éxito
        return redirect()->route('login')->with('success', 'Usuario creado exitosamente.');
    }
}
