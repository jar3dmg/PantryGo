"""Carga recetas desde CSV cuando MySQL no esta disponible."""

import ast
import csv
from pathlib import Path

from ..utils.ingredient_cleaner import clean_ingredient


def _safe_literal_list(raw_value):
    """Convierte texto serializado a lista sin romper el proceso completo."""
    parsed_value = ast.literal_eval(raw_value)
    return parsed_value if isinstance(parsed_value, list) else []


def load_recipes(csv_path: str | Path):
    """Lee el CSV y adapta cada fila al formato de receta usado por la app."""
    recipes = []
    csv_path = Path(csv_path)

    if not csv_path.exists():
        print(f"WARNING: No se encontro el archivo de recetas en {csv_path}")
        return recipes

    with csv_path.open(mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        row_count = 1

        for row in reader:
            row_count += 1

            try:
                recipe_name = row["recipe_title"]
                ingredients_list_raw = _safe_literal_list(row["ingredients"])
                directions_list = _safe_literal_list(row["directions"])
                description = row.get("description", "")

                # Genera un set limpio para facilitar las comparaciones posteriores.
                recipe_ingredients_cleaned_set = set()
                for raw_ingredient in ingredients_list_raw:
                    clean_name = clean_ingredient(raw_ingredient)
                    if clean_name:
                        recipe_ingredients_cleaned_set.add(clean_name)

                if recipe_ingredients_cleaned_set:
                    recipes.append(
                        {
                            "id": row_count,
                            "name": recipe_name,
                            "slug": clean_ingredient(recipe_name).replace(" ", "-"),
                            "short_description": description,
                            "description": description,
                            "ingredients": [
                                {
                                    "name": ingredient,
                                    "slug": clean_ingredient(ingredient).replace(" ", "-"),
                                    "quantity": None,
                                    "unit_name": None,
                                    "unit_symbol": None,
                                    "preparation_note": None,
                                    "is_optional": False,
                                }
                                for ingredient in ingredients_list_raw
                            ],
                            "ingredient_terms": recipe_ingredients_cleaned_set,
                            "steps": [
                                {
                                    "number": index + 1,
                                    "instruction": step,
                                    "estimated_minutes": None,
                                }
                                for index, step in enumerate(directions_list)
                            ],
                        }
                    )
            except Exception as error:
                print(f"ADVERTENCIA: Saltando fila {row_count} por error: {error}")

    return recipes


def build_ingredient_catalog_from_recipes(recipes: list[dict]):
    """Construye un catalogo simple de ingredientes desde las recetas cargadas."""
    catalog = {}

    for recipe in recipes:
        for ingredient in recipe.get("ingredients", []):
            slug = ingredient["slug"]
            if slug not in catalog:
                catalog[slug] = {
                    "id": len(catalog) + 1,
                    "name": ingredient["name"],
                    "slug": slug,
                    "category_name": "Ingredientes generales",
                    "category_slug": "ingredientes-generales",
                }

    return sorted(catalog.values(), key=lambda item: item["name"])
