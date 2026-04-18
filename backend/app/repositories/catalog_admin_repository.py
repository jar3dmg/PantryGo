"""Persistencia ORM de catalogos administrativos para ingredientes y recetas."""

from sqlalchemy.orm import joinedload, selectinload

from ..extensions import db
from ..models import (
    CatalogRecipeDifficulty,
    CatalogRecipeStatus,
    Ingredient,
    IngredientCategory,
    Recipe,
    RecipeCategory,
    RecipeIngredient,
    RecipeStep,
)


def fetch_catalog_metadata():
    """Devuelve catalogos de apoyo requeridos por el CRUD administrativo."""
    return {
        "ingredient_categories": [
            {
                "id": category.ingredient_category_id,
                "name": category.name,
                "slug": category.slug,
                "is_active": bool(category.is_active),
            }
            for category in (
                IngredientCategory.query
                .filter(IngredientCategory.is_active.is_(True))
                .order_by(IngredientCategory.name.asc())
                .all()
            )
        ],
        "recipe_categories": [
            {
                "id": category.recipe_category_id,
                "name": category.name,
                "slug": category.slug,
                "is_active": bool(category.is_active),
            }
            for category in (
                RecipeCategory.query
                .filter(RecipeCategory.is_active.is_(True))
                .order_by(RecipeCategory.name.asc())
                .all()
            )
        ],
        "recipe_difficulties": [
            {
                "id": difficulty.recipe_difficulty_id,
                "code": difficulty.code,
                "name": difficulty.name,
                "sort_order": difficulty.sort_order,
                "is_active": bool(difficulty.is_active),
            }
            for difficulty in (
                CatalogRecipeDifficulty.query
                .filter(CatalogRecipeDifficulty.is_active.is_(True))
                .order_by(
                    CatalogRecipeDifficulty.sort_order.asc(),
                    CatalogRecipeDifficulty.name.asc(),
                )
                .all()
            )
        ],
        "recipe_statuses": [
            {
                "id": status.recipe_status_id,
                "code": status.code,
                "name": status.name,
                "is_active": bool(status.is_active),
            }
            for status in (
                CatalogRecipeStatus.query
                .filter(CatalogRecipeStatus.is_active.is_(True))
                .order_by(CatalogRecipeStatus.name.asc())
                .all()
            )
        ],
    }


def fetch_admin_ingredient_catalog():
    """Lista ingredientes con informacion ampliada para administracion."""
    ingredients = (
        Ingredient.query.options(
            joinedload(Ingredient.category),
        )
        .order_by(Ingredient.name.asc())
        .all()
    )
    return [_serialize_ingredient(ingredient) for ingredient in ingredients]


def fetch_admin_ingredient_by_id(ingredient_id: int):
    """Obtiene un ingrediente puntual con sus relaciones principales."""
    ingredient = (
        Ingredient.query.options(
            joinedload(Ingredient.category),
        )
        .filter_by(ingredient_id=ingredient_id)
        .one_or_none()
    )
    return _serialize_ingredient(ingredient) if ingredient else None


def create_ingredient(ingredient_data: dict):
    """Inserta un ingrediente nuevo y devuelve su version persistida."""
    ingredient = Ingredient(**ingredient_data)
    db.session.add(ingredient)
    db.session.commit()
    return fetch_admin_ingredient_by_id(ingredient.ingredient_id)


def update_ingredient(ingredient_id: int, ingredient_data: dict):
    """Actualiza un ingrediente existente y devuelve su estado final."""
    ingredient = Ingredient.query.filter_by(ingredient_id=ingredient_id).one()
    for key, value in ingredient_data.items():
        setattr(ingredient, key, value)
    db.session.commit()
    return fetch_admin_ingredient_by_id(ingredient.ingredient_id)


def deactivate_ingredient(ingredient_id: int):
    """Desactiva un ingrediente para ocultarlo del catalogo operativo."""
    ingredient = Ingredient.query.filter_by(ingredient_id=ingredient_id).one()
    ingredient.is_active = False
    db.session.commit()
    return fetch_admin_ingredient_by_id(ingredient.ingredient_id)


def fetch_admin_recipe_catalog():
    """Lista todas las recetas con su detalle, sin filtrar por estatus."""
    recipes = _admin_recipe_query().order_by(Recipe.recipe_id.asc()).all()
    return [_serialize_admin_recipe(recipe) for recipe in recipes]


def fetch_admin_recipe_by_id(recipe_id: int):
    """Obtiene una receta por id con sus ingredientes y pasos."""
    recipe = _admin_recipe_query().filter(Recipe.recipe_id == recipe_id).one_or_none()
    return _serialize_admin_recipe(recipe) if recipe else None


def create_recipe(recipe_data: dict):
    """Inserta una receta nueva junto con sus ingredientes y pasos."""
    recipe = Recipe(
        recipe_status_id=recipe_data["recipe_status_id"],
        recipe_difficulty_id=recipe_data["recipe_difficulty_id"],
        recipe_category_id=recipe_data["recipe_category_id"],
        title=recipe_data["title"],
        slug=recipe_data["slug"],
        short_description=recipe_data["short_description"],
        description=recipe_data["description"],
        servings=recipe_data["servings"],
        prep_time_minutes=recipe_data["prep_time_minutes"],
        cook_time_minutes=recipe_data["cook_time_minutes"],
        total_time_minutes=recipe_data["total_time_minutes"],
    )
    db.session.add(recipe)
    db.session.flush()
    _replace_recipe_children(recipe, recipe_data)
    db.session.commit()
    return fetch_admin_recipe_by_id(recipe.recipe_id)


