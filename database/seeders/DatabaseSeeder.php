<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'id' => '31264460',
            'nombres' => 'Gabriel Leonett',
            'email' => 'gabrielleonett6688@gmail.com',
            'email_verified_at' => now(),
            'direccion' => 'Av.Bermudez, Edif.Torre Conteca, Piso 12, Apartamento B',
            'telefono_movil' => '0414-2245310',
            'telefono_local' => '0212-3641697',
            'fecha_nacimiento' => '2004-11-27',
            'genero' => 'masculino',
            'password' => Hash::make('12345678'),
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('categoria')->insert(
            [
                'id' => 1,
                'nombre_categoria' => 'Instructor'
            ],
            [
                'id' => 2,
                'nombre_categoria' => 'Asistente'
            ],
            [
                'id' => 3,
                'nombre_categoria' => 'Agregado'
            ],
            [
                'id' => 4,
                'nombre_categoria' => 'Asociado'
            ],
            [
                'id' => 5,
                'nombre_categoria' => 'Titular'
            ]
        );

        DB::table('dedicacion')->insert(
            [
                'id' => 1,
                'nombre_dedicacion' => 'Convencional'
            ],
            [
                'id' => 2,
                'nombre_dedicacion' => 'Medio tiempo'
            ],
            [
                'id' => 3,
                'nombre_dedicacion' => 'Tiempo completo'
            ],
            [
                'id' => 4,
                'nombre_dedicacion' => 'Exclusiva'
            ]
        );

        DB::table('ubicacion')->insert(
            [
                'id' => 1,
                'nombre_ubicacion' => 'Núcleo Tegnología y Ciencias Administrativas'
            ],
            [
                'id' => 2,
                'nombre_ubicacion' => 'Núcleo Humanidades y Ciencias Sociales'
            ],
            [
                'id' => 3,
                'nombre_ubicacion' => 'Núcleo Salud y Deporte'
            ],
        );

        DB::table('roles')->insert(
            [
                'id' => 1,
                'tipo_rol' => 1,
                'nombre_rol' => 'ViceRector'
            ],
            [
                'id' => 2,
                'tipo_rol' => 2,
                'nombre_rol' => 'Gestión Academica'
            ],
            [
                'id' => 3,
                'tipo_rol' => 3,
                'nombre_rol' => 'Gestión Curricular'
            ]
        );
    }
}
