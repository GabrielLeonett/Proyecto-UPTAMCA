<?php


use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('index');
})->name('inicio');
Route::get('/inicio', function () {
    return Inertia::render('index');
})->name('inicio');

Route::get('/profesores', function() {
    if(Auth::check()){
        return 'estas logueado';
    }
    return 'no estas logueado';
});

Route::get('/login', function (){
    return Inertia::render('login');
});

Route::post('/login', [LoginController::class, 'authenticate'])->name('login');
