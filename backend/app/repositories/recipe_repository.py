"""Consultas de recetas publicadas desde MySQL."""

from collections import OrderedDict

import pymysql
from pymysql.cursors import DictCursor


def get_connection(db_config: dict):
    """Abre una conexion a MySQL usando cursores de tipo diccionario."""
    connection_config = db_config.copy()
    connection_config["cursorclass"] = DictCursor
    return pymysql.connect(**connection_config)


def fetch_recipe_catalog(db_config: dict):
    """Obtiene recetas, ingredientes y pasos y los reagrupa en memoria."""
    query = """
        SELECT
            r.recipe_id,
            r.title,
            r.slug,
            r.short_description,
            r.description,
            r.servings,
            r.prep_time_minutes,
            r.cook_time_minutes,
            r.total_time_minutes,
            rc.name AS category_name,
            rd.name AS difficulty_name,
            ri.quantity,
            ri.preparation_note,
            ri.is_optional,
            mu.name AS measurement_unit_name,
            mu.symbol AS measurement_unit_symbol,
            i.ingredient_id,
            i.name AS ingredient_name,
            i.slug AS ingredient_slug,
            step.recipe_step_id,
            step.step_number,
            step.instruction,
            step.estimated_minutes
        FROM recipes AS r
        INNER JOIN catalog_recipe_statuses AS rs
            ON rs.recipe_status_id = r.recipe_status_id
        LEFT JOIN recipe_categories AS rc
            ON rc.recipe_category_id = r.recipe_category_id
        LEFT JOIN catalog_recipe_difficulties AS rd
            ON rd.recipe_difficulty_id = r.recipe_difficulty_id
        LEFT JOIN recipe_ingredients AS ri
            ON ri.recipe_id = r.recipe_id
        LEFT JOIN ingredients AS i
            ON i.ingredient_id = ri.ingredient_id
        LEFT JOIN catalog_measurement_units AS mu
            ON mu.measurement_unit_id = ri.measurement_unit_id
        LEFT JOIN recipe_steps AS step
            ON step.recipe_id = r.recipe_id
        WHERE rs.code = 'published'
        ORDER BY r.recipe_id, step.step_number, ri.recipe_ingredient_id
    """

    with get_connection(db_config) as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

    # Reagrupa las filas para reconstruir cada receta con sus listas hijas.
    recipes_by_id = OrderedDict()

    for row in rows:
        recipe_id = row["recipe_id"]
        if recipe_id not in recipes_by_id:
            recipes_by_id[recipe_id] = {
                "id": recipe_id,
                "name": row["title"],
                "slug": row["slug"],
                "short_description": row["short_description"],
                "description": row["description"],
                "category_name": row["category_name"],
                "difficulty_name": row["difficulty_name"],
                "servings": row["servings"],
                "prep_time_minutes": row["prep_time_minutes"],
                "cook_time_minutes": row["cook_time_minutes"],
                "total_time_minutes": row["total_time_minutes"],
                "ingredients": [],
                "ingredient_terms": set(),
                "steps": [],
                "_step_ids": set(),
                "_ingredient_keys": set(),
            }

        recipe = recipes_by_id[recipe_id]

        if row["ingredient_id"] is not None:
            ingredient_key = (
                row["ingredient_id"],
                row["quantity"],
                row["preparation_note"],
            )
            if ingredient_key not in recipe["_ingredient_keys"]:
                recipe["_ingredient_keys"].add(ingredient_key)
                ingredient_name = row["ingredient_name"]
                ingredient_slug = row["ingredient_slug"]
                recipe["ingredients"].append(
                    {
                        "name": ingredient_name,
                        "slug": ingredient_slug,
                        "quantity": row["quantity"],
                        "unit_name": row["measurement_unit_name"],
                        "unit_symbol": row["measurement_unit_symbol"],
                        "preparation_note": row["preparation_note"],
                        "is_optional": bool(row["is_optional"]),
                    }
                )
                recipe["ingredient_terms"].add(ingredient_name.lower())
                recipe["ingredient_terms"].add(ingredient_slug.replace("-", " ").lower())

        if row["recipe_step_id"] is not None and row["recipe_step_id"] not in recipe["_step_ids"]:
            recipe["_step_ids"].add(row["recipe_step_id"])
            recipe["steps"].append(
                {
                    "number": row["step_number"],
                    "instruction": row["instruction"],
                    "estimated_minutes": row["estimated_minutes"],
                }
            )

    cleaned_recipes = []
    for recipe in recipes_by_id.values():
        recipe.pop("_step_ids", None)
        recipe.pop("_ingredient_keys", None)
        cleaned_recipes.append(recipe)

    return cleaned_recipes
