<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Models\User;

Route::get('/', function () {
    return Inertia::render('index');
});
Route::get('/inicio', function () {
    return Inertia::render('index');
});

Route::get('/login', function () {
    return Inertia::render('login');
});

Route::post('/register', UserController::class.'@create');