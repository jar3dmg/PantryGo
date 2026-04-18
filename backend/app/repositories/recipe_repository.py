"""Consultas ORM del catalogo publico de recetas."""

from sqlalchemy.orm import joinedload, selectinload

from ..models import Recipe, RecipeIngredient


def fetch_recipe_catalog():
    """Obtiene recetas publicadas con ingredientes y pasos listos para el front."""
    recipes = (
        Recipe.query.options(
            joinedload(Recipe.status),
            joinedload(Recipe.category),
            joinedload(Recipe.difficulty),
            selectinload(Recipe.ingredients).joinedload(RecipeIngredient.ingredient),
            selectinload(Recipe.steps),
        )
        .join(Recipe.status)
        .filter(Recipe.status.has(code="published"))
        .order_by(Recipe.recipe_id.asc())
        .all()
    )

    return [_serialize_public_recipe(recipe) for recipe in recipes]


def _serialize_public_recipe(recipe: Recipe):
    """Adapta una receta ORM al formato de consumo actual del frontend."""
    ingredient_terms = set()
    serialized_ingredients = []

    for recipe_ingredient in recipe.ingredients:
        ingredient = recipe_ingredient.ingredient
        if ingredient is None:
            continue

        serialized_ingredients.append(
            {
                "name": ingredient.name,
                "slug": ingredient.slug,
                "quantity": float(recipe_ingredient.quantity) if recipe_ingredient.quantity is not None else None,
                "preparation_note": recipe_ingredient.preparation_note,
                "is_optional": bool(recipe_ingredient.is_optional),
            }
        )
        ingredient_terms.add(ingredient.name.lower())
        ingredient_terms.add(ingredient.slug.replace("-", " ").lower())

    return {
        "id": recipe.recipe_id,
        "name": recipe.title,
        "slug": recipe.slug,
        "short_description": recipe.short_description,
        "description": recipe.description,
        "category_name": recipe.category.name if recipe.category else None,
        "difficulty_name": recipe.difficulty.name if recipe.difficulty else None,
        "servings": recipe.servings,
        "prep_time_minutes": recipe.prep_time_minutes,
        "cook_time_minutes": recipe.cook_time_minutes,
        "total_time_minutes": recipe.total_time_minutes,
        "ingredients": serialized_ingredients,
        "ingredient_terms": ingredient_terms,
        "steps": [
            {
                "number": step.step_number,
                "instruction": step.instruction,
                "estimated_minutes": step.estimated_minutes,
            }
            for step in recipe.steps
        ],
    }
