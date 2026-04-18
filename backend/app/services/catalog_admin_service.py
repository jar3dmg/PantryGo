"""Validaciones y orquestacion del CRUD administrativo de catalogos."""

from decimal import Decimal, InvalidOperation
import re
import unicodedata

from sqlalchemy.exc import IntegrityError

from ..repositories.catalog_admin_repository import (
    archive_recipe,
    create_ingredient,
    create_recipe,
    deactivate_ingredient,
    fetch_admin_ingredient_by_id,
    fetch_admin_ingredient_catalog,
    fetch_admin_recipe_by_id,
    fetch_admin_recipe_catalog,
    fetch_catalog_metadata,
    update_ingredient,
    update_recipe,
)


class CatalogValidationError(ValueError):
    """Error para datos de entrada invalidos en el CRUD."""


class CatalogNotFoundError(LookupError):
    """Error para ids inexistentes dentro del catalogo."""


def list_catalog_metadata(db_config: dict):
    """Expone catalogos auxiliares para alimentar formularios administrativos."""
    return fetch_catalog_metadata()


def list_ingredients(db_config: dict):
    """Lista ingredientes con detalle administrativo."""
    return fetch_admin_ingredient_catalog()


def get_ingredient(db_config: dict, ingredient_id: int):
    """Obtiene un ingrediente por id o lanza error si no existe."""
    ingredient = fetch_admin_ingredient_by_id(ingredient_id)
    if ingredient is None:
        raise CatalogNotFoundError("No se encontro el ingrediente solicitado.")
    return ingredient


def create_ingredient_entry(db_config: dict, payload: dict):
    """Valida e inserta un ingrediente nuevo."""
    metadata = fetch_catalog_metadata()
    ingredient_data = _build_ingredient_payload(payload, metadata)
    return _execute_write(create_ingredient, ingredient_data)


def update_ingredient_entry(db_config: dict, ingredient_id: int, payload: dict):
    """Valida y actualiza un ingrediente existente."""
    existing = fetch_admin_ingredient_by_id(ingredient_id)
    if existing is None:
        raise CatalogNotFoundError("No se encontro el ingrediente solicitado.")

    metadata = fetch_catalog_metadata()
    ingredient_data = _build_ingredient_payload(payload, metadata, existing)
    return _execute_write(update_ingredient, ingredient_id, ingredient_data)


def delete_ingredient_entry(db_config: dict, ingredient_id: int):
    """Desactiva un ingrediente existente."""
    existing = fetch_admin_ingredient_by_id(ingredient_id)
    if existing is None:
        raise CatalogNotFoundError("No se encontro el ingrediente solicitado.")

    return _execute_write(deactivate_ingredient, ingredient_id)


def list_recipes(db_config: dict):
    """Lista recetas con detalle administrativo."""
    return fetch_admin_recipe_catalog()


def get_recipe(db_config: dict, recipe_id: int):
    """Obtiene una receta puntual por id."""
    recipe = fetch_admin_recipe_by_id(recipe_id)
    if recipe is None:
        raise CatalogNotFoundError("No se encontro la receta solicitada.")
    return recipe


def create_recipe_entry(db_config: dict, payload: dict):
    """Valida e inserta una receta nueva con sus listas hijas."""
    metadata = fetch_catalog_metadata()
    recipe_data = _build_recipe_payload(payload, metadata)
    return _execute_write(create_recipe, recipe_data)


def update_recipe_entry(db_config: dict, recipe_id: int, payload: dict):
    """Valida y actualiza una receta existente."""
    existing = fetch_admin_recipe_by_id(recipe_id)
    if existing is None:
        raise CatalogNotFoundError("No se encontro la receta solicitada.")

    metadata = fetch_catalog_metadata()
    recipe_data = _build_recipe_payload(payload, metadata, existing)
    return _execute_write(update_recipe, recipe_id, recipe_data)


def delete_recipe_entry(db_config: dict, recipe_id: int):
    """Archiva una receta para retirarla del catalogo publicado."""
    recipe = fetch_admin_recipe_by_id(recipe_id)
    if recipe is None:
        raise CatalogNotFoundError("No se encontro la receta solicitada.")

    metadata = fetch_catalog_metadata()
    archived_status_id = _find_id_by_code(
        metadata["recipe_statuses"],
        "archived",
        "No existe el estatus archivado en el catalogo de recetas.",
    )
    return _execute_write(archive_recipe, recipe_id, archived_status_id)


def _execute_write(callback, *args):
    """Mapea errores de integridad a mensajes funcionales."""
    try:
        return callback(*args)
    except IntegrityError as error:
        raise CatalogValidationError(_translate_integrity_error(error)) from error


