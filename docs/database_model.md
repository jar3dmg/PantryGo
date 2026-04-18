# Modelo de Base de Datos

Este proyecto evoluciona de un recetario basado en CSV a una aplicacion con usuarios, inventario personal e informacion normalizada por catalogos.

## Objetivo funcional

- Cada usuario inicia sesion.
- Cada usuario registra los ingredientes que tiene en casa.
- El sistema compara su inventario contra las recetas.
- El sistema recomienda recetas que puede preparar o las que casi puede preparar.
- La informacion queda estructurada para crecer a favoritos, historial y filtros.

## Motor sugerido

- MySQL o MariaDB administrado desde XAMPP y phpMyAdmin.

## Estado actual de infraestructura

La aplicacion ya migro su acceso principal a datos hacia:

- `Flask-SQLAlchemy` para modelos y consultas.
- Comandos propios `flask migrate ...` para ejecutar scripts dentro de `Migrations`.
- Comandos propios `flask seed ...` para ejecutar scripts dentro de `Seeders`.

## Archivos SQL

- `backend/database/mysql/001_schema.sql`: crea la base de datos y todas las tablas.
- `backend/database/mysql/002_catalog_seed.sql`: inserta catalogos base.

Estos archivos se conservan como referencia legacy, pero el flujo recomendado ahora vive en:

- `backend/database/Migrations/`
- `backend/database/Seeders/`

## Entidades principales

- `users`: usuarios de la app.
- `catalog_roles`: roles del sistema.
- `catalog_auth_providers`: proveedor de autenticacion.
- `ingredients`: ingrediente canonico.
- `ingredient_categories`: clasificacion de ingredientes.
- `ingredient_aliases`: nombres alternos para mejorar busqueda y captura.
- `recipes`: receta principal.
- `recipe_ingredients`: relacion muchos a muchos entre receta e ingrediente.
- `recipe_steps`: pasos ordenados de preparacion.
- `recipe_categories`: catalogo de categorias de receta.
- `recipe_tags`: etiquetas para filtros.
- `pantry_items`: inventario del usuario.
- `user_favorite_recipes`: favoritos.
- `user_recipe_history`: historial de interaccion.

## Flujo de recomendacion futuro

1. El usuario inicia sesion.
2. Registra sus ingredientes en `pantry_items`.
3. El backend obtiene los ingredientes disponibles del usuario.
4. Se comparan contra `recipe_ingredients`.
5. Se calculan recetas completas, recetas cercanas e ingredientes faltantes.

## Importacion en XAMPP

1. Abre phpMyAdmin.
2. Importa `backend/database/mysql/001_schema.sql`.
3. Importa `backend/database/mysql/002_catalog_seed.sql`.
4. Empieza a cargar ingredientes y recetas desde catalogos normalizados.

## Estado actual del CRUD backend

Ya existe una primera capa de API para administrar los catalogos principales desde Flask usando SQLAlchemy:

- Ingredientes:
  `GET /api/catalogs/ingredients`
  `GET /api/catalogs/ingredients/<id>`
  `POST /api/catalogs/ingredients`
  `PUT /api/catalogs/ingredients/<id>`
  `DELETE /api/catalogs/ingredients/<id>`
- Recetas:
  `GET /api/catalogs/recipes`
  `GET /api/catalogs/recipes/<id>`
  `POST /api/catalogs/recipes`
  `PUT /api/catalogs/recipes/<id>`
  `DELETE /api/catalogs/recipes/<id>`
- Catalogos auxiliares:
  `GET /api/catalogs/metadata`

Decisiones de negocio actuales:

- La baja de ingredientes es logica usando `ingredients.is_active = 0`.
- La baja de recetas es logica moviendo la receta al estatus `archived`.
- Despues de cada operacion de escritura se refresca la cache en memoria del backend para mantener sincronizadas las vistas que leen `ALL_RECIPES_DB` e `INGREDIENT_CATALOG`.

## Flujo recomendado de administracion de esquema

Para una base nueva:

1. `python -m flask --app app migrate up`
2. `python -m flask --app app seed run`

Para una base ya existente creada antes de esta migracion:

1. Respaldar la base.
2. Ejecutar `python -m flask --app app migrate mark-all`
3. A partir de ese momento agregar nuevos scripts SQL en `backend/database/Migrations/` y ejecutarlos con:
   `python -m flask --app app migrate up`
