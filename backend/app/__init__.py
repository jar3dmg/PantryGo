"""Inicializacion de la aplicacion y carga de datos compartidos."""

from pathlib import Path

from flask import Flask

from .config import get_database_config
from .data.recipe_loader import build_ingredient_catalog_from_recipes, load_recipes
from .repositories.catalog_repository import fetch_ingredient_catalog
from .repositories.recipe_repository import fetch_recipe_catalog
from .routes.web import web_bp
from .services.catalog_service import group_ingredients_by_category


def create_app() -> Flask:
    """Crea la aplicacion Flask y deja listas sus configuraciones principales."""
    base_dir = Path(__file__).resolve().parent
    project_root = base_dir.parent.parent
    frontend_dir = project_root / "frontend"

    app = Flask(
        __name__,
        template_folder=str(frontend_dir / "templates"),
        static_folder=str(frontend_dir / "static"),
    )

    recipes_csv_path = base_dir.parent / "data" / "recipes.csv"
    app.config["DB_CONFIG"] = get_database_config()
    app.config["RECIPES_CSV_PATH"] = recipes_csv_path

    # Intenta usar MySQL; si falla, usa el CSV como respaldo.
    try:
        app.config["ALL_RECIPES_DB"] = fetch_recipe_catalog(app.config["DB_CONFIG"])
        app.config["INGREDIENT_CATALOG"] = fetch_ingredient_catalog(app.config["DB_CONFIG"])
        app.config["DATA_SOURCE"] = "mysql"
    except Exception as error:
        app.config["ALL_RECIPES_DB"] = load_recipes(recipes_csv_path)
        app.config["INGREDIENT_CATALOG"] = build_ingredient_catalog_from_recipes(
            app.config["ALL_RECIPES_DB"]
        )
        app.config["DATA_SOURCE"] = "csv"
        app.config["DATA_SOURCE_ERROR"] = str(error)

    # Esta estructura agrupada se usa directamente en la pantalla de inventario.
    app.config["INGREDIENT_CATALOG_GROUPED"] = group_ingredients_by_category(
        app.config["INGREDIENT_CATALOG"]
    )

    app.register_blueprint(web_bp)
    return app
