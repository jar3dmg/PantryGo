"""Reglas de negocio para filtrar recetas por inventario."""

from typing import Iterable

from ..utils.ingredient_cleaner import clean_ingredient


def normalize_ingredient_list(raw_text: str) -> set[str]:
    """Convierte texto separado por comas en un conjunto limpio de ingredientes."""
    cleaned_values = set()
    for part in raw_text.split(","):
        stripped = part.strip().lower()
        if not stripped:
            continue
        cleaned = clean_ingredient(stripped)
        if cleaned:
            cleaned_values.add(cleaned)
    return cleaned_values


def _matches_term(search_term: str, candidate_terms: set[str]) -> bool:
    """Permite coincidencias exactas o parciales entre terminos normalizados."""
    return any(
        search_term == candidate or search_term in candidate or candidate in search_term
        for candidate in candidate_terms
    )


def find_recipes_by_inventory(
    available_ingredients: set[str],
    banned_ingredients: set[str],
    all_recipes: Iterable[dict],
):
    """Separa las recetas en disponibles, sugeridas y bloqueadas."""
    available_now = []
    suggestions = []
    blocked = []

    for recipe in all_recipes:
        ingredient_terms = recipe.get("ingredient_terms", set())

        blocked_ingredients = sorted(
            banned
            for banned in banned_ingredients
            if _matches_term(banned, ingredient_terms)
        )
        if blocked_ingredients:
            blocked_recipe = recipe.copy()
            blocked_recipe["blocked_by"] = blocked_ingredients
            blocked.append(blocked_recipe)
            continue

        missing_required_ingredients = []
        missing_ingredients = []
        matched_ingredients = []

        # Compara cada ingrediente de la receta contra el inventario disponible.
        for ingredient in recipe.get("ingredients", []):
            ingredient_terms = {
                ingredient["name"].lower(),
                ingredient["slug"].replace("-", " ").lower(),
            }
            is_matched = any(
                _matches_term(available, ingredient_terms)
                for available in available_ingredients
            )

            if is_matched:
                matched_ingredients.append(ingredient["name"])
                continue

            missing_ingredients.append(ingredient["name"])
            if not ingredient["is_optional"]:
                missing_required_ingredients.append(ingredient["name"])

        missing_ingredients.sort()
        missing_required_ingredients.sort()
        matched_ingredients.sort()

        recipe_data = recipe.copy()
        recipe_data["missing_ingredients"] = missing_ingredients
        recipe_data["missing_required_ingredients"] = missing_required_ingredients
        recipe_data["matched_ingredients"] = matched_ingredients
        recipe_data["match_score"] = len(matched_ingredients)

        if not missing_required_ingredients:
            available_now.append(recipe_data)
        else:
            suggestions.append(recipe_data)

    available_now.sort(key=lambda item: (-item["match_score"], item["name"]))
    suggestions.sort(
        key=lambda item: (
            len(item["missing_required_ingredients"]),
            len(item["missing_ingredients"]),
            -item["match_score"],
            item["name"],
        )
    )
    blocked.sort(key=lambda item: (len(item["blocked_by"]), item["name"]))

    return available_now, suggestions, blocked
