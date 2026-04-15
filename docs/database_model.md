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

## Archivos SQL

- `backend/database/mysql/001_schema.sql`: crea la base de datos y todas las tablas.
- `backend/database/mysql/002_catalog_seed.sql`: inserta catalogos base.

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

## Siguiente paso recomendado

Conectar Flask a MySQL con SQLAlchemy o Flask-MySQLdb y reemplazar la carga desde CSV por consultas reales a la base de datos.
