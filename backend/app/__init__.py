"""Inicializacion de la aplicacion y carga de datos compartidos."""

from pathlib import Path

from flask import Flask
from sqlalchemy.exc import SQLAlchemyError

from .config import get_database_uri
from .database_cli import register_database_commands
from .data.recipe_loader import build_ingredient_catalog_from_recipes, load_recipes
from .extensions import db
from .models import __all__ as _models_loaded
from .repositories.catalog_repository import fetch_ingredient_catalog
from .repositories.recipe_repository import fetch_recipe_catalog
from .routes.web import web_bp
from .services.catalog_service import group_ingredients_by_category


def refresh_runtime_catalogs(app: Flask, allow_csv_fallback: bool = True) -> None:
    """Recarga recetas e ingredientes en memoria desde ORM o CSV de respaldo."""
    recipes_csv_path = app.config["RECIPES_CSV_PATH"]

    try:
        app.config["ALL_RECIPES_DB"] = fetch_recipe_catalog()
        app.config["INGREDIENT_CATALOG"] = fetch_ingredient_catalog()
        app.config["DATA_SOURCE"] = "mysql+sqlalchemy"
        app.config.pop("DATA_SOURCE_ERROR", None)
    except SQLAlchemyError as error:
        if not allow_csv_fallback:
            raise

        app.config["ALL_RECIPES_DB"] = load_recipes(recipes_csv_path)
        app.config["INGREDIENT_CATALOG"] = build_ingredient_catalog_from_recipes(
            app.config["ALL_RECIPES_DB"]
        )
        app.config["DATA_SOURCE"] = "csv"
        app.config["DATA_SOURCE_ERROR"] = str(error)

    app.config["INGREDIENT_CATALOG_GROUPED"] = group_ingredients_by_category(
        app.config["INGREDIENT_CATALOG"]
    )


def create_app() -> Flask:
    """Crea la aplicacion Flask y deja listas sus configuraciones principales."""
    from .routes.catalog_api import catalog_api_bp

    base_dir = Path(__file__).resolve().parent
    project_root = base_dir.parent.parent
    frontend_dir = project_root / "frontend"

    app = Flask(
        __name__,
        template_folder=str(frontend_dir / "templates"),
        static_folder=str(frontend_dir / "static"),
    )

    recipes_csv_path = base_dir.parent / "data" / "recipes.csv"
    app.config["RECIPES_CSV_PATH"] = recipes_csv_path
    app.config["SQLALCHEMY_DATABASE_URI"] = get_database_uri()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    register_database_commands(app)

    with app.app_context():
        _ = _models_loaded
        refresh_runtime_catalogs(app)

    app.register_blueprint(web_bp)
    app.register_blueprint(catalog_api_bp)
    return app
