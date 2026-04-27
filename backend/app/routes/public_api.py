"""Rutas JSON publicas pensadas para el frontend React."""

from flask import Blueprint, current_app, jsonify, request

from ..services.recipe_service import find_recipes_by_inventory, normalize_ingredient_list

public_api_bp = Blueprint("public_api", __name__, url_prefix="/api")


@public_api_bp.get("/app-state")
def app_state():
    """Entrega informacion general que React puede usar al arrancar."""
    recipes = _public_recipes()
    ingredients = current_app.config.get("INGREDIENT_CATALOG", [])
    data_source = current_app.config.get("DATA_SOURCE", "unknown")
    data_source_error = current_app.config.get("DATA_SOURCE_ERROR")

    return _json_response(
        {
            "data_source": data_source,
            "data_source_error": data_source_error,
            "status_message": _data_source_message(data_source, data_source_error),
            "counts": {
                "recipes": len(recipes),
                "ingredients": len(ingredients),
            },
        }
    )


@public_api_bp.get("/data-source-status")
def data_source_status():
    """Mantiene la ruta actual y agrega un contrato mas comodo para React."""
    data_source = current_app.config.get("DATA_SOURCE", "unknown")
    data_source_error = current_app.config.get("DATA_SOURCE_ERROR")
    message = _data_source_message(data_source, data_source_error)

    return _json_response(
        {
            "data_source": data_source,
            "data_source_error": data_source_error,
            "message": message,
        },
        message=message,
        extra={"message": message},
    )


@public_api_bp.get("/ingredients")
def ingredient_list():
    """Devuelve el catalogo de ingredientes listo para pantallas de inventario."""
    ingredients = current_app.config.get("INGREDIENT_CATALOG", [])
    grouped = current_app.config.get("INGREDIENT_CATALOG_GROUPED", [])

    return _json_response(
        {
            "items": ingredients,
            "grouped": grouped,
            "count": len(ingredients),
        }
    )


@public_api_bp.get("/recipes")
def recipe_list():
    """Devuelve las recetas publicas en el mismo formato que usaban las templates."""
    recipes = _public_recipes()

    return _json_response(
        {
            "items": recipes,
            "count": len(recipes),
            "categories": _unique_sorted(recipes, "category_name"),
            "difficulties": _unique_sorted(recipes, "difficulty_name"),
        }
    )


@public_api_bp.get("/recipes/<recipe_key>")
def recipe_detail(recipe_key: str):
    """Obtiene una receta publica por id o slug."""
    recipe = _find_recipe(recipe_key)
    if recipe is None:
        return _json_response(None, ok=False, message="No se encontro la receta solicitada.", status_code=404)

    return _json_response(recipe)


@public_api_bp.post("/plan")
def recipe_plan():
    """Clasifica recetas segun ingredientes disponibles y prohibidos enviados por React."""
    payload = request.get_json(silent=True) or request.form
    raw_available = _ingredient_input_to_text(payload.get("available_ingredients"))
    raw_banned = _ingredient_input_to_text(payload.get("banned_ingredients"))

    available_ingredients = normalize_ingredient_list(raw_available)
    banned_ingredients = normalize_ingredient_list(raw_banned)

    available_now, suggestions, blocked = find_recipes_by_inventory(
        available_ingredients,
        banned_ingredients,
        current_app.config.get("ALL_RECIPES_DB", []),
    )

    available_now = _serialize_recipe_list(available_now)
    suggestions = _serialize_recipe_list(suggestions)
    blocked = _serialize_recipe_list(blocked)

    return _json_response(
        {
            "available_now": available_now,
            "suggestions": suggestions,
            "blocked": blocked,
            "counts": {
                "available_now": len(available_now),
                "suggestions": len(suggestions),
                "blocked": len(blocked),
            },
            "filters": {
                "available_ingredients": sorted(available_ingredients),
                "banned_ingredients": sorted(banned_ingredients),
                "available_ingredients_text": raw_available,
                "banned_ingredients_text": raw_banned,
            },
        }
    )


def _json_response(data, ok: bool = True, message: str | None = None, status_code: int = 200, extra: dict | None = None):
    """Construye respuestas consistentes sin romper campos heredados."""
    response = {
        "ok": ok,
        "data": data,
    }
    if message:
        response["message"] = message
    if extra:
        response.update(extra)
    return jsonify(response), status_code


def _public_recipes():
    """Devuelve recetas serializables para JSON."""
    return _serialize_recipe_list(current_app.config.get("ALL_RECIPES_DB", []))


def _serialize_recipe_list(recipes: list[dict]):
    return [_serialize_recipe(recipe) for recipe in recipes]


def _serialize_recipe(recipe: dict):
    """Quita campos internos y agrega alias utiles para componentes React."""
    serialized = {
        key: value
        for key, value in recipe.items()
        if key != "ingredient_terms"
    }

    if "name" in serialized and "title" not in serialized:
        serialized["title"] = serialized["name"]

    serialized["ingredients"] = [
        dict(ingredient)
        for ingredient in serialized.get("ingredients", [])
    ]
    serialized["steps"] = [
        dict(step)
        for step in serialized.get("steps", [])
    ]

    return serialized


def _find_recipe(recipe_key: str):
    for recipe in _public_recipes():
        if str(recipe.get("id")) == recipe_key or recipe.get("slug") == recipe_key:
            return recipe
    return None


def _ingredient_input_to_text(value):
    """Acepta arreglos de React o texto separado por comas."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return ", ".join(str(item).strip() for item in value if str(item).strip())
    return str(value)


def _unique_sorted(items: list[dict], key: str):
    return sorted({item.get(key) for item in items if item.get(key)})


def _data_source_message(data_source: str, data_source_error: str | None):
    if data_source_error:
        return "No se pudo conectar a MySQL. Puedes seguir usando el inventario con el modo de respaldo."
    return f"Fuente: {data_source.upper()}"
