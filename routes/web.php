<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('index');
});
Route::get('/inicio', function () {
    return Inertia::render('index');
});