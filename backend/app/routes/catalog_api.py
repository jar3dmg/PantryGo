"""Rutas JSON para administrar catalogos de ingredientes y recetas."""

from flask import Blueprint, current_app, jsonify, request

from .. import refresh_runtime_catalogs
from ..services.catalog_admin_service import (
    CatalogNotFoundError,
    CatalogValidationError,
    create_ingredient_entry,
    create_recipe_entry,
    delete_ingredient_entry,
    delete_recipe_entry,
    get_ingredient,
    get_recipe,
    list_catalog_metadata,
    list_ingredients,
    list_recipes,
    update_ingredient_entry,
    update_recipe_entry,
)

catalog_api_bp = Blueprint("catalog_api", __name__, url_prefix="/api/catalogs")


@catalog_api_bp.route("/metadata", methods=["GET"])
def metadata():
    """Entrega catalogos auxiliares para construir formularios administrativos."""
    return _execute_json(lambda: list_catalog_metadata(None))


@catalog_api_bp.route("/ingredients", methods=["GET"])
def ingredient_list():
    """Lista todos los ingredientes con detalle administrativo."""
    return _execute_json(lambda: list_ingredients(None))


@catalog_api_bp.route("/ingredients/<int:ingredient_id>", methods=["GET"])
def ingredient_detail(ingredient_id: int):
    """Obtiene el detalle de un ingrediente."""
    return _execute_json(lambda: get_ingredient(None, ingredient_id))


@catalog_api_bp.route("/ingredients", methods=["POST"])
def ingredient_create():
    """Crea un ingrediente nuevo y refresca los catalogos en memoria."""
    return _execute_json(
        lambda: create_ingredient_entry(None, _payload()),
        message="Ingrediente creado correctamente.",
        refresh_after_write=True,
        status_code=201,
    )


@catalog_api_bp.route("/ingredients/<int:ingredient_id>", methods=["PUT"])
def ingredient_update(ingredient_id: int):
    """Actualiza un ingrediente existente y refresca los catalogos en memoria."""
    return _execute_json(
        lambda: update_ingredient_entry(
            None,
            ingredient_id,
            _payload(),
        ),
        message="Ingrediente actualizado correctamente.",
        refresh_after_write=True,
    )


@catalog_api_bp.route("/ingredients/<int:ingredient_id>", methods=["DELETE"])
def ingredient_delete(ingredient_id: int):
    """Desactiva un ingrediente del catalogo operativo."""
    return _execute_json(
        lambda: delete_ingredient_entry(None, ingredient_id),
        message="Ingrediente desactivado correctamente.",
        refresh_after_write=True,
    )


@catalog_api_bp.route("/recipes", methods=["GET"])
def recipe_list():
    """Lista todas las recetas con sus relaciones principales."""
    return _execute_json(lambda: list_recipes(None))


@catalog_api_bp.route("/recipes/<int:recipe_id>", methods=["GET"])
def recipe_detail(recipe_id: int):
    """Obtiene el detalle administrativo de una receta."""
    return _execute_json(lambda: get_recipe(None, recipe_id))


@catalog_api_bp.route("/recipes", methods=["POST"])
def recipe_create():
    """Crea una receta nueva y actualiza cache compartido."""
    return _execute_json(
        lambda: create_recipe_entry(None, _payload()),
        message="Receta creada correctamente.",
        refresh_after_write=True,
        status_code=201,
    )


@catalog_api_bp.route("/recipes/<int:recipe_id>", methods=["PUT"])
def recipe_update(recipe_id: int):
    """Actualiza una receta existente y actualiza cache compartido."""
    return _execute_json(
        lambda: update_recipe_entry(None, recipe_id, _payload()),
        message="Receta actualizada correctamente.",
        refresh_after_write=True,
    )


@catalog_api_bp.route("/recipes/<int:recipe_id>", methods=["DELETE"])
def recipe_delete(recipe_id: int):
    """Archiva una receta para retirarla del catalogo publicado."""
    return _execute_json(
        lambda: delete_recipe_entry(None, recipe_id),
        message="Receta archivada correctamente.",
        refresh_after_write=True,
    )


def _execute_json(callback, message: str | None = None, refresh_after_write: bool = False, status_code: int = 200):
    """Centraliza el manejo de errores y respuestas JSON de la API."""
    try:
        data = callback()
        if refresh_after_write:
            refresh_runtime_catalogs(current_app, allow_csv_fallback=False)
        response = {"ok": True, "data": data}
        if message:
            response["message"] = message
        return jsonify(response), status_code
    except CatalogValidationError as error:
        return jsonify({"ok": False, "message": str(error)}), 400
    except CatalogNotFoundError as error:
        return jsonify({"ok": False, "message": str(error)}), 404
    except Exception as error:
        return (
            jsonify(
                {
                    "ok": False,
                    "message": "No fue posible completar la operacion del catalogo.",
                    "details": str(error),
                }
            ),
            503,
        )


def _payload():
    """Obtiene el cuerpo JSON o un diccionario vacio si no viene contenido."""
    return request.get_json(silent=True) or {}
