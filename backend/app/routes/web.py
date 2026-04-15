"""Rutas web principales de PantryGo."""

from flask import Blueprint, current_app, render_template, request

from ..services.recipe_service import find_recipes_by_inventory, normalize_ingredient_list

web_bp = Blueprint("web", __name__)


@web_bp.route("/")
def index():
    """Renderiza la pagina principal de bienvenida."""
    return render_template(
        "welcome.html",
        data_source=current_app.config.get("DATA_SOURCE", "csv"),
        data_source_error=current_app.config.get("DATA_SOURCE_ERROR"),
        ingredient_catalog=current_app.config.get("INGREDIENT_CATALOG", []),
        ingredient_catalog_grouped=current_app.config.get("INGREDIENT_CATALOG_GROUPED", []),
    )


@web_bp.route("/inventory")
def inventory():
    """Renderiza la vista para armar el inventario del usuario."""
    return render_template(
        "inventory.html",
        data_source=current_app.config.get("DATA_SOURCE", "csv"),
        data_source_error=current_app.config.get("DATA_SOURCE_ERROR"),
        ingredient_catalog=current_app.config.get("INGREDIENT_CATALOG", []),
        ingredient_catalog_grouped=current_app.config.get("INGREDIENT_CATALOG_GROUPED", []),
    )


@web_bp.route("/recipes")
def recipes():
    """Renderiza el catalogo completo de recetas."""
    return render_template(
        "recipes.html",
        recipes=current_app.config.get("ALL_RECIPES_DB", []),
        data_source=current_app.config.get("DATA_SOURCE", "csv"),
        data_source_error=current_app.config.get("DATA_SOURCE_ERROR"),
    )


@web_bp.route("/plan", methods=["POST"])
def get_plan():
    """Clasifica recetas segun ingredientes disponibles y prohibidos."""
    raw_available_ingredients = request.form.get("available_ingredients", "")
    raw_banned_ingredients = request.form.get("banned_ingredients", "")
    available_ingredients = normalize_ingredient_list(raw_available_ingredients)
    banned_ingredients = normalize_ingredient_list(raw_banned_ingredients)

    all_recipes = current_app.config.get("ALL_RECIPES_DB", [])
    available_now, suggestions_list, blocked_list = find_recipes_by_inventory(
        available_ingredients,
        banned_ingredients,
        all_recipes,
    )

    return render_template(
        "results.html",
        can_make_list=available_now,
        suggestions_list=suggestions_list,
        blocked_list=blocked_list,
        available_ingredients_str=raw_available_ingredients,
        banned_ingredients_str=raw_banned_ingredients,
        data_source=current_app.config.get("DATA_SOURCE", "csv"),
        data_source_error=current_app.config.get("DATA_SOURCE_ERROR"),
    )