def _build_ingredient_payload(payload: dict, metadata: dict, existing: dict | None = None):
    """Normaliza la carga util de ingredientes antes de persistir."""
    name = _required_text(payload.get("name"), "El nombre del ingrediente es obligatorio.")

    ingredient_data = {
        "ingredient_category_id": _validate_id(
            payload.get("ingredient_category_id", _get_existing(existing, "ingredient_category_id")),
            _active_ids(metadata["ingredient_categories"]),
            "La categoria del ingrediente es obligatoria y debe existir.",
        ),
        "name": name,
        "slug": _slugify(name),
        "description": _optional_text(payload.get("description", _get_existing(existing, "description"))),
        "is_active": _optional_bool(
            payload.get("is_active", _get_existing(existing, "is_active")),
            default=True,
        ),
    }

    return ingredient_data


def _build_recipe_payload(payload: dict, metadata: dict, existing: dict | None = None):
    """Normaliza la carga util de recetas antes de persistir."""
    title = _required_text(payload.get("title"), "El titulo de la receta es obligatorio.")
    prep_time_minutes = _optional_int(
        payload.get("prep_time_minutes", _get_existing(existing, "prep_time_minutes")),
        min_value=0,
        message="El tiempo de preparacion debe ser un entero mayor o igual a cero.",
    )
    cook_time_minutes = _optional_int(
        payload.get("cook_time_minutes", _get_existing(existing, "cook_time_minutes")),
        min_value=0,
        message="El tiempo de coccion debe ser un entero mayor o igual a cero.",
    )
    total_time_minutes = _optional_int(
        payload.get("total_time_minutes"),
        min_value=0,
        message="El tiempo total debe ser un entero mayor o igual a cero.",
    )

    if total_time_minutes is None:
        if prep_time_minutes is not None and cook_time_minutes is not None:
            total_time_minutes = prep_time_minutes + cook_time_minutes
        else:
            total_time_minutes = _get_existing(existing, "total_time_minutes")

    recipe_data = {
        "recipe_status_id": _resolve_recipe_status_id(
            payload,
            metadata,
            existing,
        ),
        "recipe_difficulty_id": _optional_id(
            payload.get("recipe_difficulty_id", _get_existing(existing, "recipe_difficulty_id")),
            _active_ids(metadata["recipe_difficulties"]),
            "La dificultad indicada no existe o esta inactiva.",
        ),
        "recipe_category_id": _optional_id(
            payload.get("recipe_category_id", _get_existing(existing, "recipe_category_id")),
            _active_ids(metadata["recipe_categories"]),
            "La categoria de receta indicada no existe o esta inactiva.",
        ),
        "title": title,
        "slug": _slugify(title),
        "short_description": _optional_text(
            payload.get("short_description", _get_existing(existing, "short_description"))
        ),
        "description": _optional_text(payload.get("description", _get_existing(existing, "description"))),
        "servings": _optional_int(
            payload.get("servings", _get_existing(existing, "servings")),
            min_value=1,
            message="Las porciones deben ser un entero mayor o igual a uno.",
        ),
        "prep_time_minutes": prep_time_minutes,
        "cook_time_minutes": cook_time_minutes,
        "total_time_minutes": total_time_minutes,
        "ingredients": _build_recipe_ingredients(
            payload.get("ingredients", _get_existing(existing, "ingredients") or []),
            metadata,
        ),
        "steps": _build_recipe_steps(payload.get("steps", _get_existing(existing, "steps") or [])),
    }

    if not recipe_data["ingredients"]:
        raise CatalogValidationError("La receta debe incluir al menos un ingrediente.")

    return recipe_data


def _build_recipe_ingredients(raw_ingredients: list, metadata: dict):
    """Valida la lista de ingredientes de una receta."""
    if not isinstance(raw_ingredients, list):
        raise CatalogValidationError("La lista de ingredientes debe enviarse como arreglo.")

    valid_ingredient_ids = {
        item["id"]
        for item in fetch_admin_ingredient_catalog()
        if item["is_active"]
    }
    normalized_ingredients = []

    for index, ingredient in enumerate(raw_ingredients, start=1):
        if not isinstance(ingredient, dict):
            raise CatalogValidationError(
                f"El ingrediente #{index} debe ser un objeto con sus propiedades."
            )

        ingredient_id = _validate_id(
            ingredient.get("ingredient_id"),
            valid_ingredient_ids,
            f"El ingrediente #{index} no existe o esta inactivo.",
        )

        normalized_ingredients.append(
            {
                "ingredient_id": ingredient_id,
                "quantity": _optional_decimal(
                    ingredient.get("quantity"),
                    f"La cantidad del ingrediente #{index} no es valida.",
                ),
                "preparation_note": _optional_text(ingredient.get("preparation_note")),
                "is_optional": _optional_bool(ingredient.get("is_optional"), default=False),
            }
        )

    return normalized_ingredients


