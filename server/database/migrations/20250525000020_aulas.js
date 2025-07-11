export async function up(knex) {
  await knex.schema.createTable("tipos_de_aula", (table) => {
    table.increments("id").primary();
    table.string("nombre").notNullable().unique(); // Ej: Teoría, Laboratorio, etc.
    table.text("descripcion").nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("aulas", (table) => {
    table.increments("id_aula").primary();
    table.integer("id_sede").unsigned().notNullable().references("id_sede").inTable("sedes").onDelete("CASCADE");

    table.string("codigo").notNullable(); // Ej: A-101, LAB-2, etc.
    table.integer('tipo_id').unsigned().notNullable().references('id').inTable('tipos_de_aula').onDelete('RESTRICT');
    table.integer("capacidad").notNullable();

    table.boolean("activa").defaultTo(true); // Por si está fuera de servicio

    table.unique(["id_sede", "codigo"]); // No se repite el código dentro de una misma sede

    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("tipos_de_aula");
  await knex.schema.dropTableIfExists("aulas");
}
