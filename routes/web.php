<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('index');
});
Route::get('/inicio', function () {
    return Inertia::render('index');
});

use Illuminate\Support\Facades\DB;

Route::get('/test-db', function () {
    try {
        DB::connection()->getPdo();
        return "Conexión exitosa a la base de datos!";
    } catch (\Exception $e) {
        return "Error de conexión: " . $e->getMessage();
    }
});