# PantryGo

Aplicacion web para explorar recetas a partir de un inventario de ingredientes.
El proyecto usa Flask para renderizar vistas, SQLAlchemy como capa ORM principal,
MySQL como base principal, un sistema propio de `Migrations` y `Seeders`
y un CSV como modo de respaldo cuando la base no esta disponible.

## Estructura

- `app.py`
- `.gitignore`
- `backend/app/`
  contiene configuracion, rutas, servicios, repositorios, utilidades y respaldo CSV
- `backend/data/`
  reservado para `recipes.csv` cuando se usa el modo de respaldo
- `backend/database/mysql/`
  contiene esquema, catalogos base y datos de ejemplo
- `backend/requirements.txt`
- `frontend/templates/`
  contiene `base.html`, `welcome.html`, `inventory.html`, `recipes.html` y `results.html`
- `frontend/static/css/styles.css`
- `frontend/static/js/index.js`
- `frontend/static/js/results.js`
- `frontend/static/img/pantrygo-main-logo.png`
- `docs/database_model.md`
- `docs/manual_tecnico.md`
- `docs/Nuevo-Formato-Base-de-Datos.png`

## Que hace cada parte

- `app.py`: arranca Flask.
- `backend/app/__init__.py`: crea la aplicacion y decide si usa MySQL o CSV.
- `backend/app/config.py`: centraliza la configuracion de la base de datos.
- `backend/app/extensions.py`: inicializa SQLAlchemy.
- `backend/app/database_cli.py`: registra comandos CLI para `Migrations` y `Seeders`.
- `backend/app/models/`: define las entidades ORM del dominio.
- `backend/app/routes/web.py`: define las rutas web.
- `backend/app/routes/catalog_api.py`: expone endpoints JSON para CRUD administrativo.
- `backend/app/services/`: contiene la logica de negocio.
- `backend/app/repositories/`: consulta la informacion usando SQLAlchemy.
- `backend/app/data/recipe_loader.py`: carga recetas desde CSV en modo respaldo.
- `backend/app/utils/ingredient_cleaner.py`: limpia nombres de ingredientes para compararlos.
- `backend/database/Migrations/`: scripts SQL de migracion ejecutados en orden.
- `backend/database/Seeders/`: scripts SQL para poblar catalogos y datos semilla.
- `frontend/templates/`: vistas HTML renderizadas por Flask.
- `frontend/static/js/`: comportamiento del inventario, filtros y paginacion.
- `frontend/static/css/styles.css`: estilos globales del proyecto.

## Ejecucion

1. Instala dependencias:

```bash
pip install -r backend/requirements.txt
```

2. Inicia la app:

```bash
python app.py
```

La entrada principal desactiva la escritura de `__pycache__` y archivos `.pyc`
para que no se regeneren al correr la app o los comandos Flask usando `--app app`.

3. Abre en el navegador:

```text
http://127.0.0.1:5000
```

## MySQL en XAMPP

La app intenta conectarse primero a MySQL con estos valores por defecto:

- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_PASSWORD=`
- `DB_NAME=recetario_app`

Si no logra conectarse, usa el CSV ubicado en `backend/data/recipes.csv` si ese archivo existe.

## Migrations y Seeders

Para una base nueva:

```bash
python -m flask --app app migrate up
python -m flask --app app seed run
```

Notas:

- `migrate up` ejecuta los scripts pendientes dentro de `backend/database/Migrations/`.
- `seed run` ejecuta los scripts pendientes dentro de `backend/database/Seeders/`.
- Puedes revisar el estado con:

```bash
python -m flask --app app migrate status
python -m flask --app app seed status
```

Si quieres ejecutar un seeder puntual:

```bash
python -m flask --app app seed run --file 001_base_catalogs.sql
```

Para una base existente creada anteriormente con los SQL legacy:

```bash
python -m flask --app app migrate mark-all
```

Ese comando marca las migraciones actuales como ya aplicadas sin ejecutarlas, para que el siguiente trabajo de esquema ya se controle desde la carpeta `Migrations`.

## Base de datos legacy

Importa estos archivos en phpMyAdmin en este orden:

1. `backend/database/mysql/001_schema.sql`
2. `backend/database/mysql/002_catalog_seed.sql`
3. `backend/database/mysql/003_sample_data.sql`

Documentacion adicional:

- `docs/database_model.md`
- `docs/manual_tecnico.md`

## CRUD de catalogos en backend

La aplicacion ya incluye una primera API JSON para administrar catalogos desde MySQL.

- `GET /api/catalogs/metadata`: devuelve categorias, unidades, dificultades y estatus.
- `GET /api/catalogs/ingredients`: lista ingredientes con detalle administrativo.
- `GET /api/catalogs/ingredients/<id>`: detalle de ingrediente.
- `POST /api/catalogs/ingredients`: crea ingrediente.
- `PUT /api/catalogs/ingredients/<id>`: actualiza ingrediente.
- `DELETE /api/catalogs/ingredients/<id>`: baja logica del ingrediente (`is_active = 0`).
- `GET /api/catalogs/recipes`: lista recetas con ingredientes y pasos.
- `GET /api/catalogs/recipes/<id>`: detalle de receta.
- `POST /api/catalogs/recipes`: crea receta.
- `PUT /api/catalogs/recipes/<id>`: actualiza receta y reemplaza ingredientes/pasos.
- `DELETE /api/catalogs/recipes/<id>`: archivo logico de receta (`status = archived`).

Despues de cada alta, edicion o baja, la app refresca en memoria el catalogo de ingredientes y recetas para que el resto de vistas siga usando informacion actualizada.