def _build_recipe_steps(raw_steps: list):
    """Valida y ordena la lista de pasos de una receta."""
    if not isinstance(raw_steps, list):
        raise CatalogValidationError("La lista de pasos debe enviarse como arreglo.")

    normalized_steps = []
    for index, step in enumerate(raw_steps, start=1):
        if not isinstance(step, dict):
            raise CatalogValidationError(
                f"El paso #{index} debe ser un objeto con sus propiedades."
            )

        normalized_steps.append(
            {
                "step_number": index,
                "instruction": _required_text(
                    step.get("instruction"),
                    f"La instruccion del paso #{index} es obligatoria.",
                ),
                "estimated_minutes": _optional_int(
                    step.get("estimated_minutes"),
                    min_value=0,
                    message=f"El tiempo estimado del paso #{index} debe ser entero y positivo.",
                ),
            }
        )

    return normalized_steps


def _resolve_recipe_status_id(payload: dict, metadata: dict, existing: dict | None):
    """Acepta recipe_status_id o status_code para mayor flexibilidad del front."""
    status_id = payload.get("recipe_status_id", _get_existing(existing, "recipe_status_id"))
    if status_id is not None:
        return _validate_id(
            status_id,
            _active_ids(metadata["recipe_statuses"]),
            "El estatus de la receta es obligatorio y debe existir.",
        )

    status_code = payload.get("status_code", _get_existing(existing, "status_code") or "published")
    return _find_id_by_code(
        metadata["recipe_statuses"],
        status_code,
        "El codigo de estatus de la receta no existe o esta inactivo.",
    )


def _translate_integrity_error(error: IntegrityError):
    """Convierte errores SQL comunes en mensajes legibles."""
    error_message = str(error).lower()
    if "slug" in error_message and "duplicate" in error_message:
        return "Ya existe otro registro con el mismo slug."
    if "foreign key" in error_message:
        return "Alguna relacion referenciada no existe o no puede usarse."
    if "uq_recipe_ingredient" in error_message:
        return "La receta no puede repetir el mismo ingrediente con la misma nota."
    return "No fue posible guardar la informacion del catalogo."


def _slugify(value: str):
    """Genera slugs ASCII estables para nombres libres."""
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").lower()
    ascii_value = re.sub(r"[^a-z0-9]+", "-", ascii_value)
    return ascii_value.strip("-")


def _required_text(value, message: str):
    """Valida textos obligatorios y elimina espacios sobrantes."""
    normalized = _optional_text(value)
    if not normalized:
        raise CatalogValidationError(message)
    return normalized


def _optional_text(value):
    """Normaliza textos opcionales vacios a None."""
    if value is None:
        return None
    if not isinstance(value, str):
        value = str(value)
    value = value.strip()
    return value or None


def _validate_id(value, valid_ids: set[int], message: str):
    """Convierte y valida ids obligatorios."""
    try:
        normalized = int(value)
    except (TypeError, ValueError):
        raise CatalogValidationError(message) from None

    if normalized not in valid_ids:
        raise CatalogValidationError(message)

    return normalized


def _optional_id(value, valid_ids: set[int], message: str):
    """Convierte y valida ids opcionales."""
    if value in (None, ""):
        return None
    return _validate_id(value, valid_ids, message)


def _optional_int(value, min_value: int, message: str):
    """Convierte enteros opcionales aplicando un minimo permitido."""
    if value in (None, ""):
        return None

    try:
        normalized = int(value)
    except (TypeError, ValueError):
        raise CatalogValidationError(message) from None

    if normalized < min_value:
        raise CatalogValidationError(message)

    return normalized


def _optional_decimal(value, message: str):
    """Convierte cantidades opcionales a decimal preservando precision."""
    if value in (None, ""):
        return None

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise CatalogValidationError(message) from None


def _optional_bool(value, default: bool):
    """Convierte banderas opcionales aceptando strings comunes."""
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "1", "si", "yes"}:
            return True
        if normalized in {"false", "0", "no"}:
            return False
    return bool(value)


def _active_ids(items: list[dict]):
    """Construye el conjunto de ids activos de un catalogo auxiliar."""
    return {item["id"] for item in items if item.get("is_active", 1)}


def _find_id_by_code(items: list[dict], code: str, message: str):
    """Busca el id correspondiente a un codigo activo."""
    for item in items:
        if item.get("code") == code and item.get("is_active", 1):
            return item["id"]
    raise CatalogValidationError(message)


def _get_existing(existing: dict | None, key: str):
    """Recupera un valor previo durante una actualizacion parcial."""
    if not existing:
        return None
    return existing.get(key)