def update_recipe(recipe_id: int, recipe_data: dict):
    """Actualiza una receta y reemplaza por completo sus listas hijas."""
    recipe = Recipe.query.filter_by(recipe_id=recipe_id).one()
    recipe.recipe_status_id = recipe_data["recipe_status_id"]
    recipe.recipe_difficulty_id = recipe_data["recipe_difficulty_id"]
    recipe.recipe_category_id = recipe_data["recipe_category_id"]
    recipe.title = recipe_data["title"]
    recipe.slug = recipe_data["slug"]
    recipe.short_description = recipe_data["short_description"]
    recipe.description = recipe_data["description"]
    recipe.servings = recipe_data["servings"]
    recipe.prep_time_minutes = recipe_data["prep_time_minutes"]
    recipe.cook_time_minutes = recipe_data["cook_time_minutes"]
    recipe.total_time_minutes = recipe_data["total_time_minutes"]

    recipe.ingredients.clear()
    recipe.steps.clear()
    db.session.flush()

    _replace_recipe_children(recipe, recipe_data)
    db.session.commit()
    return fetch_admin_recipe_by_id(recipe.recipe_id)


def archive_recipe(recipe_id: int, archived_status_id: int):
    """Marca una receta como archivada para retirarla del catalogo visible."""
    recipe = Recipe.query.filter_by(recipe_id=recipe_id).one()
    recipe.recipe_status_id = archived_status_id
    db.session.commit()
    return fetch_admin_recipe_by_id(recipe.recipe_id)


def _admin_recipe_query():
    """Consulta base para listar recetas administrativas con relaciones eager-loaded."""
    return Recipe.query.options(
        joinedload(Recipe.status),
        joinedload(Recipe.category),
        joinedload(Recipe.difficulty),
        selectinload(Recipe.ingredients).joinedload(RecipeIngredient.ingredient),
        selectinload(Recipe.steps),
    )


def _replace_recipe_children(recipe: Recipe, recipe_data: dict):
    """Inserta ingredientes y pasos para una receta ya creada."""
    for ingredient in recipe_data["ingredients"]:
        recipe.ingredients.append(
            RecipeIngredient(
                ingredient_id=ingredient["ingredient_id"],
                quantity=ingredient["quantity"],
                preparation_note=ingredient["preparation_note"],
                is_optional=ingredient["is_optional"],
            )
        )

    for step in recipe_data["steps"]:
        recipe.steps.append(
            RecipeStep(
                step_number=step["step_number"],
                instruction=step["instruction"],
                estimated_minutes=step["estimated_minutes"],
            )
        )


def _serialize_ingredient(ingredient: Ingredient | None):
    """Normaliza el formato de salida para ingredientes administrativos."""
    if ingredient is None:
        return None

    return {
        "id": ingredient.ingredient_id,
        "name": ingredient.name,
        "slug": ingredient.slug,
        "description": ingredient.description,
        "ingredient_category_id": ingredient.ingredient_category_id,
        "is_active": bool(ingredient.is_active),
        "category_name": ingredient.category.name if ingredient.category else None,
        "category_slug": ingredient.category.slug if ingredient.category else None,
    }


def _serialize_admin_recipe(recipe: Recipe | None):
    """Reconstruye el formato JSON administrativo desde ORM."""
    if recipe is None:
        return None

    return {
        "id": recipe.recipe_id,
        "title": recipe.title,
        "slug": recipe.slug,
        "short_description": recipe.short_description,
        "description": recipe.description,
        "recipe_status_id": recipe.recipe_status_id,
        "recipe_difficulty_id": recipe.recipe_difficulty_id,
        "recipe_category_id": recipe.recipe_category_id,
        "status_code": recipe.status.code if recipe.status else None,
        "status_name": recipe.status.name if recipe.status else None,
        "category_name": recipe.category.name if recipe.category else None,
        "difficulty_name": recipe.difficulty.name if recipe.difficulty else None,
        "servings": recipe.servings,
        "prep_time_minutes": recipe.prep_time_minutes,
        "cook_time_minutes": recipe.cook_time_minutes,
        "total_time_minutes": recipe.total_time_minutes,
        "ingredients": [
            {
                "recipe_ingredient_id": recipe_ingredient.recipe_ingredient_id,
                "ingredient_id": recipe_ingredient.ingredient_id,
                "ingredient_name": recipe_ingredient.ingredient.name if recipe_ingredient.ingredient else None,
                "ingredient_slug": recipe_ingredient.ingredient.slug if recipe_ingredient.ingredient else None,
                "quantity": float(recipe_ingredient.quantity) if recipe_ingredient.quantity is not None else None,
                "preparation_note": recipe_ingredient.preparation_note,
                "is_optional": bool(recipe_ingredient.is_optional),
            }
            for recipe_ingredient in recipe.ingredients
        ],
        "steps": [
            {
                "recipe_step_id": step.recipe_step_id,
                "step_number": step.step_number,
                "instruction": step.instruction,
                "estimated_minutes": step.estimated_minutes,
            }
            for step in sorted(recipe.steps, key=lambda item: item.step_number)
        ],
    }
