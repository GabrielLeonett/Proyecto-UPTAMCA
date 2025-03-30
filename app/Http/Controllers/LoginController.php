<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function authenticate(Request $request){
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8',
        ]);
    
        if (Auth::attempt($credentials, $request->remember)) {
            $request->session()->regenerate();
            $user = Auth::user(); 

            return response()->json([
                'icon' => 'success',
                'title' => 'Bienvenido',
                'text' => 'Inicio de sesión exitoso, bienvenida '.$user->nombres,
            ],200);
        }
    
        return response()->json([
            'icon' => 'error',
            'title' => 'Error',
            'text' => 'Credenciales incorrectas',
            'errors' => ['email' => 'Las credenciales no coinciden']
        ], 422);
    }
}