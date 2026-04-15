# PantryGo

Aplicacion web para explorar recetas a partir de un inventario de ingredientes.
El proyecto usa Flask para renderizar vistas, MySQL como fuente principal de datos
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
- `backend/app/routes/web.py`: define las rutas web.
- `backend/app/services/`: contiene la logica de negocio.
- `backend/app/repositories/`: consulta la informacion en MySQL.
- `backend/app/data/recipe_loader.py`: carga recetas desde CSV en modo respaldo.
- `backend/app/utils/ingredient_cleaner.py`: limpia nombres de ingredientes para compararlos.
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

## Base de datos

Importa estos archivos en phpMyAdmin en este orden:

1. `backend/database/mysql/001_schema.sql`
2. `backend/database/mysql/002_catalog_seed.sql`
3. `backend/database/mysql/003_sample_data.sql`

Documentacion adicional:

- `docs/database_model.md`
- `docs/manual_tecnico.md`
